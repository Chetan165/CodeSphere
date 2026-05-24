import React, { useCallback, useEffect } from "react";
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

  const fetchChallenges = useCallback(async () => {
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
  }, [ContestId]);

  useEffect(() => {
    UserAuth(setUser);
    fetchChallenges();
  }, [fetchChallenges]);

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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.12),transparent_28%),linear-gradient(180deg,#050505_0%,#09090b_55%,#020202_100%)] overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <header className="rounded-3xl border border-white/10 bg-white/5 px-5 py-5 shadow-[0_18px_50px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-[0.25em] text-cyan-300/80">
                Contest challenges
              </p>
              <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                {contestMeta?.title || "Contest"}
              </h2>
            </div>
            <div className="text-sm text-slate-400">
              {Challenges.length} challenge{Challenges.length === 1 ? "" : "s"}
            </div>
          </div>
        </header>

        <main className="space-y-4 pb-6">
          {Challenges.map((val) => (
            <ChallengeCard
              key={val.id}
              id={val.id}
              Contestid={ContestId}
              title={val.title}
              userScore={val.userScore}
              status={val.status}
              maxScore={val.maxScore ?? val.scoreWeight ?? val.maxScore}
            />
          ))}
          {Challenges.length === 0 && (
            <div className="rounded-3xl border border-dashed border-white/10 bg-white/5 px-5 py-8 text-sm text-slate-400 shadow-[0_18px_50px_rgba(0,0,0,0.18)] backdrop-blur-xl">
              No challenges are available for this contest yet.
            </div>
          )}
        </main>
      </div>
    </div>
  ) : (
    <div></div>
  );
};

export default ContestChallenges;
