import { useEffect, useState } from "react";
import { IconSparkles } from "@tabler/icons-react";

export default function AILoader({ steps = ["Generating with AI..."], interval = 1800 }) {
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    if (!steps || steps.length <= 1) return;
    const id = setInterval(() => setCurrent((c) => (c + 1) % steps.length), interval);
    return () => clearInterval(id);
  }, [steps, interval]);

  return (
    <div className="inline-flex flex-col items-center justify-center gap-3 px-4 py-6 text-center pointer-events-none min-w-[200px] min-h-[200px]">
      <div className="relative flex items-center justify-center">
        <span className="absolute -z-20 h-64 w-64 rounded-full bg-gradient-to-r from-sky-400/36 to-indigo-400/22 blur-5xl opacity-60" />
        <span className="absolute -z-10 h-52 w-52 rounded-full bg-gradient-to-r from-sky-400/44 to-indigo-400/28 blur-4xl opacity-80" />
        <IconSparkles size={48} strokeWidth={1.2} className="text-sky-300 drop-shadow-[0_0_28px_rgba(125,211,252,0.72)] animate-pulse-opacity" />
      </div>
      <span className="block text-sm font-medium text-white min-h-[1.25em]">
        {steps[current]}
      </span>

      <style>{`
        .animate-pulse-opacity {
          animation: pulseOpacity 1.8s ease-in-out infinite;
        }
        @keyframes pulseOpacity {
          0% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.06); }
          100% { opacity: 0.6; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
