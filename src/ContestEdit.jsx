import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import UserAuth from "./UserAuth";
import { useNavigate, useParams } from "react-router-dom";
import { Label } from "./component/ui/label";
import { Input } from "./component/ui/input";
import Buttonv2 from "./component/ui/Buttonv2";
import { cn } from "./utils/cn";
const backendURL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

const LabelInputContainer = ({ children, className }) => {
  return (
    <div className={cn("flex w-full flex-col space-y-2", className)}>
      {children}
    </div>
  );
};

export default function ContestEdit() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [user, setUser] = useState();

  const [problems, SetProblems] = useState([]);
  const [search, SetSearch] = useState("");
  const [chosenProblems, SetChosenProblems] = useState([]);

  const [form, setForm] = useState({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
  });

  const toLocalDatetimeInput = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const pad = (n) => String(n).padStart(2, "0");
    const YYYY = d.getFullYear();
    const MM = pad(d.getMonth() + 1);
    const DD = pad(d.getDate());
    const hh = pad(d.getHours());
    const mm = pad(d.getMinutes());
    return `${YYYY}-${MM}-${DD}T${hh}:${mm}`;
  };

  useEffect(() => {
    UserAuth(setUser);
  }, []);

  // Fetch contest details (uses same API as contest page)
  const fetchContest = async () => {
    try {
      const res = await fetch(`${backendURL}/api/ContestChallenges`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problemId: id }),
        credentials: "include",
      });
      const data = await res.json();
      if (data && data.ok && data.collections) {
        const c = data.collections;
        setForm({
          title: c.title || "",
          description: c.description || "",
          startTime: c.startTime ? toLocalDatetimeInput(c.startTime) : "",
          endTime: c.endTime ? toLocalDatetimeInput(c.endTime) : "",
        });
        SetChosenProblems(c.problems || []);
      } else {
        toast.error("Failed to load contest");
      }
    } catch (e) {
      console.warn(e);
      toast.error("Failed to load contest");
    }
  };

  useEffect(() => {
    if (id) fetchContest();
  }, [id]);

  const fetchProblem = async () => {
    try {
      const res = await fetch(`${backendURL}/api/problems`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ search }),
        credentials: "include",
      });
      const response = await res.json();
      if (response && response.ok) SetProblems(response.problems || []);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (search.trim() !== "") {
      const t = setTimeout(() => fetchProblem(), 400);
      return () => clearTimeout(t);
    } else SetProblems([]);
  }, [search]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    try {
      const res = await fetch(`${backendURL}/admin/contest/${id}`, {
        method: "PUT",
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
        toast.success("Contest updated");
        navigate("/contests");
      } else {
        toast.error(data.msg || "Failed to update contest");
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to update contest");
    }
  };

  return user && user.uid ? (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-semibold text-white mb-6">Edit Contest</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <LabelInputContainer>
              <Label htmlFor="title">Title</Label>
              <input
                id="title"
                name="title"
                value={form.title}
                onChange={handleChange}
                className="rounded-lg bg-black text-white border border-white/20 p-3"
                required
              />
            </LabelInputContainer>

            <LabelInputContainer>
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={form.description}
                onChange={handleChange}
                className="rounded-lg bg-black text-white border border-white/20 p-3"
                required
              />
            </LabelInputContainer>

            <div className="flex gap-4">
              <LabelInputContainer className="flex-1">
                <Label htmlFor="startTime">Start Time</Label>
                <input
                  id="startTime"
                  name="startTime"
                  type="datetime-local"
                  value={form.startTime}
                  onChange={handleChange}
                  className="rounded-lg bg-zinc-800 text-white border border-white/20 p-3"
                  required
                />
              </LabelInputContainer>
              <LabelInputContainer className="flex-1">
                <Label htmlFor="endTime">End Time</Label>
                <input
                  id="endTime"
                  name="endTime"
                  type="datetime-local"
                  value={form.endTime}
                  onChange={handleChange}
                  className="rounded-lg bg-zinc-800 text-white border border-white/20 p-3"
                  required
                />
              </LabelInputContainer>
            </div>
          </div>

          <div className="space-y-4">
            <div className="w-full mb-6 rounded-3xl p-px bg-[linear-gradient(135deg,#071226_0%,#0b0b0d_100%)] shadow-xl">
              <div className="bg-zinc-900/90 rounded-2xl p-6 relative overflow-hidden border border-zinc-800 backdrop-blur-sm">
                <h3 className="text-lg font-semibold text-white mb-2">
                  Search Problems
                </h3>
                <input
                  value={search}
                  onChange={(e) => SetSearch(e.target.value)}
                  placeholder="Search problems by title"
                  className="w-full rounded-md p-3 bg-zinc-800 border border-zinc-800 text-white"
                />
                <div className="mt-4 flex flex-wrap gap-2 max-h-48 overflow-y-auto z-20">
                  {problems.map((p) => (
                    <button
                      type="button"
                      key={p.id}
                      onClick={() => {
                        if (!chosenProblems.find((c) => c.id === p.id)) {
                          SetChosenProblems([...chosenProblems, p]);
                        }
                      }}
                      className="px-4 py-2 rounded-full bg-zinc-900/80 border border-zinc-800 text-sm text-white hover:bg-zinc-800/90 hover:shadow-lg hover:scale-105 transform transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    >
                      {p.title}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="w-full mb-6 rounded-3xl p-px bg-[linear-gradient(135deg,#071226_0%,#0b0b0d_100%)] shadow-xl">
              <div className="bg-zinc-900/90 rounded-2xl p-6 relative overflow-hidden border border-zinc-800 backdrop-blur-sm">
                <h3 className="text-lg font-semibold text-white mb-2">
                  Selected Problems
                </h3>
                {chosenProblems.length === 0 ? (
                  <p className="text-zinc-400">No problems selected</p>
                ) : (
                  <div className="max-h-72 overflow-y-auto pr-2">
                    <div className="flex flex-col">
                      {chosenProblems.map((p) => (
                        <div
                          key={p.id}
                          className="w-full p-4 mb-4 rounded-2xl shadow-md bg-gradient-to-tr from-zinc-900/80 to-zinc-800/60 ring-1 ring-blue-600/10 border border-zinc-800 flex items-center justify-between transition-shadow hover:shadow-lg"
                        >
                          <div className="flex-1">
                            <div className="text-base font-semibold text-white truncate">
                              {p.title}
                            </div>
                            {p.shortDescription ? (
                              <div className="text-sm text-slate-400 mt-1 truncate">
                                {p.shortDescription}
                              </div>
                            ) : null}
                          </div>
                          <div className="ml-4 flex-shrink-0">
                            <button
                              type="button"
                              onClick={() =>
                                SetChosenProblems(
                                  chosenProblems.filter((c) => c.id !== p.id),
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

        <div className="flex justify-end">
          <div className="w-[220px]">
            <Buttonv2
              text="Save Changes"
              ApiCall={async () => await handleSubmit()}
              funct={() => {}}
              loading={false}
              variant="green"
            />
          </div>
        </div>
      </form>
    </div>
  ) : (
    <div />
  );
}
