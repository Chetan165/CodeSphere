import React from "react";
import { useState, useEffect } from "react";
import ContestCard from "./ContestCard";
import UserAuth from "./UserAuth";
import Buttonv2 from "./component/ui/Buttonv2";

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

  const summaryCountClass =
    "inline-flex items-center rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs font-medium text-slate-200";

  return User && User.uid ? (
    <div className="w-full min-h-screen bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.16),transparent_28%),linear-gradient(180deg,#050505_0%,#09090b_42%,#020202_100%)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-screen-2xl flex-col gap-6">
        <header className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 px-5 py-5 shadow-[0_18px_50px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                Contests
              </h1>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={summaryCountClass}>
              {upcoming.length} upcoming
            </span>
            <span className={summaryCountClass}>{ongoing.length} live</span>
            <span className={summaryCountClass}>{past.length} past</span>
            <Buttonv2
              text={refreshing ? "Refreshing..." : "Refresh"}
              ApiCall={handleRefresh}
              variant="green"
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200 hover:bg-white/10"
            ></Buttonv2>
          </div>
        </header>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(340px,0.9fr)] xl:items-start">
          <section className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.24)] backdrop-blur-xl sm:p-6 xl:row-span-2">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="inline-block h-2 w-2 rounded-full bg-sky-400" />
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-200">
                  Ongoing
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-200">
                  Live now
                </span>
                <span className="inline-flex items-center rounded-full border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 text-xs font-semibold text-rose-200">
                  LIVE
                </span>
              </div>
            </div>
            <div className="border-t border-white/10 pt-4">
              {ongoing && ongoing.length > 0 ? (
                <div className="space-y-4">
                  {ongoing.map((item) => (
                    <ContestCard
                      key={item.id}
                      contest={item}
                      admin={User.admin}
                      contests={contests}
                      SetContests={SetContests}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 px-4 py-6 text-sm text-slate-400">
                  No ongoing contests
                </div>
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.24)] backdrop-blur-xl sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="inline-block h-2 w-2 rounded-full bg-rose-400" />
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-200">
                  Upcoming
                </h3>
              </div>
              <div className="text-xs text-slate-400">Next</div>
            </div>
            <div className="border-t border-white/10 pt-4">
              {upcoming && upcoming.length > 0 ? (
                <div className="max-h-80 space-y-3 overflow-y-auto pr-1">
                  {upcoming.map((u) => (
                    <ContestCard
                      key={u.id}
                      contest={u}
                      admin={User.admin}
                      contests={contests}
                      SetContests={SetContests}
                      compact={true}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 px-4 py-6 text-sm text-slate-400">
                  No upcoming contests
                </div>
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.24)] backdrop-blur-xl sm:p-6 xl:col-start-2">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="inline-block h-2 w-2 rounded-full bg-slate-400" />
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-200">
                  Past Contests
                </h3>
              </div>
              <button
                onClick={() => setShowPast((s) => !s)}
                className="flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-sm text-slate-300 transition-colors hover:bg-white/5 focus:outline-none"
                aria-expanded={showPast}
              >
                <span className="text-xs text-slate-400">
                  {past.length} total
                </span>
                <svg
                  className={`h-4 w-4 transition-transform duration-200 ${showPast ? "rotate-180" : ""}`}
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
            <div className="border-t border-white/10 pt-4">
              <div
                className={`overflow-hidden transition-all duration-300 ${showPast ? "max-h-[32rem]" : "max-h-0"}`}
              >
                <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
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
                    <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 px-4 py-6 text-sm text-slate-400">
                      No past contests
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  ) : (
    <div></div>
  );
};

export default Contest;
