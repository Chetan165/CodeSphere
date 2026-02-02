import React, { useEffect, useState } from "react";
import NeonStepTimeline from "../component/ui/NeonStepTimeline";
import { BorderMagicButton } from "../component/ui/BorderMagicButton";
import Buttonv2 from "../component/ui/Buttonv2";
import { BackgroundGradient } from "../component/ui/background-gradient";
import { IconCross, IconX } from "@tabler/icons-react";
import AILoader from "../component/elements/AILoader";
import { HoverEffect } from "../component/ui/card-hover-effect";
import { CodeBlock } from "../component/ui/code-block";

const steps = [
  {
    title: "Select Parameters",
    description:
      "Choose topics, difficulty, and (optionally) complexity/solution.",
  },
  {
    title: "AI Generation",
    description: "AI generates problem, statement, constraints, and testcases.",
  },
  {
    title: "CE & Export",
    description:
      "Run code, validate testcases, and download everything as a zip.",
  },
];

const AutoCraft = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [difficulty, setDifficulty] = useState("Easy");
  const [complexity, setComplexity] = useState(null);
  const [Step1Data, SetStep1Data] = useState(null);
  const [Step2Data, SetStep2Data] = useState(null);
  const [loading, setloading] = useState(false);
  const [numTestcases, setNumTestcases] = useState(3);
  const [testcaseTypes, setTestcaseTypes] = useState(Array(3).fill("sample"));
  const [done, setDone] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [questionStyle, setQuestionStyle] = useState("LeetCode");

  const DownloadFile = async () => {
    try {
      const data = await fetch(
        `http://localhost:3000/admin/Download/${localStorage.getItem("UserSession")}`,
        {
          method: "GET",
        },
      );
      const blob = await data.blob();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.download = `AutoCraft_Problem_${localStorage.getItem("UserSession")}.zip`;
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      console.log(err);
    } finally {
      setDone(false);
    }
  };

  const CEAndDownload = async () => {
    try {
      setloading(true);
      setButtonLoading(true);
      const res = await fetch(
        `http://localhost:3000/admin/routeCE/pipeline/${localStorage.getItem("UserSession")}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jobid: localStorage.getItem("UserSession"),
            inputCode: Step2Data.inputGenCode,
            outputCode: Step2Data.outputGenCode,
            MetaData: Step1Data,
          }),
        },
      );
      const res2 = await res.json();
      setTimeout(() => {
        setDone(true);
        setButtonLoading(false);
      }, 6000);
      console.log(res2);
    } catch (err) {
      console.log(err);
    } finally {
      setloading(false);
    }
  };
  const SendData = async () => {
    try {
      setloading(true);
      const data = await fetch("http://localhost:3000/admin/genai/problem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          tags: selectedTags,
          difficulty: difficulty,
          expectedComplexity: complexity,
          questionStyle: questionStyle,
        }),
      });
      const parsedres = await data.json();
      localStorage.setItem("UserSession", parsedres.sessionId);
      console.log(parsedres);
      SetStep1Data(parsedres);
    } catch (err) {
      console.log(err);
    } finally {
      setloading(false);
    }
  };
  const GenerateTC = async () => {
    try {
      setloading(true);
      const data = await fetch(
        "http://localhost:3000/admin/genai/testcaseGeneration",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            sessionId: localStorage.getItem("UserSession"),
            numTestcases: numTestcases,
            testcaseTypes: testcaseTypes,
          }),
        },
      );
      const parsedres = await data.json();
      console.log(parsedres);
      SetStep2Data(parsedres);
    } catch (err) {
      console.log(err);
    } finally {
      setloading(false);
    }
  };
  useEffect(() => {
    try {
      const fetchTags = async () => {
        const res = await fetch("http://localhost:3000/admin/autocraft/tags", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        const data = await res.json();
        setTags(data.Tags);
        console.log(data);
      };
      fetchTags();
    } catch (err) {
      console.log(err);
    }
  }, []);
  useEffect(() => {
    console.log(selectedTags, difficulty, complexity, questionStyle);
  }, [selectedTags, difficulty, complexity, questionStyle]);

  return (
    <div className="min-h-screen w-full bg-black text-white flex flex-col px-2 md:px-8 py-0">
      {/* Timeline/Stepper */}
      <div className="w-full max-w-6xl mx-auto mt-10 mb-10 animate-fade-in">
        <NeonStepTimeline
          steps={steps}
          currentStep={currentStep}
          onStepClick={setCurrentStep}
        />
      </div>

      {/* Step Content - full width, clean card, grid layout */}
      <div className="w-full max-w-6xl mx-auto flex-1 grid grid-cols-1 md:grid-cols-2 gap-8 items-start animate-fade-in-up">
        <BackgroundGradient className="bg-neutral-900/95 rounded-2xl shadow-xl p-8 min-h-[420px] border border-white/10 flex flex-col gap-8">
          {currentStep === 0 && (
            <div className="flex flex-col w-full ">
              <h2 className="text-2xl font-bold mb-4 text-white">
                Step 1: Select Parameters
              </h2>
              {/* TODO: Add topic, difficulty, complexity selection UI here */}
              <label
                htmlFor="difficulty"
                className="block mb-1 font-semibold text-white"
              >
                Select Topics
              </label>
              <div className="">
                {tags?.map((t) => {
                  return (
                    <button
                      key={t}
                      onClick={() =>
                        selectedTags.find((tag) => tag === t)
                          ? setSelectedTags(
                              selectedTags.filter((tag) => tag !== t),
                            )
                          : setSelectedTags([...selectedTags, t])
                      }
                      className={`${selectedTags?.find((tag) => tag === t) ? "bg-pink-300/50" : "bg-blue-600/30"} m-1 px-4 py-2 rounded-full text-sm transition`}
                    >
                      {t}{" "}
                    </button>
                  );
                })}
              </div>
              {/* Difficulty Dropdown */}
              <div className="mt-6">
                <label
                  htmlFor="difficulty"
                  className="block mb-1 font-semibold text-white"
                >
                  Difficulty
                </label>
                <select
                  id="difficulty"
                  className="w-full rounded-md bg-neutral-800 border border-blue-600/40 text-white p-2 focus:ring-2 focus:ring-blue-400"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                >
                  <option value="Easy" className="text-green-500">
                    Easy
                  </option>
                  <option value="Medium" className="text-yellow-400">
                    Medium
                  </option>
                  <option value="Hard" className="text-red-500">
                    Hard
                  </option>
                </select>
              </div>
              {/* input fields for parameters */}
              <div className="mt-5 mb-3">
                <label
                  htmlFor="difficulty"
                  className="block mb-1 font-semibold text-white"
                >
                  Expected Complexity (Optional)
                </label>
                <input
                  type="text"
                  onChange={(e) => setComplexity(e.target.value)}
                  placeholder="Provide Expected Complexity for the Solution"
                  className="w-full rounded-md bg-neutral-800 border border-blue-600/40 text-white p-2 focus:ring-2 focus:ring-blue-400"
                ></input>
                <label className="block mt-2 text-sm text-slate-400">
                  Question Style
                </label>
                <select
                  id="QuestionStyle"
                  value={questionStyle}
                  onChange={(e) => setQuestionStyle(e.target.value)}
                  className="w-full rounded-md bg-neutral-800 border border-blue-600/40 text-white p-2 focus:ring-2 focus:ring-blue-400"
                >
                  <option value="LeetCode" className="text-white">
                    LeetCode
                  </option>
                  <option
                    value="Competitive Programming"
                    className="text-white"
                  >
                    Codeforces/CodeChef
                  </option>
                </select>
              </div>
              <Buttonv2
                ApiCall={SendData}
                funct={setCurrentStep}
                step={1}
                text="Next"
              />
            </div>
          )}
          {currentStep === 1 && (
            <div className="flex flex-col w-full">
              <h2 className="text-2xl font-bold mb-4 text-white">
                Step 2: AI Generation
              </h2>
              <p className="text-slate-400 text-base mb-8">
                (AI-generated problem, statement, constraints, and testcases
                preview UI goes here.)
              </p>
              {/* Number of Testcases Dropdown */}
              <div className="mb-6">
                <label className="block mb-1 font-semibold text-white">
                  Number of Testcases
                </label>
                <select
                  className="w-full rounded-md bg-neutral-800 border border-blue-600/40 text-white p-2 focus:ring-2 focus:ring-blue-400"
                  value={numTestcases}
                  onChange={(e) => {
                    const n = Number(e.target.value);
                    setNumTestcases(n);
                    setTestcaseTypes((prev) => {
                      if (n > prev.length) {
                        return [
                          ...prev,
                          ...Array(n - prev.length).fill("sample"),
                        ];
                      } else {
                        return prev.slice(0, n);
                      }
                    });
                  }}
                >
                  {[...Array(10)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>
              </div>
              {/* Testcase Type Selectors */}
              <div className="flex flex-col gap-4 mb-8">
                {Array.from({ length: numTestcases }).map((_, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col md:flex-row gap-3 items-center"
                  >
                    <label className="text-white font-medium min-w-[120px]">
                      Testcase {idx + 1} Type
                    </label>
                    <select
                      className="flex-1 rounded-md bg-neutral-800 border border-pink-400/40 text-white p-2 focus:ring-2 focus:ring-pink-400"
                      value={testcaseTypes[idx]}
                      onChange={(e) => {
                        setTestcaseTypes((prev) => {
                          const arr = [...prev];
                          arr[idx] = e.target.value;
                          return arr;
                        });
                      }}
                    >
                      {["sample", "edge", "large", "generic"].map((type) => (
                        <option key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
              <Buttonv2
                ApiCall={GenerateTC}
                funct={setCurrentStep}
                step={2}
                text="Accept & Next"
              />
              <button className="p-[3px] relative w-fit mt-4">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg" />
                <div className="px-8 py-2  bg-black rounded-[6px]  relative group transition duration-200 text-white hover:bg-transparent">
                  Regenerate
                </div>
              </button>
            </div>
          )}
          {currentStep === 2 && (
            <div className="flex flex-col w-full">
              <h2 className="text-2xl font-bold mb-4 text-white">
                Step 3: CE & Export
              </h2>
              {/* TODO: Add CE pipeline integration, live updates, and download UI here */}
              <p className="text-slate-400 text-base mb-8">
                (Live CE pipeline updates and download zip UI goes here.)
              </p>
              <Buttonv2
                text={`${done ? "Donwload Zip" : "Run CE"}`}
                funct={setCurrentStep}
                step={2}
                ApiCall={done ? DownloadFile : CEAndDownload}
                loading={buttonLoading}
                loadHandler={setButtonLoading}
              />
            </div>
          )}
        </BackgroundGradient>
        {/* Placeholder for future preview, AI, or CE output, or just a clean empty card for now */}
        <div
          className={`bg-transparent rounded-2xl shadow-xl p-8 min-h-[420px] border border-white/10 flex flex-col items-center ${loading ? "justify-center" : "justify-start"} overflow-scroll max-h-[720px]`}
        >
          {/* You can add a preview, live output, or illustration here in the future */}
          <div className="w-full h-full">
            {loading ? (
              <AILoader
                steps={
                  currentStep === 0
                    ? [
                        "Generating with AI...",
                        "Designing a creative coding problem...",
                        "Selecting optimal constraints and samples...",
                        "Finalizing problem details for you...",
                      ]
                    : currentStep === 1
                      ? [
                          "Generating testcases...",
                          "Validating testcases...",
                          "Preparing everything for CE...",
                          "Almost done...",
                        ]
                      : [
                          "Running code execution engine...",
                          "Validating testcases against solution...",
                          "Packaging files for download...",
                          "Finalizing your coding problem...",
                        ]
                }
                interval={1500}
              />
            ) : (
              <div className="p-2 bg-transparent">
                <HoverEffect
                  items={[
                    {
                      title: "Problem Statement Preview",
                      description:
                        Step1Data?.genaiResponse.problemStatement?.replace(
                          /\n/g,
                          "<br/>",
                        ) || "AI-generated problem statement will appear here.",
                    },
                    {
                      title: "Input Format Preview",
                      description:
                        Step1Data?.genaiResponse.inputFormat?.replace(
                          /\n/g,
                          "<br/>",
                        ) || "AI-generated input format will appear here.",
                    },
                    {
                      title: "Output Format Preview",
                      description:
                        Step1Data?.genaiResponse.outputFormat?.replace(
                          /\n/g,
                          "<br/>",
                        ) || "AI-generated output format will appear here.",
                    },
                    {
                      title: "Constraints Preview",
                      description:
                        Step1Data?.genaiResponse.constraints?.replace(
                          /\n/g,
                          "<br/>",
                        ) || "AI-generated constraints will appear here.",
                    },
                    {
                      title: "Sample Input Preview",
                      description:
                        Step1Data?.genaiResponse.sampleInput?.replace(
                          /\n/g,
                          "<br/>",
                        ) || "AI-generated sample testcases will appear here.",
                    },
                    {
                      title: "Sample Output Preview",
                      description:
                        Step1Data?.genaiResponse.sampleOutput?.replace(
                          /\n/g,
                          "<br/>",
                        ) || "AI-generated sample outputs will appear here.",
                    },
                  ]}
                  // Pass a prop to indicate HTML rendering
                  renderHtml={true}
                />
                <h1>Solution</h1>
                <CodeBlock
                  filename={"Solution.py"}
                  language="python"
                  code={Step1Data?.genaiResponse.solution}
                />
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Utility classes for subtle neon and animation */}
      <style>{`
        .drop-shadow-neon { text-shadow: 0 0 8px #fff, 0 0 16px #00d4ff33, 0 0 4px #ff4fd822; }
        .animate-fade-in { animation: fadeIn 0.8s cubic-bezier(.4,0,.2,1) both; }
        .animate-fade-in-up { animation: fadeInUp 1s cubic-bezier(.4,0,.2,1) both; }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default AutoCraft;
