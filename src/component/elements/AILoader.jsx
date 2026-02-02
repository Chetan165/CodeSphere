import { useEffect, useState } from "react";
import { IconSparkles } from "@tabler/icons-react";

export default function AILoader({
  steps = ["Generating with AI..."],
  interval = 1800,
}) {
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    if (steps.length <= 1) return;
    const id = setInterval(() => {
      setCurrent((c) => (c + 1) % steps.length);
    }, interval);
    return () => clearInterval(id);
  }, [steps, interval]);
  return (
    <div className="flex flex-col items-center justify-center gap-2 animate-fade-in">
      <span className="relative flex h-24 w-24 items-center justify-center">
        {/* Stronger blue glow background */}
        <span
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            boxShadow:
              "0 0 64px 32px rgba(57,59,178,0.35), 0 0 128px 48px rgba(57,59,178,0.18)",
            background:
              "radial-gradient(circle at 50% 50%, rgba(57,59,178,0.32) 70%, rgba(57,59,178,0.12) 100%)",
            opacity: 0.95,
            filter: "blur(0.5px)",
          }}
        />
        {/* Subtle animated conic gradient */}
        <span
          className="absolute inset-2 animate-spin-slow rounded-full opacity-40"
          style={{
            background:
              "conic-gradient(from_90deg at 50% 50%, #E2CBFF 0%, #393BB2 40%, #EC4899 80%, #E2CBFF 100%)",
            filter: "blur(2px)",
          }}
        />
        <span className="relative z-10">
          <IconSparkles size={48} className="text-pink-400 drop-shadow-lg" />
        </span>
      </span>
      <span className="text-lg font-medium bg-gradient-to-r from-pink-400 via-blue-400 to-purple-400 bg-clip-text text-transparent animate-pulse min-h-[1.5em] text-center">
        {steps[current]}
      </span>
      <style>{`
        .animate-spin-slow {
          animation: spin 2.2s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
