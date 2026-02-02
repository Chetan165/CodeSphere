import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import UserAuth from "./UserAuth";
import { useNavigate } from "react-router-dom";
import { Label } from "./component/ui/label";
import { Input } from "./component/ui/input";
import { cn } from "./utils/cn";
import {
  IconBrandGithub,
  IconBrandGoogle,
  IconBrandOnlyfans,
} from "@tabler/icons-react";

const LabelInputContainer = ({ children, className }) => {
  return (
    <div className={cn("flex w-full flex-col space-y-2", className)}>
      {children}
    </div>
  );
};

export default function ContestCreationForm() {
  const navigate = useNavigate();
  const [user, setUser] = useState();
  const [problems, SetProblems] = useState([]);
  const [search, SetSearch] = useState("");
  const [chosenProblems, SetChosenProblems] = useState([]);
  const fetchProblem = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/problems", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          search: search,
        }),
        credentials: "include",
      });
      const response = await res.json();
      if (response && response.ok) {
        SetProblems(response.problems);
      }
    } catch (err) {
      console.log(err.json());
    }
  };

  useEffect(() => {
    UserAuth(setUser);
  }, []);
  const [form, setForm] = useState({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
  });
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("http://localhost:3000/admin/contest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        ...form,
        startTime: new Date(form.startTime),
        endTime: new Date(form.endTime),
        SelectedProblems: chosenProblems,
      }),
    });

    const data = await res.json();
    if (data.ok) {
      toast.success("Contest created successfully!");
      navigate("/contests");
    } else {
      alert("Failed to create contest");
    }
  };
  useEffect(() => {
    if (search.trim() !== "") {
      setTimeout(() => fetchProblem(), 500);
    }
  }, [search]);
  useEffect(() => {
    console.log(problems);
  }, [problems]);

  return user && user.uid ? (
    <div>
      <div className="w-full flex flex-row justify-center p-10">
        <h1 className="text-white text-4xl font-semibold">
          Create New Contest
        </h1>
      </div>
      {/* Contest creation form */}
      <form onSubmit={handleSubmit} className="p-4 max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left half: contest fields */}
          <div className="flex-1 space-y-4">
            <LabelInputContainer>
              <Label htmlFor="title">Title</Label>
              <input
                id="title"
                name="title"
                placeholder="Contest 1A"
                type="text"
                value={form.title}
                onChange={handleChange}
                required
                className="rounded-lg bg-black text-white border border-white/20 p-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-400 hover:border-pink-400 hover:shadow-[0_0_10px_0_rgba(236,72,153,0.7),0_0_20px_0_rgba(139,92,246,0.5)] focus:border-blue-400 focus:shadow-[0_0_10px_0_rgba(59,130,246,0.7),0_0_20px_0_rgba(236,72,153,0.5)]"
              />
            </LabelInputContainer>
            <LabelInputContainer>
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                name="description"
                placeholder="Description"
                value={form.description}
                onChange={handleChange}
                required
                rows={4}
                className="rounded-lg bg-black text-white border border-white/20 p-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-400 hover:border-blue-400 hover:shadow-[0_0_10px_0_rgba(59,130,246,0.7),0_0_20px_0_rgba(59,130,246,0.5)] focus:border-blue-400 focus:shadow-[0_0_10px_0_rgba(59,130,246,0.7),0_0_20px_0_rgba(59,130,246,0.5)]"
              />
            </LabelInputContainer>
            <LabelInputContainer className="w-fit">
              <Label htmlFor="startTime">Start Time</Label>
              <input
                id="startTime"
                name="startTime"
                type="datetime-local"
                value={form.startTime}
                onChange={handleChange}
                required
                className="rounded-lg bg-black text-white border border-white/20 p-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-400 hover:border-pink-400 hover:shadow-[0_0_10px_0_rgba(236,72,153,0.7),0_0_20px_0_rgba(139,92,246,0.5)] focus:border-blue-400 focus:shadow-[0_0_10px_0_rgba(59,130,246,0.7),0_0_20px_0_rgba(236,72,153,0.5)]"
              />
            </LabelInputContainer>
            <LabelInputContainer className="w-fit">
              <Label htmlFor="endTime">End Time</Label>
              <input
                id="endTime"
                name="endTime"
                type="datetime-local"
                value={form.endTime}
                onChange={handleChange}
                required
                className="rounded-lg bg-black text-white border border-white/20 p-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-400 hover:border-blue-400 hover:shadow-[0_0_10px_0_rgba(59,130,246,0.7),0_0_20px_0_rgba(59,130,246,0.5)] focus:border-blue-400 focus:shadow-[0_0_10px_0_rgba(59,130,246,0.7),0_0_20px_0_rgba(59,130,246,0.5)]"
              />
            </LabelInputContainer>
          </div>
          {/* Right half: problem search and selection */}
          <div className="flex-1 space-y-6">
            <div className="rounded-xl p-[1px] bg-gradient-to-tr from-blue-500 via-pink-500 to-purple-500 shadow-lg">
              <div className="bg-zinc-950 backdrop-blur-md rounded-xl p-5 border-[0.5px] border-transparent">
                <h2 className="text-xl font-bold mb-3 text-white tracking-wide drop-shadow">
                  Add Challenges
                </h2>
                <LabelInputContainer>
                  <Label htmlFor="problem_title">Search by problem title</Label>
                  <Input
                    id="problem_title"
                    name="problem_title"
                    placeholder="Search by problem title"
                    value={search}
                    onChange={(e) => SetSearch(e.target.value)}
                    className="bg-zinc-800 text-white border-none focus:ring-2 focus:ring-pink-500 placeholder:text-zinc-400 shadow-input"
                  />
                </LabelInputContainer>
                {/* List search results */}
                <ul className="mt-4 space-y-2">
                  {problems.map((problem) => (
                    <li
                      key={problem.id}
                      onClick={() => {
                        if (!chosenProblems?.find((p) => p.id === problem.id)) {
                          SetChosenProblems([...chosenProblems, problem]);
                        }
                      }}
                      className="p-2 rounded-lg bg-zinc-800/80 border border-pink-500/30 hover:scale-[1.03] hover:bg-gradient-to-r hover:from-blue-600/40 hover:to-pink-600/40 transition-all duration-200 cursor-pointer text-white shadow-sm"
                    >
                      {problem.title}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            {/* Display selected problems */}
            <div className="rounded-xl p-[1px] bg-gradient-to-tr from-blue-500 via-pink-500 to-purple-500 shadow-lg">
              <div className="bg-zinc-950 backdrop-blur-md rounded-xl p-5 border-[0.5px] border-transparent">
                <h3 className="text-lg font-semibold mb-2 text-white">
                  Selected Challenges
                </h3>
                {chosenProblems?.length === 0 ? (
                  <p className="text-zinc-400">No Challenges selected yet.</p>
                ) : (
                  <ul className="space-y-2">
                    {chosenProblems?.map((problem) => (
                      <li
                        key={problem.id}
                        className="p-2 flex justify-between items-center rounded-lg bg-zinc-800/80 border border-pink-500/30 text-white shadow-sm"
                      >
                        <span>{problem.title}</span>
                        <button
                          onClick={() =>
                            SetChosenProblems(
                              chosenProblems.filter((p) => p.id !== problem.id),
                            )
                          }
                          className="text-pink-400 text-sm hover:underline hover:text-red-500 transition-colors"
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* Submit button */}
        <div className="max-w-md mx-auto">
          <button
            type="submit"
            className="relative inline-flex h-12 overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50"
          >
            <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
            <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950 px-3 py-1 text-sm font-medium text-white backdrop-blur-3xl">
              Create Contest
            </span>
          </button>
        </div>
      </form>
    </div>
  ) : (
    <div></div>
  );
}
