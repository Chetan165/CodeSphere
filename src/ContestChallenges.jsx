import React, { useEffect } from "react";
import { useState } from "react";
import toast from "react-hot-toast";
import ChallengeCard from "./ChallengeCard";
import { useParams } from "react-router-dom";
import UserAuth from "./UserAuth";
const backendURL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

const ContestChallenges = () => {
  const [User, setUser] = useState();
  const [Challenges, SetChallenges] = useState([]);
  const [contestMeta, setContestMeta] = useState(null);
  const ContestId = useParams().id;

  const fetchChallenges = async () => {
    try {
      // fetch contest meta (server time + timings)
      const metaRes = await fetch(
        `${backendURL}/api/contests/${ContestId}/meta`,
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
          },
        },
      );
      if (!metaRes.ok) {
        toast.error("Failed to load contest meta");
        return;
      }
      const metaData = await metaRes.json();
      if (metaData && metaData.ok) setContestMeta(metaData.contest);

      // fetch challenge summaries (minimal fields)
      const listRes = await fetch(
        `${backendURL}/api/contests/${ContestId}/challenges`,
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
          },
        },
      );
      if (!listRes.ok) {
        toast.error("Failed to load challenges");
        return;
      }
      const listData = await listRes.json();
      if (listData && listData.ok) {
        SetChallenges(listData.challenges || []);
      } else {
        toast.error("Error Fetching Challenges");
      }
    } catch (err) {
      console.log(err);
      toast.error("Error loading contest");
    }
  };

  useEffect(() => {
    UserAuth(setUser);
    fetchChallenges();
  }, [ContestId]);

  // listen for updates from SolvePage (score/status updates) and update list in-place
  useEffect(() => {
    const handler = (e) => {
      const d = e?.detail;
      if (!d || !d.id) return;
      SetChallenges((prev) =>
        prev.map((c) =>
          c.id === d.id
            ? {
                ...c,
                userScore: d.userScore,
                status: d.status,
                maxScore: d.maxScore ?? c.maxScore,
              }
            : c,
        ),
      );
    };
    window.addEventListener("challengeUpdated", handler);
    return () => window.removeEventListener("challengeUpdated", handler);
  }, []);
  return User && User.uid ? (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black">
      <div className="w-full max-w-3xl p-6">
        <h2 className="text-xl text-white font-semibold mb-4">
          {contestMeta?.title || "Contest"}
        </h2>
        <ul>
          {Challenges.map((val) => (
            <li key={val.id}>
              <ChallengeCard
                id={val.id}
                Contestid={ContestId}
                title={val.title}
                userScore={val.userScore}
                status={val.status}
                maxScore={val.maxScore ?? val.scoreWeight ?? val.maxScore}
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  ) : (
    <div></div>
  );
};

export default ContestChallenges;
