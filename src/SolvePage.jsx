import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import UserAuth from "./UserAuth";
import { toast, LoaderIcon } from "react-hot-toast";
import * as Dialog from "@radix-ui/react-dialog";
import Editor from "@monaco-editor/react";
import pollJudge0 from "./PollingSubmissions";
import {
  Play,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Terminal,
} from "lucide-react"; // install lucide-react if needed

// Helper for language mapping
const getLanguageString = (id) => {
  switch (parseInt(id)) {
    case 62:
      return "java";
    case 71:
      return "python";
    default:
      return "cpp";
  }
};

const SolvePage = () => {
  const { ContestId: constid, id } = useParams();

  // State Management
  const [showResult, setShowResult] = useState(false);
  const [loading, setloading] = useState(false);
  const [User, setUser] = useState();
  const [Code, SetCode] = useState("// Write your solution here...");
  const [languageId, setLanguageId] = useState(54);
  const [submissionResult, SetsubmissionResult] = useState(null);
  const [decodedError, setDecodedError] = useState(null);

  // Dummy data fallback if localStorage is empty
  const [ChallengeDetails] = useState(
    JSON.parse(localStorage.getItem(`${id}`)) || {
      title: "Problem Title Not Found",
      statement: "Could not load problem details.",
      sampleInput: "",
      sampleOutput: "",
      constraints: "",
      inputFormat: "",
      outputFormat: "",
    }
  );

  const languageOptions = [
    { id: 54, name: "C++ (GCC 9.2.0)" },
    { id: 62, name: "Java (OpenJDK 13.0.1)" },
    { id: 71, name: "Python (3.8.1)" },
  ];

  useEffect(() => {
    UserAuth(setUser);
  }, []);

  // Helper: Decode Base64 from Judge0
  const b64decode = (str) => {
    try {
      return decodeURIComponent(escape(window.atob(str)));
    } catch (e) {
      return str;
    }
  };

  const Submit = async () => {
    if (!Code || Code.trim() === "") {
      toast.error("Code cannot be empty");
      return;
    }

    try {
      setShowResult(true);
      setloading(true);
      setDecodedError(null);

      const submissionPayload = {
        Code,
        problemId: id,
        ContestId: constid,
        languageId: parseInt(languageId),
        uid: User?.uid || "",
      };

      const res = await fetch("http://localhost:3000/api/Submission/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Submission: submissionPayload }),
        credentials: "include",
      });

      const result = await res.json();
      if (!result.ok) throw new Error(result.message);

      const results = await pollJudge0(result.tokens);

      let verdict = "Accepted";
      let score = 0;
      let max_status_id = 0;

      results.forEach((r) => {
        if (r.status.id === 3) score += 10;
        if (r.status.id > max_status_id) max_status_id = r.status.id;
      });

      if (max_status_id >= 6) verdict = "Compilation Error";
      else if (max_status_id === 5) verdict = "Time Limit Exceeded";
      else if (max_status_id === 4) verdict = "Wrong Answer";

      SetsubmissionResult({ result: results, verdict, score });

      if (verdict === "Compilation Error") {
        const errorRes = results.find((r) => r.status.id >= 6);
        if (errorRes?.compile_output) {
          setDecodedError(b64decode(errorRes.compile_output));
        }
      }

      await fetch("http://localhost:3000/api/UpdateSubmission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...submissionPayload,
          lang_id: submissionPayload.languageId,
          verdict,
          score,
        }),
      });
    } catch (err) {
      toast.error(err.message || "Submission failed");
      setShowResult(false);
    } finally {
      setloading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-100 font-sans text-slate-900">
      {/* 1. Modern Header */}
      <header className="h-16 flex items-center justify-between px-6 bg-white/80 backdrop-blur-md border-b border-slate-200 z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Terminal className="w-5 h-5 text-indigo-600" />
          </div>
          <h1 className="text-lg font-bold text-slate-800 tracking-tight truncate max-w-md">
            {ChallengeDetails.title}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              className="appearance-none bg-slate-100 border border-slate-300 hover:border-slate-400 text-slate-700 text-sm rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 block w-48 p-2.5 outline-none transition-all cursor-pointer font-medium"
              value={languageId}
              onChange={(e) => setLanguageId(e.target.value)}
            >
              {languageOptions.map((lang) => (
                <option key={lang.id} value={lang.id}>
                  {lang.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
              <svg
                className="fill-current h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>

          <button
            onClick={Submit}
            disabled={loading}
            className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-5 py-2.5 rounded-lg font-semibold text-sm shadow-md hover:shadow-lg transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <LoaderIcon className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4 fill-current" />
            )}
            Run Code
          </button>
        </div>
      </header>

      {/* 2. Floating Split Layout */}
      <div className="flex-1 flex gap-4 p-4 overflow-hidden h-[calc(100vh-4rem)]">
        {/* Left Panel: Problem Statement (Floating Card) */}
        <div className="w-1/2 flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-y-auto p-8 scrollbar-thin scrollbar-thumb-slate-300 hover:scrollbar-thumb-slate-400">
            <div className="prose prose-slate max-w-none prose-headings:font-bold prose-headings:text-slate-800 prose-p:text-slate-600 prose-p:leading-relaxed">
              {/* Statement */}
              <h2 className="text-xl mb-4">Description</h2>
              <p className="whitespace-pre-wrap">
                {ChallengeDetails.statement}
              </p>

              {/* Formats */}
              <div className="mt-8 grid gap-6">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Input Format
                  </h3>
                  <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    {ChallengeDetails.inputFormat}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Output Format
                  </h3>
                  <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    {ChallengeDetails.outputFormat}
                  </p>
                </div>
              </div>

              {/* Constraints */}
              <div className="mt-8">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Constraints
                </h3>
                <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg">
                  <code className="text-amber-800 font-mono text-sm">
                    {ChallengeDetails.constraints}
                  </code>
                </div>
              </div>

              {/* Examples */}
              <div className="mt-8 grid grid-cols-1 xl:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">
                    Sample Input
                  </h3>
                  <div className="bg-slate-800 rounded-lg p-4 shadow-inner">
                    <pre className="text-emerald-400 font-mono text-sm overflow-x-auto custom-scrollbar">
                      {ChallengeDetails.sampleInput}
                    </pre>
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">
                    Sample Output
                  </h3>
                  <div className="bg-slate-800 rounded-lg p-4 shadow-inner">
                    <pre className="text-emerald-400 font-mono text-sm overflow-x-auto custom-scrollbar">
                      {ChallengeDetails.sampleOutput}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Code Editor (Floating Card) */}
        <div className="w-1/2 flex flex-col rounded-2xl shadow-xl overflow-hidden border border-slate-700 bg-[#1e1e1e]">
          {/* Editor Header */}
          <div className="h-10 bg-[#252526] flex items-center px-4 border-b border-[#333]">
            <span className="text-xs text-gray-400 font-mono">
              main.
              {getLanguageString(languageId) === "python"
                ? "py"
                : getLanguageString(languageId)}
            </span>
          </div>

          <div className="flex-1 relative">
            <Editor
              height="100%"
              theme="vs-dark"
              language={getLanguageString(languageId)}
              value={Code}
              onChange={(val) => SetCode(val)}
              options={{
                minimap: { enabled: false },
                fontSize: 15,
                fontFamily: '"JetBrains Mono", "Fira Code", monospace', // Better coding font
                lineHeight: 24,
                scrollBeyondLastLine: false,
                automaticLayout: true,
                padding: { top: 16, bottom: 16 },
                smoothScrolling: true,
                cursorBlinking: "smooth",
                renderLineHighlight: "all",
              }}
            />
          </div>
        </div>
      </div>

      {/* Result Modal */}
      <Dialog.Root open={showResult} onOpenChange={setShowResult}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 duration-300" />
          <Dialog.Content className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-[90vw] max-w-3xl bg-white rounded-2xl shadow-2xl p-0 z-50 overflow-hidden outline-none">
            {/* Modal Header */}
            <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex justify-between items-center">
              <Dialog.Title className="text-lg font-bold text-slate-800">
                Execution Results
              </Dialog.Title>
              <Dialog.Close asChild>
                <button className="text-slate-400 hover:text-slate-600 transition-colors bg-slate-200 hover:bg-slate-300 rounded-full p-1">
                  <XCircle className="w-5 h-5" />
                </button>
              </Dialog.Close>
            </div>

            <div className="p-6 max-h-[70vh] overflow-y-auto">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16 space-y-4">
                  <div className="relative">
                    <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                  </div>
                  <p className="text-slate-500 font-medium">
                    Evaluating your code...
                  </p>
                </div>
              ) : (
                submissionResult && (
                  <div className="space-y-6">
                    {/* Verdict Banner */}
                    <div
                      className={`p-5 rounded-xl border flex items-center gap-4 ${
                        submissionResult.verdict === "Accepted"
                          ? "bg-green-50 border-green-200"
                          : "bg-red-50 border-red-200"
                      }`}
                    >
                      <div
                        className={`p-3 rounded-full ${
                          submissionResult.verdict === "Accepted"
                            ? "bg-green-100"
                            : "bg-red-100"
                        }`}
                      >
                        {submissionResult.verdict === "Accepted" ? (
                          <CheckCircle className="w-6 h-6 text-green-600" />
                        ) : (
                          <AlertTriangle className="w-6 h-6 text-red-600" />
                        )}
                      </div>
                      <div>
                        <h2
                          className={`text-xl font-bold ${
                            submissionResult.verdict === "Accepted"
                              ? "text-green-800"
                              : "text-red-800"
                          }`}
                        >
                          {submissionResult.verdict}
                        </h2>
                        <p className="text-sm text-slate-600">
                          You scored{" "}
                          <span className="font-bold text-slate-900">
                            {submissionResult.score}/100
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Compilation Error Log */}
                    {decodedError && (
                      <div className="rounded-xl border border-red-200 overflow-hidden">
                        <div className="bg-red-50 px-4 py-2 border-b border-red-100">
                          <h3 className="text-xs font-bold text-red-800 uppercase tracking-wider">
                            Compilation Error
                          </h3>
                        </div>
                        <pre className="p-4 bg-red-900/5 text-red-900 font-mono text-xs overflow-x-auto">
                          {decodedError}
                        </pre>
                      </div>
                    )}

                    {/* Test Cases List */}
                    {!decodedError && (
                      <div>
                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">
                          Test Cases
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {submissionResult.result.map((res, i) => (
                            <div
                              key={i}
                              className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100 hover:border-slate-300 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <span className="text-xs font-mono text-slate-400">
                                  #{i + 1}
                                </span>
                                <span
                                  className={`text-sm font-medium ${
                                    res.status.id === 3
                                      ? "text-green-700"
                                      : "text-red-700"
                                  }`}
                                >
                                  {res.status.description}
                                </span>
                              </div>
                              <div className="text-xs text-slate-400 font-mono flex gap-3">
                                <span>{res.time || "0.00"}s</span>
                                <span>{res.memory || "0"}KB</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              )}
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
};

export default SolvePage;
