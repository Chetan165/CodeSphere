import React, { useState } from "react";
import { MultiStepLoader as Loader } from "../component/ui/multi-steploader";
import { X } from "lucide-react";

const loadingStates = [
  {
    text: "Buying a condo",
  },
  {
    text: "Travelling in a flight",
  },
  {
    text: "Meeting Tyler Durden",
  },
  {
    text: "He makes soap",
  },
  {
    text: "We goto a bar",
  },
  {
    text: "Start a fight",
  },
  {
    text: "We like it",
  },
  {
    text: "Welcome to F**** C***",
  },
];

export function MultiStepLoader({ States, loading, setLoading }) {
  return (
    <div className="w-full h-[60vh] flex items-center justify-center">
      {/* Core Loader Modal */}
      <Loader
        loadingStates={States}
        loading={loading}
        duration={1000}
        loop={false}
      />
      {/* The buttons are for demo only, remove it in your actual code ⬇️ */}
      {loading && (
        <button
          className="fixed top-4 right-4 text-black dark:text-white z-[120]"
          onClick={() => setLoading(false)}
        >
          <X className="h-10 w-10" />
        </button>
      )}
    </div>
  );
}
