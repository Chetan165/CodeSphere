import { WavyBackground } from "./component/ui/wavy-background";
import { TypewriterEffect } from "./component/ui/typewriter-effect";
import "./App.css";
import { TextGenerateEffect } from "./component/ui/text-generate-effect";
import { NoiseBackground } from "./component/ui/noise-background";

export default function App() {
  const words = "DSA Contests. Live Leaderboards. College-level Coding";
  return (
    <WavyBackground>
      <div className="max-w-4xl mx-auto w-full">
        <TypewriterEffect
          words={[
            {
              text: "Code",
              className:
                "bg-clip-text text-transparent bg-gradient-to-r from-white  transition-all duration-300 hover:from-blue-400 hover:via-indigo-400 hover:to-pink-400 hover:brightness-125",
            },
            {
              text: "Sphere",
              className:
                "bg-clip-text text-transparent bg-gradient-to-r from-white  transition-all duration-800 hover:from-pink-400 hover:via-indigo-400 hover:to-blue-400 hover:brightness-125 hover:opacity-90",
            },
          ]}
          className="text-2xl md:text-4xl lg:text-7xl font-bold inter-var text-center mb-2"
          cursorClassName="bg-indigo-500"
        />
        <TextGenerateEffect
          duration={1}
          words={words}
          className="text-center mt-4 text-lg md:text-2xl lg:text-3xl"
        />
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <NoiseBackground
            containerClassName="w-fit p-2 rounded-full mx-auto transition-all duration-300 hover:scale-105"
            gradientColors={[
              "rgb(236, 72, 153)", // pink-500
              "rgb(139, 92, 246)", // indigo-500
              "rgb(59, 130, 246)", // blue-500
            ]}
          >
            <button
              onClick={() =>
                (window.location.href = "http://localhost:3000/auth/google")
              }
              className="h-full w-full cursor-pointer rounded-full bg-gradient-to-r from-neutral-100 via-neutral-100 to-white px-4 py-2 text-black shadow-[0px_2px_0px_0px_var(--color-neutral-50)_inset,0px_0.5px_1px_0px_var(--color-neutral-400)] transition-all duration-100 active:scale-98 dark:from-black dark:via-black dark:to-neutral-900 dark:text-white dark:shadow-[0px_1px_0px_0px_var(--color-neutral-950)_inset,0px_1px_0px_0px_var(--color-neutral-800)] hover:scale-90"
            >
              Login With College Email
            </button>
          </NoiseBackground>
        </div>
        <footer className="mt-16 text-sm text-gray-400 text-center">
          By-Chetan Sharma
        </footer>
      </div>
    </WavyBackground>
  );
}
