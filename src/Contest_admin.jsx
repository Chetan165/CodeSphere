import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import UserAuth from "./UserAuth";
import { useNavigate } from "react-router-dom";
import { Label } from "./component/ui/label";
import { Input } from "./component/ui/input";
import Buttonv2 from "./component/ui/Buttonv2";
import { cn } from "./utils/cn";
import {
  IconBrandGithub,
  IconBrandGoogle,
  IconBrandOnlyfans,
} from "@tabler/icons-react";

const backendURL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

const LabelInputContainer = ({ children, className }) => {
  return (
    <div className={cn("flex w-full flex-col space-y-2", className)}>
      {children}
    </div>
  );
};

const MotionTextarea = ({ value, onChange, placeholder, rows = 4 }) => {
  return (
    <div className="rounded-lg border border-white/10 bg-gradient-to-r from-sky-500/10 via-cyan-400/10 to-transparent p-[2px] transition duration-300">
      <textarea
        rows={rows}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-md bg-zinc-800 text-white px-3 py-2 text-sm placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      />
    </div>
  );
};

export default function ContestCreationForm() {
  const navigate = useNavigate();
  const [user, setUser] = useState();
  const [problems, SetProblems] = useState([]);
  const [search, SetSearch] = useState("");
  const [chosenProblems, SetChosenProblems] = useState([]);
  const [isPrivateContest, setIsPrivateContest] = useState(false);

  const fetchProblem = useCallback(async () => {
    try {
      const res = await fetch(`${backendURL}/api/problems`, {
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
  }, [search]);

  useEffect(() => {
    UserAuth(setUser, true);
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
    await createContest();
  };

  const createContest = async () => {
    try {
      const res = await fetch(`${backendURL}/admin/contest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...form,
          startTime: new Date(form.startTime),
          endTime: new Date(form.endTime),
          private: isPrivateContest,
          SelectedProblems: chosenProblems,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        toast.success("Contest created successfully!");
        navigate("/contests");
      } else {
        toast.error("Failed to create contest");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to create contest");
    }
  };
  useEffect(() => {
    if (search.trim() !== "") {
      setTimeout(() => fetchProblem(), 500);
    }
  }, [search, fetchProblem]);
  useEffect(() => {
    console.log(problems);
  }, [problems]);

  return user && user.uid ? (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.14),transparent_28%),linear-gradient(180deg,#050505_0%,#09090b_45%,#020202_100%)] px-4 py-6 sm:px-6 lg:px-8 text-slate-200">
      <div className="mx-auto flex w-full max-w-screen-2xl flex-col gap-6">
        <header className="rounded-3xl border border-white/10 bg-white/5 px-6 py-6 shadow-[0_18px_50px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:px-8">
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Create New Contest
          </h1>
        </header>

        {/* Contest creation form */}
        <form
          onSubmit={handleSubmit}
          className="mx-auto w-full max-w-7xl pb-20"
        >
          <div className="flex flex-col gap-8 xl:flex-row">
            {/* Left half: contest fields */}
            <div className="flex-1">
              <div className="w-full rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_18px_50px_rgba(0,0,0,0.24)] backdrop-blur-xl">
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold tracking-wide text-white">
                    Contest Details
                  </h2>
                  <div className="space-y-4">
                    <LabelInputContainer>
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        name="title"
                        placeholder="Contest 1A"
                        type="text"
                        value={form.title}
                        onChange={handleChange}
                        required
                        className="bg-zinc-800 text-white"
                      />
                    </LabelInputContainer>
                    <LabelInputContainer>
                      <Label htmlFor="description">Description</Label>
                      <MotionTextarea
                        value={form.description}
                        onChange={(e) =>
                          setForm({ ...form, description: e.target.value })
                        }
                        placeholder="Description"
                        rows={4}
                      />
                    </LabelInputContainer>
                    <div className="flex gap-4">
                      <LabelInputContainer className="w-fit">
                        <Label htmlFor="startTime">Start Time</Label>
                        <Input
                          id="startTime"
                          name="startTime"
                          type="datetime-local"
                          value={form.startTime}
                          onChange={handleChange}
                          required
                          className="bg-zinc-800 text-white"
                        />
                      </LabelInputContainer>
                      <LabelInputContainer className="w-fit">
                        <Label htmlFor="endTime">End Time</Label>
                        <Input
                          id="endTime"
                          name="endTime"
                          type="datetime-local"
                          value={form.endTime}
                          onChange={handleChange}
                          required
                          className="bg-zinc-800 text-white"
                        />
                      </LabelInputContainer>
                    </div>
                    <label className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-800/60 px-4 py-3 text-sm text-white">
                      <input
                        type="checkbox"
                        checked={isPrivateContest}
                        onChange={(e) => setIsPrivateContest(e.target.checked)}
                        className="h-4 w-4 rounded border-zinc-600 bg-zinc-900 text-blue-500 focus:ring-blue-500"
                      />
                      Private Contest
                    </label>
                  </div>
                </div>
              </div>
            </div>
            {/* Right half: problem search and selection */}
            <div className="flex-1 space-y-6">
              <div className="w-full rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_18px_50px_rgba(0,0,0,0.24)] backdrop-blur-xl">
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-white">
                    Add Challenges
                  </h2>
                  <LabelInputContainer>
                    <Label htmlFor="problem_title">
                      Search by problem title
                    </Label>
                    <Input
                      id="problem_title"
                      name="problem_title"
                      placeholder="Search by problem title"
                      value={search}
                      onChange={(e) => SetSearch(e.target.value)}
                      className="bg-zinc-800 text-white border border-white/6 placeholder:text-zinc-400"
                    />
                  </LabelInputContainer>
                  {/* List search results as capsule items (scroll if long to avoid overlap) */}
                  <div className="mt-4 flex flex-wrap gap-2 max-h-48 overflow-y-auto z-20 p-3">
                    {problems.map((problem) => (
                      <button
                        type="button"
                        key={problem.id}
                        onClick={() => {
                          if (
                            !chosenProblems?.find((p) => p.id === problem.id)
                          ) {
                            SetChosenProblems([...chosenProblems, problem]);
                          }
                        }}
                        className="px-4 py-2 rounded-full bg-zinc-900/80 border border-zinc-800 text-sm text-white hover:bg-zinc-800/90 hover:shadow-lg hover:scale-105 transform transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                      >
                        {problem.title}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              {/* Display selected problems */}
              <div className="w-full rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_18px_50px_rgba(0,0,0,0.24)] backdrop-blur-xl">
                <h3 className="text-lg font-semibold mb-3 text-white">
                  Selected Challenges
                </h3>
                {chosenProblems?.length === 0 ? (
                  <p className="text-zinc-400">No Challenges selected yet.</p>
                ) : (
                  <div className="max-h-72 overflow-y-auto overflow-x-hidden pr-2 scrollbar-thin scrollbar-thumb-zinc-700">
                    <div className="flex flex-col gap-4">
                      {chosenProblems?.map((problem) => (
                        <div
                          key={problem.id}
                          className="w-full p-4 mb-4 rounded-2xl shadow-md bg-gradient-to-tr from-zinc-900/80 to-zinc-800/60 ring-1 ring-blue-600/10 border border-zinc-800 flex items-center justify-between transition-shadow hover:shadow-lg"
                        >
                          <div className="flex-1">
                            <div className="text-base font-semibold text-white truncate">
                              {problem.title}
                            </div>
                            {problem.shortDescription ? (
                              <div className="text-sm text-slate-400 mt-1 whitespace-normal break-words">
                                {problem.shortDescription}
                              </div>
                            ) : null}
                          </div>
                          <div className="ml-4 flex-shrink-0">
                            <button
                              onClick={() =>
                                SetChosenProblems(
                                  chosenProblems.filter(
                                    (p) => p.id !== problem.id,
                                  ),
                                )
                              }
                              aria-label="Remove problem"
                              className="w-8 h-8 flex items-center justify-center rounded-md text-white hover:bg-rose-600/20 border border-transparent hover:border-rose-600/30"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* Submit button */}
          <div className="mx-auto mt-8 max-w-full ">
            <div className="flex justify-end">
              <Buttonv2
                text="Create Contest"
                ApiCall={async () => await createContest()}
                funct={() => {}}
                loading={false}
                variant="green"
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  ) : (
    <div></div>
  );
}
