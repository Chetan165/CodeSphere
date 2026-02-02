import { IconLoader } from "@tabler/icons-react";
import React from "react";
import CircularSpinner from "../elements/CircularSpinner";

const Buttonv2 = ({ text, funct, step, ApiCall, loading }) => {
  return (
    <button
      onClick={async () => {
        await ApiCall();
        funct(step);
      }}
      className="bg-slate-800 no-underline group cursor-pointer relative shadow-2xl shadow-zinc-900 rounded-full p-px text-xs font-semibold leading-6  text-white inline-block w-fit hover:scale-105 transition duration-300"
    >
      <span className="absolute inset-0 overflow-hidden rounded-full">
        <span className="absolute inset-0 rounded-full bg-[image:radial-gradient(75%_100%_at_50%_0%,rgba(56,189,248,0.6)_0%,rgba(56,189,248,0)_75%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      </span>
      <div className="relative flex space-x-2 items-center z-10 rounded-full bg-zinc-950 py-0.5 px-4 ring-1 ring-white/10 ">
        <span className="text-lg flex flex-row items-center gap-2">
          {text} {loading ? <CircularSpinner size={18} /> : null}
        </span>
        <svg
          fill="none"
          height="16"
          viewBox="0 0 24 24"
          width="16"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M10.75 8.75L14.25 12L10.75 15.25"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
        </svg>
      </div>
      <span className="absolute -bottom-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] bg-gradient-to-r from-pink-400/0 via-pink-400/90 to-pink-400/0 transition-opacity duration-500 group-hover:opacity-60" />
    </button>
  );
};

export default Buttonv2;
