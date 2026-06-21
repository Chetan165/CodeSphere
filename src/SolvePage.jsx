import React, {
  useEffect,
  useState,
  useRef,
  useMemo,
  useCallback,
  useImperativeHandle,
  Suspense,
} from "react";
import { useParams } from "react-router-dom";
import UserAuth from "./UserAuth";
import { toast, LoaderIcon } from "react-hot-toast";
import * as Dialog from "@radix-ui/react-dialog";
import Editor from "@monaco-editor/react";
import { pollJudge0, pollRun } from "./PollingSubmissions";
import {
  Play,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Terminal,
} from "lucide-react"; // install lucide-react if needed
const ReactMarkdown = React.lazy(() => import("react-markdown"));
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeSanitize from "rehype-sanitize";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import Buttonv2 from "./component/ui/Buttonv2";
const backendURL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

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

const CodeEditor = React.memo(
  React.forwardRef(function CodeEditor(
    { languageId, boilerPlate, editorOptions },
    ref,
  ) {
    const [codeBuffers, setCodeBuffers] = useState({});
    const [activeCode, setActiveCode] = useState(boilerPlate[languageId] || "");

    useEffect(() => {
      setActiveCode(codeBuffers[languageId] ?? boilerPlate[languageId] ?? "");
    }, [languageId, boilerPlate, codeBuffers]);

    const handleCodeChange = useCallback(
      (val) => {
        const nextValue = val ?? "";
        setActiveCode(nextValue);
        setCodeBuffers((prev) => ({
          ...prev,
          [languageId]: nextValue,
        }));
      },
      [languageId],
    );

    useImperativeHandle(
      ref,
      () => ({
        getCode: (langId = languageId) =>
          codeBuffers[langId] ?? boilerPlate[langId] ?? "",
      }),
      [codeBuffers, boilerPlate, languageId],
    );

    return (
      <Editor
        height="100%"
        theme="vs-dark"
        language={getLanguageString(languageId)}
        value={activeCode}
        onChange={handleCodeChange}
        options={editorOptions}
      />
    );
  }),
);

const SolvePage = () => {
  const { ContestId: constid, id } = useParams();
  const BoilerPlate = useMemo(
    () => ({
      54: `#include <iostream>

using namespace std;

int main() {
  // Your code goes here

  return 0;
}`,
      62: `import java.util.*;

public class Main {
  public static void main(String[] args) {
    // Your code goes here

  }
}`,
      71: `# Your code goes here
`,
    }),
    [],
  );

  // State Management
  const [showResult, setShowResult] = useState(false);
  const [loading, setloading] = useState(false);
  const [User, setUser] = useState();
  const [languageId, setLanguageId] = useState(54);
  const [submissionResult, SetsubmissionResult] = useState(null);
  const [decodedError, setDecodedError] = useState(null);
  const [runLoading, setRunLoading] = useState(false);
  const [runStdin, setRunStdin] = useState("");
  const [useCustomStdin, setUseCustomStdin] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [runError, setRunError] = useState("");
  const [contestMeta, setContestMeta] = useState(null);
  const [serverOffset, setServerOffset] = useState(0);
  const [actionLock, setActionLock] = useState(null);
  const serverOffsetRef = useRef(serverOffset);
  const editorRef = useRef(null);
  const editorOptions = useMemo(
    () => ({
      minimap: { enabled: false },
      fontSize: 15,
      fontFamily: '"JetBrains Mono", "Fira Code", monospace',
      lineHeight: 24,
      scrollBeyondLastLine: false,
      automaticLayout: true,
      padding: { top: 16, bottom: 16 },
      smoothScrolling: true,
      cursorBlinking: "smooth",
      renderLineHighlight: "all",
    }),
    [],
  );

  useEffect(() => {
    serverOffsetRef.current = serverOffset;
  }, [serverOffset]);

  // Challenge details will be fetched from backend on mount
  const [ChallengeDetails, setChallengeDetails] = useState({
    title: "Problem Title Not Found",
    statement: "Could not load problem details.",
    sampleInput: "",
    sampleOutput: "",
    constraints: "",
    inputFormat: "",
    outputFormat: "",
  });

  const languageOptions = [
    { id: 54, name: "C++ (GCC 9.2.0)" },
    { id: 62, name: "Java (OpenJDK 13.0.1)" },
    { id: 71, name: "Python (3.8.1)" },
  ];

  useEffect(() => {
    UserAuth(setUser);
  }, []);

  // Sync contest meta and server time (now) for accurate countdown
  useEffect(() => {
    let mounted = true;

    const fetchMeta = async () => {
      if (!constid) return;
      try {
        const res = await fetch(`${backendURL}/api/contests/${constid}/meta`, {
          method: "GET",
          credentials: "include",
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
          },
        });
        if (!res.ok) return;
        const data = await res.json();
        if (data && data.ok && mounted) {
          setContestMeta(data.contest);
          const serverNow = Date.parse(
            data.serverNow || new Date().toISOString(),
          );
          const off = serverNow - Date.now();
          setServerOffset(off);
        }
      } catch (e) {
        console.warn("Failed to fetch contest meta", e);
      }
    };

    fetchMeta();

    const onFocus = () => fetchMeta();
    window.addEventListener("focus", onFocus);

    return () => {
      mounted = false;
      window.removeEventListener("focus", onFocus);
    };
  }, [constid]);

  // Small isolated countdown component to avoid parent re-renders on every tick
  function Countdown({ contestMeta, serverOffsetRef }) {
    const [nowTs, setNowTs] = useState(
      Date.now() + (serverOffsetRef.current || 0),
    );
    useEffect(() => {
      const tick = () => setNowTs(Date.now() + (serverOffsetRef.current || 0));
      const id = setInterval(tick, 1000);
      return () => clearInterval(id);
    }, [serverOffsetRef]);

    if (!contestMeta) return null;
    const start = new Date(contestMeta.startTime).getTime();
    const end = new Date(contestMeta.endTime).getTime();
    if (nowTs < start) {
      return (
        <div className="text-sm text-gray-200 px-3 py-1 rounded-md bg-zinc-800/40">
          Starts in: {formatRemaining(start - nowTs)}
        </div>
      );
    }
    if (nowTs > end) {
      return (
        <div className="text-sm text-gray-200 px-3 py-1 rounded-md bg-zinc-800/40">
          Contest ended
        </div>
      );
    }
    return (
      <div className="text-sm text-gray-200 px-3 py-1 rounded-md bg-zinc-800/40">
        Time left: {formatRemaining(Math.max(0, end - nowTs))}
      </div>
    );
  }
  // Fetch full challenge details when mounting (authoritative)
  useEffect(() => {
    let mounted = true;
    const fetchChallenge = async () => {
      try {
        const url = constid
          ? `${backendURL}/api/challenges/${id}?contestId=${constid}`
          : `${backendURL}/api/challenges/${id}`;
        const res = await fetch(url, {
          method: "GET",
          credentials: "include",
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
          },
        });
        if (!res.ok) return;
        const data = await res.json();
        if (mounted && data && data.ok) {
          setChallengeDetails(data.challenge || {});
        }
      } catch (e) {
        console.warn("Failed to fetch challenge details", e);
      }
    };
    fetchChallenge();
    return () => {
      mounted = false;
    };
  }, [id, constid]);

  const Submit = async () => {
    if (actionLock) return;
    setActionLock("submit");
    try {
      const currentCode =
        editorRef.current?.getCode(languageId) ?? BoilerPlate[languageId] ?? "";

      // Client-side guard: prevent submission outside contest window
      if (constid && contestMeta) {
        const start = new Date(contestMeta.startTime).getTime();
        const end = new Date(contestMeta.endTime).getTime();
        const now = Date.now() + serverOffsetRef.current;
        if (now < start) {
          toast.error("Contest not started");
          return;
        }
        if (now > end) {
          toast.error("Contest ended");
          return;
        }
      }

      if (!currentCode || currentCode.trim() === "") {
        toast.error("Code cannot be empty");
        return;
      }

      setShowResult(true);
      setloading(true);
      setDecodedError(null);

      const submissionPayload = {
        Code: currentCode,
        problemId: id,
        ContestId: constid,
        languageId: parseInt(languageId),
        uid: User?.uid || "",
      };

      const res = await fetch(`${backendURL}/api/Submission/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Submission: submissionPayload }),
        credentials: "include",
      });

      const result = await res.json();
      if (!res.ok || result?.ok === false) {
        throw new Error(result["error"] || "Submission failed");
      }

      const submissionId =
        result?.submissionId || result?.id || result?.SubmissionId;
      if (!submissionId) {
        throw new Error("Submission id missing from submit response");
      }

      const polledResult = await pollJudge0(submissionId);
      const results = Array.isArray(polledResult?.results)
        ? polledResult.results
        : [];

      // prefer backend-computed score and maxScore when available
      const score = Number.isFinite(polledResult?.score)
        ? polledResult.score
        : null;
      const maxScore = Number.isFinite(polledResult?.maxScore)
        ? polledResult.maxScore
        : null;

      let verdict = "Wrong Answer";
      if (polledResult?.status === "accepted") verdict = "Accepted";
      else if (polledResult?.firstError?.status)
        verdict = polledResult.firstError.status;

      SetsubmissionResult({
        result: results,
        verdict,
        score: score !== null ? score : undefined,
        maxScore: maxScore !== null ? maxScore : undefined,
        passedNonPublic: polledResult?.passedNonPublic,
        total: polledResult?.total,
      });

      // Update local challenge details and notify other components
      try {
        const deriveScore = () => {
          if (Number.isFinite(polledResult?.score)) return polledResult.score;
          const rs = Array.isArray(polledResult?.results)
            ? polledResult.results
            : [];
          const passed = rs.filter(
            (r) =>
              r?.pass ||
              (typeof r?.status === "string" &&
                r.status.toLowerCase().includes("accept")),
          ).length;
          const total = polledResult?.total || rs.length || 0;
          const max =
            ChallengeDetails?.maxScore ||
            (Number.isFinite(polledResult?.maxScore)
              ? polledResult.maxScore
              : 100);
          if (total === 0) return 0;
          return Math.round((passed / total) * max);
        };

        const newMax =
          ChallengeDetails?.maxScore ??
          (Number.isFinite(polledResult?.maxScore)
            ? polledResult.maxScore
            : null) ??
          100;
        const newScore = deriveScore();
        let newStatus = "Unattempted";
        if (newScore >= newMax) newStatus = "Solved";
        else if (newScore > 0) newStatus = "Partially Solved";

        const prevScore = ChallengeDetails?.userScore ?? 0;
        if (newScore > prevScore) {
          setChallengeDetails((prev) => ({
            ...prev,
            userScore: newScore,
            maxScore: newMax,
            status: newStatus,
          }));

          // Notify other components (like ContestChallenges) to update their list
          try {
            window.dispatchEvent(
              new CustomEvent("challengeUpdated", {
                detail: {
                  id,
                  userScore: newScore,
                  status: newStatus,
                  maxScore: newMax,
                },
              }),
            );
          } catch (e) {
            console.warn("Failed to dispatch challenge update", e);
          }
        }
      } catch (e) {
        console.warn("Failed to derive updated score/status", e);
      }

      const compileOutput =
        polledResult?.firstError?.compile_output ||
        results.find((r) => r?.compile_output)?.compile_output;
      setDecodedError(compileOutput || null);
    } catch (err) {
      toast.error(err.message || "Submission failed");
      setShowResult(false);
    } finally {
      setloading(false);
      setActionLock(null);
    }
  };

  const Run = async () => {
    if (actionLock) return;
    setActionLock("run");
    try {
      const currentCode =
        editorRef.current?.getCode(languageId) ?? BoilerPlate[languageId] ?? "";

      // Client-side guard: prevent runs when contest window disallows it
      if (constid && contestMeta) {
        const start = new Date(contestMeta.startTime).getTime();
        const end = new Date(contestMeta.endTime).getTime();
        const now = Date.now() + serverOffsetRef.current;
        if (now < start) {
          toast.error("Contest not started");
          return;
        }
        if (now > end) {
          toast.error("Contest ended");
          return;
        }
      }

      if (!currentCode || currentCode.trim() === "") {
        toast.error("Code cannot be empty");
        return;
      }

      setRunLoading(true);
      setRunError("");
      setRunResult(null);

      const runPayload = {
        Code: currentCode,
        languageId: parseInt(languageId),
        stdin: useCustomStdin ? runStdin : ChallengeDetails?.sampleInput || "",
      };
      if (!useCustomStdin)
        runPayload.expected = ChallengeDetails?.sampleOutput || "";

      const res = await fetch(`${backendURL}/api/Submission/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // send expected only for sample runs; omit for custom stdin
        body: JSON.stringify(runPayload),
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok || data?.ok === false) {
        throw new Error(data["error"] || "Run failed");
      }

      const runId = data?.runId;
      if (!runId) {
        throw new Error("runId missing from run response");
      }

      const polled = await pollRun(runId);

      setRunResult(polled);
    } catch (err) {
      const message = err?.message || "Run failed";
      setRunError(message);
      toast.error(message);
    } finally {
      setRunLoading(false);
      setActionLock(null);
    }
  };

  const normalizeText = (value) =>
    String(value || "")
      .replace(/\r\n/g, "\n")
      // remove trailing spaces/tabs on each line
      .replace(/[ \t]+$/gm, "")
      // remove trailing blank lines
      .replace(/\n+$/g, "")
      .trim();

  const formatOutput = (value) =>
    String(value || "")
      .replace(/\r\n/g, "\n")
      .replace(/\n+$/g, "");

  const runVerdict = (() => {
    if (!runResult) return null;
    // Prefer backend verdict when available (submitted expected)
    if (runResult.verdict) {
      const v = String(runResult.verdict).toLowerCase();
      if (v.includes("accept")) return "Accepted";
      if (v.includes("wrong")) return "Wrong Answer";
      if (v.includes("runtime")) return "Runtime Error";
      return runResult.verdict;
    }
    // If backend provided a message (custom stdin), don't show verdict
    if (runResult.message) return null;
    // Fallback: derive from Judge0 status text only if no verdict
    if (runResult.status) {
      const s = String(runResult.status).toLowerCase();
      if (s.includes("accept")) return "Accepted";
      if (s.includes("wrong")) return "Wrong Answer";
      if (s.includes("runtime")) return "Runtime Error";
      return runResult.status;
    }
    return null;
  })();

  const explanation = ChallengeDetails?.explanation || "";

  const buildCombined = useCallback(() => {
    const title = ChallengeDetails?.title || "";
    const statement = ChallengeDetails?.statement || "";
    const inputFormat = ChallengeDetails?.inputFormat || "";
    const outputFormat = ChallengeDetails?.outputFormat || "";
    const constraints = ChallengeDetails?.constraints || "";
    const sampleInput = ChallengeDetails?.sampleInput || "";
    const sampleOutput = ChallengeDetails?.sampleOutput || "";

    return [
      `# ${title}`,
      "",
      statement,
      "",
      "---",
      "## Input Format",
      inputFormat,
      "",
      "## Output Format",
      outputFormat,
      "",
      "---",
      "## Constraints",
      constraints,
      "",
      "---",
      "## Example",
      "Input:",
      "```",
      sampleInput,
      "```",
      "",
      "Output:",
      "```",
      sampleOutput,
      "```",
      "",
      "---",
      "## Explanation",
      "",
      explanation,
      "",
    ].join("\n");
  }, [ChallengeDetails, explanation]);

  // Memoize combined markdown so it's not rebuilt on every render
  const combinedMarkdown = useMemo(() => buildCombined(), [buildCombined]);

  // Memoized markdown area to avoid re-renders unless content changes
  const MarkdownArea = React.memo(
    function MarkdownArea({ value }) {
      return (
        <Suspense
          fallback={
            <div className="p-6 text-slate-400">Loading statement...</div>
          }
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeSanitize, rehypeKatex]}
          >
            {value}
          </ReactMarkdown>
        </Suspense>
      );
    },
    (prev, next) => prev.value === next.value,
  );

  // Defer heavy markdown rendering until the browser is idle to avoid main-thread jank
  const [showMarkdown, setShowMarkdown] = useState(false);
  useEffect(() => {
    let id = null;
    if (typeof window !== "undefined" && window.requestIdleCallback) {
      id = window.requestIdleCallback(() => setShowMarkdown(true), {
        timeout: 500,
      });
    } else {
      id = setTimeout(() => setShowMarkdown(true), 150);
    }
    return () => {
      if (typeof window !== "undefined" && window.cancelIdleCallback && id) {
        window.cancelIdleCallback(id);
      } else if (id) clearTimeout(id);
    };
  }, []);

  // Derived contest timing (use current time derived from server offset when needed)
  const now = Date.now() + serverOffsetRef.current;
  const contestStartMs = contestMeta
    ? new Date(contestMeta.startTime).getTime()
    : null;
  const contestEndMs = contestMeta
    ? new Date(contestMeta.endTime).getTime()
    : null;
  const started = contestMeta ? now >= contestStartMs : false;
  const ended = contestMeta ? now > contestEndMs : false;
  const contestBlocked = constid ? !started || ended : false;
  const remainingMs = contestMeta ? Math.max(0, contestEndMs - now) : 0;

  const formatRemaining = (ms) => {
    const total = Math.max(0, Math.floor(ms / 1000));
    const days = Math.floor(total / 86400);
    const hours = Math.floor((total % 86400) / 3600);
    const mins = Math.floor((total % 3600) / 60);
    const secs = total % 60;
    if (days > 0) return `${days}d ${hours}h ${mins}m`;
    return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col h-screen bg-[#0b0b0d] font-sans text-slate-200">
      {/* 1. Modern Header */}
      <header className="h-16 flex items-center justify-between px-6 bg-zinc-900/60 backdrop-blur-md border-b border-slate-800 z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white rounded-lg shadow-md">
            <Terminal className="w-5 h-5 text-black" />
          </div>
          <div className="flex flex-col max-w-md truncate">
            <h1 className="text-lg font-semibold text-white tracking-tight truncate">
              {ChallengeDetails.title}
            </h1>
            <div className="flex items-center gap-3 mt-1">
              {ChallengeDetails.status && (
                <span
                  className={`text-xs font-semibold px-2 py-1 rounded-full border bg-zinc-950/70 ${
                    ChallengeDetails.status.toLowerCase().includes("solved")
                      ? "border-emerald-500/30 text-emerald-200"
                      : ChallengeDetails.status
                            .toLowerCase()
                            .includes("partial")
                        ? "border-amber-500/30 text-amber-200"
                        : "border-rose-500/30 text-rose-200"
                  }`}
                >
                  {ChallengeDetails.status}
                </span>
              )}
              {typeof ChallengeDetails.userScore !== "undefined" &&
                ChallengeDetails.userScore !== null && (
                  <span className="text-xs text-slate-300 font-mono">
                    {ChallengeDetails.userScore}/
                    {ChallengeDetails.maxScore ?? "-"}
                  </span>
                )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Contest status / countdown */}
          {constid && contestMeta && (
            <Countdown
              contestMeta={contestMeta}
              serverOffsetRef={serverOffsetRef}
            />
          )}
          <div className="relative">
            <select
              className="appearance-none bg-zinc-800 border border-zinc-700 text-slate-200 text-sm rounded-lg block w-56 p-2.5 outline-none transition-all cursor-pointer font-medium"
              value={languageId}
              onChange={(e) => setLanguageId(e.target.value)}
            >
              {languageOptions.map((lang) => (
                <option key={lang.id} value={lang.id}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <Buttonv2
              text={runLoading ? "Running..." : "Run"}
              ApiCall={async () => await Run()}
              funct={() => {}}
              loading={runLoading}
              disabled={
                loading || actionLock === "submit" || actionLock === "run"
              }
              variant="blue"
            />

            <Buttonv2
              text={loading ? "Submitting..." : "Submit"}
              ApiCall={async () => await Submit()}
              funct={() => {}}
              loading={loading}
              disabled={
                runLoading || actionLock === "run" || actionLock === "submit"
              }
              variant="green"
            />
          </div>
        </div>
      </header>

      {/* 2. Floating Split Layout */}
      <div className="flex-1 flex gap-6 p-6 overflow-hidden h-[calc(100vh-4rem)]">
        {/* Left Panel: Problem Statement (Floating Card) */}
        <div className="w-5/12 flex flex-col bg-zinc-900 rounded-2xl shadow-sm border border-zinc-800 overflow-hidden">
          <div className="overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-zinc-700">
            <div className="md-prose prose prose-invert max-w-none prose-headings:font-semibold prose-headings:text-slate-100 prose-p:text-slate-300 prose-p:leading-relaxed">
              {/* Statement */}
              <h2 className="text-lg mb-4 text-white">Description</h2>

              <div className="md-prose">
                <MarkdownArea value={combinedMarkdown} />
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Code Editor (Floating Card) */}
        <div className="w-7/12 flex flex-col rounded-2xl shadow-xl overflow-hidden border border-zinc-800 bg-[#111213]">
          {/* Editor Header */}
          {/* removed filename header to let editor blend seamlessly */}

          <div className="flex-1 relative min-h-0">
            <CodeEditor
              ref={editorRef}
              languageId={languageId}
              boilerPlate={BoilerPlate}
              editorOptions={editorOptions}
            />
          </div>

          {/* Compact run section at the bottom of the IDE panel */}
          <div className="h-72 border-t border-zinc-800 bg-zinc-900/80 px-0 py-0 flex flex-col gap-0">
            <div className="flex items-center justify-between px-3 py-2">
              <p className="text-[12px] uppercase tracking-wider text-slate-300 font-semibold">
                Sample Input
              </p>
              {runResult && !runLoading && (
                <div className="flex items-center gap-3">
                  {!useCustomStdin && runVerdict && (
                    <span
                      className={`text-xs font-semibold ${
                        runVerdict === "Accepted"
                          ? "text-emerald-400"
                          : "text-rose-400"
                      }`}
                    >
                      {runVerdict}
                    </span>
                  )}
                  <span className="text-[11px] text-gray-300 font-mono">
                    {runResult?.time ? `${runResult.time}s` : "0.00s"}
                    {runResult?.memory ? ` • ${runResult.memory}KB` : ""}
                  </span>
                </div>
              )}
            </div>

            <label className="flex items-center gap-2 text-[12px] text-slate-300 px-3">
              <input
                type="checkbox"
                className="accent-zinc-300"
                checked={useCustomStdin}
                onChange={(e) => setUseCustomStdin(e.target.checked)}
              />
              Use custom stdin
            </label>

            <textarea
              className="h-20 w-full resize-none rounded-none border-0 bg-zinc-950/40 px-4 py-3 text-xs text-slate-200 placeholder:text-zinc-500 outline-none focus:border-white/10 disabled:opacity-60"
              placeholder={
                useCustomStdin
                  ? "Type custom stdin (multiline supported)"
                  : "Using sample input from problem statement"
              }
              value={
                useCustomStdin ? runStdin : ChallengeDetails?.sampleInput || ""
              }
              onChange={(e) => setRunStdin(e.target.value)}
              disabled={!useCustomStdin}
            />

            <div className="px-3 py-2">
              <p className="text-[12px] uppercase tracking-wider text-slate-300 font-semibold">
                Result
              </p>
            </div>

            <div className="flex-1 rounded-none border-0 bg-zinc-950/40 px-4 py-3 overflow-auto">
              {runLoading ? (
                <p className="text-xs text-slate-400">Running...</p>
              ) : runError ? (
                <pre className="text-xs text-red-300 whitespace-pre-wrap font-mono">
                  {runError}
                </pre>
              ) : (
                <div className="space-y-3 text-xs font-mono w-full">
                  {runResult ? (
                    <>
                      {runResult.compile_output ? (
                        <div className="space-y-1">
                          <div className="text-slate-400 uppercase tracking-wider text-[10px]">
                            Compile output
                          </div>
                          <pre className="text-amber-200 whitespace-pre-wrap">
                            {formatOutput(runResult.compile_output)}
                          </pre>
                        </div>
                      ) : null}

                      {runResult.stderr ? (
                        <div className="space-y-1">
                          <div className="text-slate-400 uppercase tracking-wider text-[10px]">
                            Stderr
                          </div>
                          <pre className="text-rose-200 whitespace-pre-wrap">
                            {formatOutput(runResult.stderr)}
                          </pre>
                        </div>
                      ) : null}

                      {runResult.stdout ? (
                        <div className="space-y-1">
                          <div className="text-slate-400 uppercase tracking-wider text-[10px]">
                            Stdout
                          </div>
                          <pre className="text-slate-200 whitespace-pre-wrap">
                            {formatOutput(runResult.stdout)}
                          </pre>
                        </div>
                      ) : null}

                      {!runResult.compile_output &&
                      !runResult.stderr &&
                      !runResult.stdout ? (
                        <p className="text-slate-400">(no output)</p>
                      ) : null}
                    </>
                  ) : (
                    <p className="text-slate-400">Click Run to execute.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Result Modal */}
      <Dialog.Root open={showResult} onOpenChange={setShowResult}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] duration-300" />
          <Dialog.Content className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-[92vw] max-w-3xl bg-zinc-900/80 text-white rounded-3xl shadow-[0_14px_34px_rgba(0,0,0,0.38)] p-0 z-[210] overflow-hidden outline-none border border-white/10">
            <div className="px-6 py-3 flex items-center gap-3 border-b border-white/10 bg-zinc-900/92">
              <Dialog.Title className="text-sm font-medium text-slate-200">
                Result
              </Dialog.Title>
              {submissionResult && (
                <div
                  className={`ml-4 text-sm font-semibold ${submissionResult.verdict === "Accepted" ? "text-emerald-400" : "text-rose-400"}`}
                >
                  {submissionResult.verdict}
                  {submissionResult.score !== undefined && (
                    <span className="text-xs text-slate-400 ml-2 font-normal">
                      • {submissionResult.score}/
                      {submissionResult.maxScore ?? 100}
                    </span>
                  )}
                </div>
              )}
              <div className="ml-auto">
                <Dialog.Close asChild>
                  <button className="text-slate-400 hover:text-white transition-colors bg-transparent rounded p-1">
                    <XCircle className="w-5 h-5" />
                  </button>
                </Dialog.Close>
              </div>
            </div>

            <div className="p-4 max-h-[70vh] overflow-y-auto">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16 space-y-4">
                  <div className="relative">
                    <div className="w-12 h-12 border-4 border-zinc-800 border-t-zinc-200 rounded-full animate-spin"></div>
                  </div>
                  <p className="text-slate-300 font-medium">
                    Evaluating your code...
                  </p>
                </div>
              ) : submissionResult ? (
                <div className="space-y-4">
                  <div className="px-3 py-2 rounded-2xl border border-white/10 bg-zinc-900/92 shadow-[0_10px_24px_rgba(0,0,0,0.28)] flex items-center">
                    <span
                      className={`text-sm font-medium ${submissionResult.verdict === "Accepted" ? "text-emerald-400" : "text-rose-400"}`}
                    >
                      {submissionResult.verdict}
                    </span>
                    {submissionResult.message && (
                      <span className="ml-3 text-xs text-slate-400">
                        {submissionResult.message}
                      </span>
                    )}
                  </div>

                  {submissionResult.result &&
                  submissionResult.result.length > 0 ? (
                    <div>
                      <h3 className="text-sm text-slate-300 uppercase tracking-wider mb-2">
                        Test Cases
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {submissionResult.result.map((res, i) => {
                          const statusLabel =
                            typeof res?.status === "string"
                              ? res.status
                              : res?.pass
                                ? "Accepted"
                                : "Wrong Answer";
                          const passed = statusLabel
                            .toLowerCase()
                            .includes("accepted");
                          const colorClass = passed
                            ? "text-emerald-400"
                            : "text-rose-400";
                          return (
                            <div
                              key={i}
                              className="p-3 rounded-2xl border border-white/10 bg-zinc-900/92 shadow-[0_10px_24px_rgba(0,0,0,0.22)]"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <span className="text-xs font-mono text-slate-400">
                                    #{i + 1}
                                  </span>
                                  <span
                                    className={`text-sm font-medium ${colorClass}`}
                                  >
                                    {statusLabel}
                                  </span>
                                </div>
                                <div className="text-xs text-slate-400 font-mono text-right">
                                  <div>{res.time || "0.00"}s</div>
                                  <div>{res.memory || "0"}KB</div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="text-slate-400">
                      No test cases available
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-slate-400">No results</div>
              )}
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
};

export default SolvePage;
