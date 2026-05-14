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
  return (
    <div className="w-full max-w-2xl p-4 mb-6 rounded-2xl shadow-md bg-zinc-900/80 ring-1 ring-zinc-800 border border-zinc-800 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-lg font-medium text-white leading-snug">
            {title}
          </h3>
          <div className="text-xs text-slate-400 mt-1">ID: {id}</div>
          <div className="flex items-center gap-3 mt-2">
            {status && (
              <span
                className={`text-xs font-semibold px-2 py-1 rounded-full ${
                  status.toLowerCase().includes("solved")
                    ? "bg-emerald-800 text-emerald-200"
                    : status.toLowerCase().includes("partial")
                      ? "bg-yellow-800 text-yellow-200"
                      : "bg-rose-800 text-rose-200"
                }`}
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
        <div className="flex-shrink-0">
          <Link to={`/contests/${Contestid}/challenges/${id}`}>
            <Buttonv2 text="Solve" ApiCall={async () => {}} funct={() => {}} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ChallengeCard;
