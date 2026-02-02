import React from "react";
import toast from "react-hot-toast";
import RedButton from "./component/elements/RedButton";

const ContestCard = ({ contest, admin, contests, SetContests }) => {
  const { title, description, id, startTime, endTime } = contest;
  const formatDateTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };
  const enterContest = async () => {
    try {
      const allowed = await fetch(
        `http://localhost:3000/api/contests/getTime/${id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            startTime,
          }),
          credentials: "include",
        },
      );
      const content = await allowed.json();
      if (content.ok) window.location.href = `/contests/${id}`;
      else {
        toast.error("This Contest has not started yet");
      }
    } catch (err) {
      console.log(err);
    }
  };
  const DeleteContest = async () => {
    try {
      const res = await fetch(`http://localhost:3000/api/deleteContest/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      return res.json();
    } catch (err) {
      console.log(err);
      return false;
    }
  };
  const handleDelete = async () => {
    const isDeleted = await DeleteContest();
    if (isDeleted.ok) {
      // Filter out the deleted contest from the list
      SetContests((prevContests) => prevContests.filter((e) => e.id !== id));
      console.log(contests);
    } else {
      if (isDeleted.msg) {
        toast.error(isDeleted.msg);
      }
    }
  };

  return (
    <div className="w-full max-w-2xl mb-6 rounded-xl p-[1px] bg-gradient-to-tr from-blue-500 via-pink-500 to-purple-500 shadow-lg">
      <div className="bg-zinc-950 rounded-xl p-6">
        <div className="flex flex-col gap-3">
          <h1 className="text-xl font-semibold text-gray-100">{title}</h1>
          <p className="text-gray-300 text-base">{description}</p>
          <div className="flex justify-between text-sm text-gray-400 mt-2">
            <span>
              <strong className="text-gray-200">Start:</strong>{" "}
              {formatDateTime(startTime)}
            </span>
            <span>
              <strong className="text-gray-200">End:</strong>{" "}
              {formatDateTime(endTime)}
            </span>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            {admin ? <RedButton funct={handleDelete} text="Delete" /> : null}
            <button
              onClick={enterContest}
              className="relative inline-flex h-12 overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50"
            >
              <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
              <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950 px-3 py-1 text-sm font-medium text-white backdrop-blur-3xl">
                View Contest
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContestCard;
