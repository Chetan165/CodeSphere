import React from 'react';

const ChallengeCard = ({Contestid,title,id}) => {

  return (
    <div className="w-full max-w-2xl p-6 mb-6 bg-white shadow-md rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="flex flex-col gap-2">
        <h1 className="text-xl font-semibold text-indigo-700 ">{title}</h1>
        <div className="mt-4 text-right">
          <a
            href={`/contests/${Contestid}/challenges/${id}`}
            className="inline-block px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
          >
            Solve Challenge
          </a>
        </div>
      </div>
    </div>
  );
};

export default ChallengeCard;
