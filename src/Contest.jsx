import React from "react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import ContestCard from "./ContestCard";
import Contest_button from "./Contest_button";
import Challenge_button from "./Challenge_button";
import UserAuth from "./UserAuth";

const Contest = () => {
  const [User, setUser] = useState();
  const [contests, SetContests] = useState([]);
  const fetchContest = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/contests", {
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

  return User && User.uid ? (
    <div className="h-full w-full flex flex-col items-center bg-black justify-start pt-10 pb-10">
      {contests?.length > 0 ? (
        contests.map((item, index) => {
          return (
            <ContestCard
              key={item.id}
              contest={item}
              admin={User.admin}
              contests={contests}
              SetContests={SetContests}
            ></ContestCard>
          );
        })
      ) : (
        <div className="">No contests</div>
      )}
    </div>
  ) : (
    <div></div>
  );
};

export default Contest;
