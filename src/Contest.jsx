import React from "react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import ContestCard from "./ContestCard";
import Contest_button from "./Contest_button";
import Challenge_button from "./Challenge_button";
import UserAuth from "./UserAuth";

const backendURL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
const Contest = () => {
  const [User, setUser] = useState();
  const [contests, SetContests] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const fetchContest = async () => {
    try {
      const res = await fetch(`${backendURL}/api/contests`, {
        method: "GET",
        headers: {
          "Content-type": "application/json",
        },
        credentials: "include",
      });
      const contest = await res.json();
      if (contest) {
        SetContests(contest.contest);
      }
    } catch (err) {
      console.log(err);
    }
  };
  useEffect(() => {
    UserAuth(setUser);
    fetchContest();
  }, []);
  useEffect(() => console.log(contests), [contests]);

  const [showPast, setShowPast] = useState(false);

  const now = Date.now();
  const upcoming = contests
    .filter((c) => Date.parse(c.startTime) > now)
    .sort((a, b) => Date.parse(a.startTime) - Date.parse(b.startTime));
  const ongoing = contests.filter(
    (c) => Date.parse(c.startTime) <= now && Date.parse(c.endTime) >= now,
  );
  const past = contests
    .filter((c) => Date.parse(c.endTime) < now)
    .sort((a, b) => Date.parse(b.endTime) - Date.parse(a.endTime));

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await fetchContest();
    } finally {
      setRefreshing(false);
    }
  };

  return User && User.uid ? (
    <div className="h-full w-full flex flex-col items-center bg-black justify-start pt-10 pb-10">
      <div className="w-full max-w-4xl mb-4 flex items-center justify-between">
        <div />
        <button
          onClick={handleRefresh}
          className="text-xs text-slate-200 bg-transparent border border-white/10 px-3 py-1 rounded hover:bg-white/5"
        >
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>
      {/* Upcoming (top small card - show first upcoming if any) */}
      <section className="w-full max-w-4xl mb-6 p-4 rounded-2xl bg-gradient-to-br from-zinc-900/60 to-zinc-900/40 border border-zinc-800 shadow-sm ring-1 ring-white/3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-400/90" />
            <h3 className="text-base font-semibold uppercase tracking-wide text-slate-200">
              Upcoming
            </h3>
          </div>
          <div className="text-xs text-slate-400">Next</div>
        </div>
        <div className="border-t border-zinc-800 pt-3">
          {upcoming && upcoming.length > 0 ? (
            <ContestCard
              contest={upcoming[0]}
              admin={User.admin}
              contests={contests}
              SetContests={SetContests}
              compact={true}
              key={upcoming[0].id}
            />
          ) : (
            <div className="text-xs text-slate-500">No upcoming contests</div>
          )}
        </div>
      </section>

      {/* Ongoing (full cards) */}
      <section className="w-full max-w-4xl mb-6 p-4 rounded-2xl bg-gradient-to-br from-zinc-900/60 to-zinc-900/40 border border-zinc-800 shadow-sm ring-1 ring-white/3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-sky-400/90" />
            <h3 className="text-base font-semibold uppercase tracking-wide text-slate-200">
              Ongoing
            </h3>
          </div>
          <div className="text-xs text-slate-400">Live now</div>
        </div>
        <div className="border-t border-zinc-800 pt-3 space-y-4">
          {ongoing && ongoing.length > 0 ? (
            ongoing.map((item) => (
              <ContestCard
                key={item.id}
                contest={item}
                admin={User.admin}
                contests={contests}
                SetContests={SetContests}
              />
            ))
          ) : (
            <div className="text-xs text-slate-500">No ongoing contests</div>
          )}
        </div>
      </section>

      {/* Past contests (collapsible list of small cards) */}
      <section className="w-full max-w-4xl mb-6 p-4 rounded-2xl bg-gradient-to-br from-zinc-900/60 to-zinc-900/40 border border-zinc-800 shadow-sm ring-1 ring-white/3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-400/80" />
            <h3 className="text-base font-semibold uppercase tracking-wide text-slate-200">
              Past Contests
            </h3>
          </div>
          <button
            onClick={() => setShowPast((s) => !s)}
            className="flex items-center gap-2 text-sm text-slate-300 focus:outline-none"
            aria-expanded={showPast}
          >
            <span className="text-xs text-slate-400">{past.length} total</span>
            <svg
              className={`w-4 h-4 transition-transform duration-200 ${showPast ? "rotate-180" : ""}`}
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6 8L10 12L14 8"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
        <div className="border-t border-zinc-800 pt-3">
          <div
            className={`overflow-hidden transition-all duration-300 ${showPast ? "max-h-96" : "max-h-0"}`}
          >
            <div className="space-y-2">
              {past && past.length > 0 ? (
                past.map((p) => (
                  <ContestCard
                    key={p.id}
                    contest={p}
                    admin={User.admin}
                    contests={contests}
                    SetContests={SetContests}
                    compact={true}
                  />
                ))
              ) : (
                <div className="text-xs text-slate-500">No past contests</div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  ) : (
    <div></div>
  );
};

export default Contest;
