import React from "react";

const NoPage = () => {
  return (
    <div className="w-full min-h-screen flex flex-col items-center bg-black justify-center pt-8 pb-12 px-6">
      <h1 className="text-4xl font-bold text-white mb-4">
        404 - Page Not Found
      </h1>
      <p className="text-lg text-slate-400">
        The page you are looking for does not exist.
      </p>
    </div>
  );
};

export default NoPage;
