import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { FileUpload } from "./component/ui/file-upload";
import { Button } from "./component/ui/stateful-button";
import { FlipWords } from "./component/ui/flip-words";
import { Input } from "./component/ui/input";
import { Label } from "./component/ui/label";
import { IconSparkles } from "@tabler/icons-react";
import UserAuth from "./UserAuth";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeSanitize from "rehype-sanitize";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
const backendURL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
// legacy markdown helper removed in favor of react-markdown

function MarkdownField({ name, value, onChange, rows = 6 }) {
  const [tab, setTab] = useState("edit");
  const ref = useRef(null);

  const insert = (txt) => {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart || 0;
    const end = el.selectionEnd || 0;
    const before = el.value.slice(0, start);
    const after = el.value.slice(end);
    const newVal = before + txt + after;
    onChange({ target: { name, value: newVal } });
    // restore focus and cursor
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + txt.length;
      el.setSelectionRange(pos, pos);
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className={`text-sm px-2 py-1 rounded ${tab === "edit" ? "bg-zinc-700 text-white" : "text-slate-300"}`}
            onClick={() => setTab("edit")}
          >
            Edit
          </button>
          <button
            type="button"
            className={`text-sm px-2 py-1 rounded ${tab === "preview" ? "bg-zinc-700 text-white" : "text-slate-300"}`}
            onClick={() => setTab("preview")}
          >
            Preview
          </button>
        </div>
        {tab === "edit" && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="text-xs px-2 py-1 bg-zinc-800 text-slate-200 rounded"
              onClick={() => insert("**bold**")}
            >
              B
            </button>
            <button
              type="button"
              className="text-xs px-2 py-1 bg-zinc-800 text-slate-200 rounded"
              onClick={() => insert("*italic*")}
            >
              I
            </button>
            <button
              type="button"
              className="text-xs px-2 py-1 bg-zinc-800 text-slate-200 rounded"
              onClick={() => insert("`code`")}
            >{`<>`}</button>
            <button
              type="button"
              className="text-xs px-2 py-1 bg-zinc-800 text-slate-200 rounded"
              onClick={() => insert("\n\n- ")}
            >
              • List
            </button>
          </div>
        )}
      </div>
      {tab === "edit" ? (
        <textarea
          name={name}
          ref={ref}
          rows={rows}
          value={value}
          onChange={onChange}
          className="w-full rounded-md bg-zinc-800 text-white p-4 text-sm placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        />
      ) : (
        <div className="w-full rounded-md bg-zinc-800 text-slate-200 p-4 text-sm md-prose">
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeSanitize, rehypeKatex]}
          >
            {value || "_(empty)_"}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
}

export default function ProblemCreationForm() {
  const navigate = useNavigate();
  const words = ["Problem", "Challenge", "Question"];
  const [zip, SetZip] = useState(null);
  const [problemId, SetProblemId] = useState(null);
  const [parsedTests, setParsedTests] = useState([]);
  const [selectedSampleUid, setSelectedSampleUid] = useState(null);
  const [payloadPreview, setPayloadPreview] = useState(null);
  const [parseLoading, setParseLoading] = useState(false);
  const [previewModal, setPreviewModal] = useState(null); // { type: 'input'|'output', idx }
  const [parsedMeta, setParsedMeta] = useState({ inputs: [], outputs: [] });
  const [User, setUser] = useState();
  const [uploadClearSignal, setUploadClearSignal] = useState(0);
  const handleUpload = async () => {
    if (!problemId) {
      toast.error(
        "Please Click Add Problem first before uploading the testcase",
      );
      return;
    }
    try {
      const formData = new FormData();
      formData.append("zip", zip);
      formData.append("problemId", problemId);
      // include which testcase number should be treated as public/sample
      // compute numeric testcase index (1-based) from selected uid, backend expects a number
      const isPublicIndex = selectedSampleUid
        ? parsedTests.findIndex((t) => t.uid === selectedSampleUid) + 1
        : "";
      formData.append("isPublicNo", isPublicIndex ? String(isPublicIndex) : "");
      // show a preview payload for debugging / feeding to backend
      setPayloadPreview({
        fileName: zip?.name || null,
        problemId,
        isPublicNo: isPublicIndex || null,
        maxMarks: form.maxMarks ? Number(form.maxMarks) : null,
        parsedCount: parsedTests.length,
      });
      const res = await fetch(`${backendURL}/api/upload-testcases`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      const response = await res.json();
      if (response && response.ok) {
        toast.success(response.message);
        SetZip(null);
        setUploadClearSignal((s) => s + 1);
      } else {
        toast.error(response.message);
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    // parse zip on client-side when selected
    const parseZip = async (file) => {
      try {
        setParseLoading(true);
        if (!file) {
          setParsedTests([]);
          setParseLoading(false);
          return;
        }
        const JSZip = (await import("jszip")).default;
        const j = new JSZip();
        const z = await j.loadAsync(file);

        // Prefer structured folders like Testcases/input and Testcases/output
        const allFiles = Object.keys(z.files).filter((f) => !z.files[f].dir);
        const lowerFiles = allFiles.map((f) => f.toLowerCase());

        const inputCandidates = allFiles.filter(
          (f, i) =>
            /(^|\/|\\)input(\/|\\)/i.test(lowerFiles[i]) ||
            lowerFiles[i].includes("/testcases/input/") ||
            lowerFiles[i].startsWith("input/"),
        );
        const outputCandidates = allFiles.filter(
          (f, i) =>
            /(^|\/|\\)output(\/|\\)/i.test(lowerFiles[i]) ||
            lowerFiles[i].includes("/testcases/output/") ||
            lowerFiles[i].startsWith("output/"),
        );

        let inputs = [];
        let outputs = [];

        if (inputCandidates.length && outputCandidates.length) {
          // read those candidates and sort by filename
          inputCandidates.sort();
          outputCandidates.sort();
          for (const fname of inputCandidates) {
            const txt = await z.files[fname].async("text");
            inputs.push({ name: fname, content: txt });
          }
          for (const fname of outputCandidates) {
            const txt = await z.files[fname].async("text");
            outputs.push({ name: fname, content: txt });
          }
        } else {
          // fallback: heuristic by extension
          const files = allFiles.sort();
          for (const fname of files) {
            const lower = fname.toLowerCase();
            const txt = await z.files[fname].async("text");
            if (lower.match(/\.(in|input|stdin|txt)$/)) {
              inputs.push({ name: fname, content: txt });
            } else if (lower.match(/\.(out|output|ans)$/)) {
              outputs.push({ name: fname, content: txt });
            }
          }
        }

        const count = Math.min(inputs.length, outputs.length);
        const parsed = [];
        const base = Date.now();
        for (let i = 0; i < count; i++) {
          parsed.push({
            uid: `${base}_${i}`,
            input: inputs[i].content,
            output: outputs[i].content,
            isPublic: false,
            inputName: inputs[i].name,
            outputName: outputs[i].name,
          });
        }

        setParsedTests(parsed);
        setParsedMeta({
          inputs: inputs.map((p) => p.name),
          outputs: outputs.map((p) => p.name),
        });
        setParseLoading(false);
      } catch (e) {
        console.error("Failed to parse zip:", e);
        setParsedTests([]);
        setParseLoading(false);
      }
    };

    parseZip(zip);
  }, [zip]);

  useEffect(() => {
    UserAuth(setUser);
  }, []);
  const [form, setForm] = useState({
    title: "",
    statement: "",
    inputFormat: "",
    outputFormat: "",
    constraints: "",
    sampleInput: "",
    sampleOutput: "",
    explanation: "",
    maxMarks: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch(`${backendURL}/admin/contest/problem`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        ...form,
        maxMarks: form.maxMarks ? Number(form.maxMarks) : null,
      }),
    });

    const data = await res.json();
    if (data.ok) {
      toast.success(data.message);
      SetProblemId(data.problemId);
    } else {
      toast.error("Failed to create problem");
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.14),transparent_28%),linear-gradient(180deg,#050505_0%,#09090b_45%,#020202_100%)] px-4 py-6 sm:px-6 lg:px-8 text-slate-200">
      <div className="mx-auto flex w-full max-w-screen-2xl flex-col gap-6">
        <header className="rounded-3xl border border-white/10 bg-white/5 px-6 py-6 shadow-[0_18px_50px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <p className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Add New <FlipWords words={words} />
            </p>
            <button
              onClick={() => navigate("/admin/autocraft")}
              className="relative inline-flex h-12 overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50 hover:shadow-[0_0_10px_0_rgba(139,92,246,0.7),0_0_20px_0_rgba(236,72,153,0.5)]"
            >
              <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
              <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950 px-3 py-1 text-sm font-medium text-white backdrop-blur-3xl">
                AutoCraft <IconSparkles className="mx-1a" />
              </span>
            </button>
          </div>
        </header>

        <form
          onSubmit={handleSubmit}
          className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-8 xl:grid-cols-2"
        >
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_18px_50px_rgba(0,0,0,0.24)] backdrop-blur-xl">
            <div className="h-full space-y-4">
              <Label className="text-white mb-2">Title</Label>
              <Input
                name="title"
                placeholder="Problem Title"
                onChange={handleChange}
                required
                className="bg-zinc-800 text-white"
              />

              <div className="mt-4" />

              <Label className="text-white mt-4 mb-2">Problem Statement</Label>
              <MarkdownField
                name="statement"
                value={form.statement}
                onChange={handleChange}
                rows={6}
              />

              <Label className="text-white mt-4 mb-2">Input Format</Label>
              <MarkdownField
                name="inputFormat"
                value={form.inputFormat}
                onChange={handleChange}
                rows={4}
              />

              <Label className="text-white mt-4 mb-2">Output Format</Label>
              <MarkdownField
                name="outputFormat"
                value={form.outputFormat}
                onChange={handleChange}
                rows={4}
              />

              <Label className="text-white mt-4 mb-2">Constraints</Label>
              <MarkdownField
                name="constraints"
                value={form.constraints}
                onChange={handleChange}
                rows={4}
              />

              <div className="mt-4">
                <Label className="text-white mb-2">Max Score</Label>
                <Input
                  name="maxMarks"
                  type="number"
                  placeholder="e.g. 100 (default: 100)"
                  onChange={handleChange}
                  className="bg-zinc-800 text-white"
                />
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_18px_50px_rgba(0,0,0,0.24)] backdrop-blur-xl">
            <div className="h-full flex flex-col gap-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <Label className="text-white mb-2">Sample Input</Label>
                  <textarea
                    name="sampleInput"
                    placeholder="Sample Input"
                    onChange={handleChange}
                    required
                    rows={4}
                    className="w-full rounded-md bg-zinc-800 text-white p-4 text-sm placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  />
                </div>
                <div className="flex-1">
                  <Label className="text-white mb-2">Sample Output</Label>
                  <textarea
                    name="sampleOutput"
                    placeholder="Sample Output"
                    onChange={handleChange}
                    required
                    rows={4}
                    className="w-full rounded-md bg-zinc-800 text-white p-4 text-sm placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  />
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="submit"
                  className="relative inline-flex h-12 overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50"
                >
                  <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
                  <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950 px-3 py-1 text-sm font-medium text-white backdrop-blur-3xl">
                    Add Problem
                  </span>
                </button>
              </div>

              <div className="flex flex-col gap-3 mt-8">
                <Label className="text-white">Upload Test Cases (.zip)</Label>
                <div className="mt-2 p-4 bg-zinc-950 rounded-md border border-zinc-800">
                  <FileUpload
                    onChange={SetZip}
                    showPreview={false}
                    dark={true}
                    clearSignal={uploadClearSignal}
                  />
                </div>

                <div className="mt-4 flex items-center justify-end gap-3">
                  <div>
                    <Button
                      type="button"
                      noTextLayout
                      onClick={() => {
                        SetZip(null);
                        setParsedTests([]);
                        setSelectedSampleUid(null);
                        setPayloadPreview(null);
                        setUploadClearSignal((s) => s + 1);
                      }}
                    >
                      Clear Selection
                    </Button>
                  </div>
                  <div>
                    <Button type="button" onClick={handleUpload}>
                      Upload TestCases
                    </Button>
                  </div>
                </div>

                {parsedTests && parsedTests.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-sm font-semibold text-white mb-2">
                      Parsed Testcases
                    </h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                      {parsedTests.map((t, idx) => (
                        <div
                          key={t.uid || idx}
                          className="p-3 bg-zinc-800 rounded-md border border-zinc-700 flex items-center justify-between"
                        >
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="text-sm font-medium text-white">
                                  Testcase #{idx + 1}
                                </div>
                                <div className="text-xs text-slate-400">
                                  {t.inputName || t.outputName || "(unnamed)"}
                                </div>
                              </div>
                              <div className="ml-4 text-xs text-slate-300">
                                <button
                                  type="button"
                                  className="text-xs text-sky-400 hover:underline mr-2"
                                  onClick={() =>
                                    setPreviewModal({ type: "input", idx })
                                  }
                                >
                                  View Input
                                </button>
                                <button
                                  type="button"
                                  className="text-xs text-amber-300 hover:underline"
                                  onClick={() =>
                                    setPreviewModal({ type: "output", idx })
                                  }
                                >
                                  View Output
                                </button>
                              </div>
                            </div>
                            {/* <div className="mt-2 text-xs text-slate-400">
                              {String(t.input || "").slice(0, 120)}
                              {t.input && t.input.length > 120 ? "..." : ""}
                            </div> */}
                          </div>
                          <div className="ml-4 flex flex-col items-end gap-2">
                            <div className="mx-2 flex items-center gap-1">
                              <label className="text-xs text-slate-300">
                                Sample Testcase
                              </label>
                              <label className=" gap-2 text-sm">
                                <input
                                  type="radio"
                                  name="sample"
                                  checked={selectedSampleUid === t.uid}
                                  onChange={() => setSelectedSampleUid(t.uid)}
                                />
                              </label>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {!parsedTests.length && zip && (
                  <div className="mt-4 p-3 bg-zinc-800 rounded-md border border-zinc-700">
                    <div className="text-sm text-slate-300 mb-2">
                      No matched input/output pairs found in zip.
                    </div>
                    <div className="text-xs text-slate-400">
                      Inputs found: {parsedMeta.inputs.length}
                    </div>
                    <ul className="text-xs text-slate-400 list-disc ml-4 max-h-28 overflow-auto">
                      {parsedMeta.inputs.map((n, i) => (
                        <li key={i}>{n}</li>
                      ))}
                    </ul>
                    <div className="text-xs text-slate-400 mt-2">
                      Outputs found: {parsedMeta.outputs.length}
                    </div>
                    <ul className="text-xs text-slate-400 list-disc ml-4 max-h-28 overflow-auto">
                      {parsedMeta.outputs.map((n, i) => (
                        <li key={i}>{n}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {payloadPreview && (
                  <div className="mt-4 p-3 bg-zinc-800 rounded-md border border-zinc-700">
                    <div className="text-sm text-slate-300 mb-2">
                      Payload Preview (send to backend):
                    </div>
                    <pre className="text-xs text-slate-200 max-h-40 overflow-auto">
                      {JSON.stringify(payloadPreview, null, 2)}
                    </pre>
                  </div>
                )}
                {previewModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div
                      className="absolute inset-0 bg-black/80"
                      onClick={() => setPreviewModal(null)}
                    />
                    <div className="relative bg-zinc-800/95 rounded-lg p-6 max-w-3xl w-[90%] max-h-[80vh] overflow-auto border border-zinc-700 shadow-lg ring-1 ring-white/5">
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-lg font-semibold text-white">
                          {previewModal.type === "input"
                            ? "Input Preview"
                            : "Output Preview"}{" "}
                          - Testcase #{previewModal.idx + 1}
                        </div>
                        <button
                          className="text-slate-300"
                          onClick={() => setPreviewModal(null)}
                        >
                          Close
                        </button>
                      </div>
                      <div className="bg-zinc-900 rounded-md p-4">
                        <pre className="text-xs text-slate-200 whitespace-pre-wrap break-words">
                          {previewModal &&
                            parsedTests[previewModal.idx] &&
                            (previewModal.type === "input"
                              ? parsedTests[previewModal.idx].input
                              : parsedTests[previewModal.idx].output)}
                        </pre>
                      </div>
                    </div>
                  </div>
                )}
                {parseLoading && (
                  <div className="mt-4 flex items-center gap-3">
                    <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin border-sky-400" />
                    <div className="text-sm text-slate-300">Parsing zip...</div>
                  </div>
                )}
                <div className="mt-6">
                  <Label className="text-white mb-2">Explanation</Label>
                  <MarkdownField
                    name="explanation"
                    value={form.explanation}
                    onChange={handleChange}
                    rows={6}
                  />
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
