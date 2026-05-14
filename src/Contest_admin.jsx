import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import UserAuth from "./UserAuth";
import { useNavigate } from "react-router-dom";
import { Label } from "./component/ui/label";
import { Input } from "./component/ui/input";
import Buttonv2 from "./component/ui/Buttonv2";
import { motion, useMotionValue, useMotionTemplate } from "motion/react";
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
  const radius = 100;
  const [visible, setVisible] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  function handleMouseMove({ currentTarget, clientX, clientY }) {
    let { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <motion.div
      style={{
        background: useMotionTemplate`
          radial-gradient(
            ${visible ? radius + "px" : "0px"} circle at ${mouseX}px ${mouseY}px,
            #3b82f6,
            transparent 80%
          )
        `,
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      className="group/input rounded-lg p-[2px] transition duration-300"
    >
      <textarea
        rows={rows}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-md bg-zinc-800 text-white px-3 py-2 text-sm placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      />
    </motion.div>
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
  }, [search]);
  useEffect(() => {
    console.log(problems);
  }, [problems]);

  return user && user.uid ? (
    <div>
      <div className="w-full flex flex-row justify-center p-10">
        <h1 className="admin-heading text-4xl font-semibold">
          Create New Contest
        </h1>
      </div>
      {/* Contest creation form */}
      <form onSubmit={handleSubmit} className="p-4 max-w-5xl mx-auto pb-20">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left half: contest fields */}
          <div className="flex-1">
            <div className="w-full mb-6 rounded-3xl p-px bg-[linear-gradient(135deg,#071226_0%,#0b0b0d_100%)] shadow-xl">
              <div className="bg-zinc-900/90 rounded-2xl p-6 relative overflow-hidden border border-zinc-800 backdrop-blur-sm">
                <h2 className="admin-subheading text-xl font-bold mb-3 tracking-wide drop-shadow">
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
                </div>
              </div>
            </div>
          </div>
          {/* Right half: problem search and selection */}
          <div className="flex-1 space-y-6">
            <div className="w-full mb-6 rounded-3xl p-px bg-[linear-gradient(135deg,#071226_0%,#0b0b0d_100%)] shadow-xl">
              <div className="bg-zinc-900/90 rounded-2xl p-6 relative overflow-hidden border border-zinc-800 backdrop-blur-sm">
                <h2 className="admin-subheading text-xl font-bold mb-3 tracking-wide drop-shadow">
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
                    className="bg-zinc-800 text-white border border-white/6 placeholder:text-zinc-400"
                  />
                </LabelInputContainer>
                {/* List search results as capsule items (scroll if long to avoid overlap) */}
                <div className="mt-4 flex flex-wrap gap-2 max-h-48 overflow-y-auto z-20">
                  {problems.map((problem) => (
                    <button
                      type="button"
                      key={problem.id}
                      onClick={() => {
                        if (!chosenProblems?.find((p) => p.id === problem.id)) {
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
            <div className="w-full mb-6 rounded-3xl p-px bg-[linear-gradient(135deg,#071226_0%,#0b0b0d_100%)] shadow-xl">
              <div className="bg-zinc-900/90 rounded-2xl p-6 relative overflow-hidden border border-zinc-800 backdrop-blur-sm">
                <h3 className="text-lg font-semibold mb-3 text-white">
                  Selected Challenges
                </h3>
                {chosenProblems?.length === 0 ? (
                  <p className="text-zinc-400">No Challenges selected yet.</p>
                ) : (
                  <div className="max-h-72 overflow-scroll pr-2">
                    <div className="flex flex-col">
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
                              <div className="text-sm text-slate-400 mt-1 truncate">
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
        </div>
        {/* Submit button */}
        <div className="max-w-md mx-auto">
          <div className="flex justify-center mt-2">
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
  ) : (
    <div></div>
  );
}
