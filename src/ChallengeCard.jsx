import React from "react";
import Buttonv2 from "./component/ui/Buttonv2";
import { Link } from "react-router-dom";

const ChallengeCard = ({
  Contestid,
  title,
  id,
  userScore,
  status,
  maxScore,
}) => {
  const statusTone = (() => {
    const label = (status || "").toLowerCase();
    if (label.includes("solved")) {
      return "border-emerald-500/30 text-emerald-200";
    }
    if (label.includes("partial")) {
      return "border-amber-500/30 text-amber-200";
    }
    return "border-rose-500/30 text-rose-200";
  })();

  return (
    <div className="w-full rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[0_10px_24px_rgba(0,0,0,0.28)] transition-shadow hover:shadow-[0_14px_32px_rgba(0,0,0,0.36)] backdrop-blur-xl md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-medium leading-snug text-white md:text-xl">
            {title}
          </h3>
          <div className="text-xs text-slate-400 mt-1">ID: {id}</div>
          <div className="flex items-center gap-3 mt-2">
            {status && (
              <span
                className={`inline-flex items-center rounded-full border bg-black/15 px-2 py-1 text-xs font-semibold ${statusTone}`}
              >
                {status}
              </span>
            )}
            {typeof userScore !== "undefined" && userScore !== null && (
              <span className="text-xs text-slate-300 font-mono">
                {userScore}/{maxScore ?? "-"}
              </span>
            )}
          </div>
        </div>
        <div className="flex-shrink-0 self-start md:self-center">
          <Link to={`/contests/${Contestid}/challenges/${id}`}>
            <Buttonv2 text="Solve" ApiCall={async () => {}} funct={() => {}} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ChallengeCard;
