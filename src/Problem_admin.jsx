import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { FileUpload } from "./component/ui/file-upload";
import { Button } from "./component/ui/stateful-button";
import { FlipWords } from "./component/ui/flip-words";
import { IconSparkles } from "@tabler/icons-react";

export default function ProblemCreationForm() {
  const navigate = useNavigate();
  const words = ["Problem", "Challenge", "Question"];
  const [zip, SetZip] = useState(null);
  const [problemId, SetProblemId] = useState(null);
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
      const res = await fetch("http://localhost:3000/api/upload-testcases", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      const response = await res.json();
      if (response && response.ok) {
        toast.success(response.message);
        SetZip(null);
        setTimeout(() => (window.location.href = "/contests"), 500);
      } else {
        toast.error(response.message);
      }
    } catch (err) {
      console.log(err);
    }
  };
  const fetchUser = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/user", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      const user = await response.json();
      if (user && user.uid && user.admin) {
        console.log(user.admin, user.uid);
      } else {
        window.location.href = "/";
      }
    } catch (err) {
      console.log(err);
    }
  };
  useEffect(() => {
    fetchUser();
  }, []);
  const [form, setForm] = useState({
    title: "",
    statement: "",
    inputFormat: "",
    outputFormat: "",
    constraints: "",
    sampleInput: "",
    sampleOutput: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("http://localhost:3000/admin/contest/problem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
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
    <div className="w-full h-full flex items-start justify-center bg-black py-8 px-2">
      <div className="min-h-screen w-full bg-black py-10 px-4 flex flex-col gap-12">
        <div className="flex flex-row items-start justify-around position-relative">
          <p className="text-4xl font-bold text-white mb-6 text-center tracking-tight w-1/3">
            Add New
            <FlipWords words={words} />
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
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-6xl mx-auto"
        >
          <div className="flex flex-col gap-6">
            <input
              name="title"
              placeholder="Problem Title"
              onChange={handleChange}
              required
              className="rounded-lg bg-black text-white border border-white/20 p-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-400 hover:border-pink-400 hover:shadow-[0_0_10px_0_rgba(236,72,153,0.7),0_0_20px_0_rgba(139,92,246,0.5)] focus:border-blue-400 focus:shadow-[0_0_10px_0_rgba(59,130,246,0.7),0_0_20px_0_rgba(236,72,153,0.5)]"
            />

            <textarea
              name="statement"
              placeholder="Problem Statement"
              onChange={handleChange}
              required
              rows={6}
              className="rounded-lg bg-black text-white border border-white/20 p-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-400 hover:border-blue-400 hover:shadow-[0_0_10px_0_rgba(59,130,246,0.7),0_0_20px_0_rgba(59,130,246,0.5)] focus:border-blue-400 focus:shadow-[0_0_10px_0_rgba(59,130,246,0.7),0_0_20px_0_rgba(59,130,246,0.5)] "
            />

            <input
              name="inputFormat"
              placeholder="Input Format"
              onChange={handleChange}
              required
              className="rounded-lg bg-black text-white border border-white/20 p-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-400 hover:border-pink-400 hover:shadow-[0_0_10px_0_rgba(236,72,153,0.7),0_0_20px_0_rgba(139,92,246,0.5)] focus:border-blue-400 focus:shadow-[0_0_10px_0_rgba(59,130,246,0.7),0_0_20px_0_rgba(236,72,153,0.5)]"
            />

            <input
              name="outputFormat"
              placeholder="Output Format"
              onChange={handleChange}
              required
              className="rounded-lg bg-black text-white border border-white/20 p-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-400 hover:border-blue-400 hover:shadow-[0_0_10px_0_rgba(59,130,246,0.7),0_0_20px_0_rgba(59,130,246,0.5)] focus:border-blue-400 focus:shadow-[0_0_10px_0_rgba(59,130,246,0.7),0_0_20px_0_rgba(59,130,246,0.5)] "
            />

            <input
              name="constraints"
              placeholder="Constraints"
              onChange={handleChange}
              required
              className="rounded-lg bg-black text-white border border-white/20 p-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-400 hover:border-pink-400 hover:shadow-[0_0_10px_0_rgba(236,72,153,0.7),0_0_20px_0_rgba(139,92,246,0.5)] focus:border-blue-400 focus:shadow-[0_0_10px_0_rgba(59,130,246,0.7),0_0_20px_0_rgba(236,72,153,0.5)] "
            />
          </div>
          <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row gap-6">
              <textarea
                name="sampleInput"
                placeholder="Sample Input"
                onChange={handleChange}
                required
                rows={4}
                className="flex-1 rounded-lg bg-black text-white border border-white/20 p-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-400 hover:border-pink-400 hover:shadow-[0_0_10px_0_rgba(236,72,153,0.7),0_0_20px_0_rgba(139,92,246,0.5)] focus:border-blue-400 focus:shadow-[0_0_10px_0_rgba(59,130,246,0.7),0_0_20px_0_rgba(236,72,153,0.5)]"
              />

              <textarea
                name="sampleOutput"
                placeholder="Sample Output"
                onChange={handleChange}
                required
                rows={4}
                className="flex-1 rounded-lg bg-black text-white border border-white/20 p-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-400 hover:border-blue-400 hover:shadow-[0_0_10px_0_rgba(59,130,246,0.7),0_0_20px_0_rgba(59,130,246,0.5)] focus:border-blue-400 focus:shadow-[0_0_10px_0_rgba(59,130,246,0.7),0_0_20px_0_rgba(59,130,246,0.5)]"
              />
            </div>
            <button
              type="submit"
              className="relative inline-flex h-12 overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50 hover:shadow-[0_0_10px_0_rgba(139,92,246,0.7),0_0_20px_0_rgba(236,72,153,0.5)]"
            >
              <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
              <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950 px-3 py-1 text-sm font-medium text-white backdrop-blur-3xl">
                Add Problem
              </span>
            </button>
            <div className="flex flex-col gap-3 mt-8">
              <label className="block text-white font-medium">
                Upload Test Cases (.zip)
              </label>
              <FileUpload onChange={SetZip} />
              {/* <input
                type="file"
                accept=".zip"
                onChange={(e) => SetZip(e.target.files[0])}
                className="file:bg-indigo-600 file:text-white file:rounded file:px-4 file:py-2 file:border-0 file:mr-4 text-white"
              /> */}
              <div className="flex h-40 w-full items-center justify-center">
                <Button onClick={handleUpload}>Upload TestCases</Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
