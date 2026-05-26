import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import UserAuth from "./UserAuth";
import { useNavigate, useParams } from "react-router-dom";
import { Label } from "./component/ui/label";
import { Input } from "./component/ui/input";
import Buttonv2 from "./component/ui/Buttonv2";
import { Button as StatefulButton } from "./component/ui/stateful-button";
import SubmissionCodePortal from "./component/ui/SubmissionCodePortal";
import { cn } from "./utils/cn";
const backendURL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
const LEADERBOARD_PAGE_SIZE = 10;

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
  const [activeTab, setActiveTab] = useState("edit");

  const [problems, SetProblems] = useState([]);
  const [search, SetSearch] = useState("");
  const [chosenProblems, SetChosenProblems] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [leaderboardContest, setLeaderboardContest] = useState(null);
  const [leaderboardGeneratedAt, setLeaderboardGeneratedAt] = useState("");
  const [leaderboardPagination, setLeaderboardPagination] = useState({
    total: 0,
    offset: 0,
    limit: LEADERBOARD_PAGE_SIZE,
    returned: 0,
    hasMore: false,
  });
  const [leaderboardOffset, setLeaderboardOffset] = useState(0);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [leaderboardError, setLeaderboardError] = useState("");
  const [exportLoading, setExportLoading] = useState(false);
  const [exportError, setExportError] = useState("");

  const [selectedCode, setSelectedCode] = useState(null);

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
    UserAuth(setUser, true);
  }, []);

  // Fetch contest details (uses same API as contest page)
  const fetchContest = useCallback(async () => {
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
  }, [id]);

  useEffect(() => {
    if (id) fetchContest();
  }, [id, fetchContest]);

  const fetchProblem = useCallback(async () => {
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
  }, [search]);

  useEffect(() => {
    if (search.trim() !== "") {
      const t = setTimeout(() => fetchProblem(), 400);
      return () => clearTimeout(t);
    } else SetProblems([]);
  }, [search, fetchProblem]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const fetchLeaderboard = useCallback(
    async (offset, limit = LEADERBOARD_PAGE_SIZE) => {
      if (!id) return;
      setLeaderboardLoading(true);
      setLeaderboardError("");
      try {
        const leaderboardUrl = new URL(
          `${backendURL}/api/contests/${id}/leaderboard`,
        );
        leaderboardUrl.searchParams.set("offset", String(offset));
        leaderboardUrl.searchParams.set("limit", String(limit));

        const res = await fetch(leaderboardUrl.toString(), {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json();

        if (!res.ok || data?.ok === false) {
          throw new Error(
            data?.message || data?.msg || "Failed to load leaderboard",
          );
        }
        const rows = Array.isArray(data?.leaderboard)
          ? data.leaderboard
          : Array.isArray(data?.data)
            ? data.data
            : [];
        setLeaderboardContest(data?.contest || null);
        setLeaderboardGeneratedAt(data?.generatedAt || "");
        setLeaderboard(rows);
        setLeaderboardPagination({
          total: data?.pagination?.total ?? 0,
          offset: data?.pagination?.offset ?? offset,
          limit: data?.pagination?.limit ?? limit,
          returned: data?.pagination?.returned ?? rows.length,
          hasMore: data?.pagination?.hasMore ?? false,
        });
      } catch (error) {
        setLeaderboard([]);
        setLeaderboardContest(null);
        setLeaderboardGeneratedAt("");
        setLeaderboardPagination({
          total: 0,
          offset,
          limit,
          returned: 0,
          hasMore: false,
        });
        setLeaderboardError(error?.message || "Failed to load leaderboard");
      } finally {
        setLeaderboardLoading(false);
      }
    },
    [id],
  );

  const leaderboardTotalPages = Math.max(
    1,
    Math.ceil((leaderboardPagination.total || 0) / leaderboardPagination.limit),
  );
  const leaderboardCurrentPage = Math.min(
    leaderboardTotalPages,
    Math.floor(leaderboardPagination.offset / leaderboardPagination.limit) + 1,
  );

  const leaderboardPageItems = (() => {
    if (leaderboardTotalPages <= 7) {
      return Array.from(
        { length: leaderboardTotalPages },
        (_, index) => index + 1,
      );
    }

    const items = [1];
    const start = Math.max(2, leaderboardCurrentPage - 1);
    const end = Math.min(leaderboardTotalPages - 1, leaderboardCurrentPage + 1);

    if (start > 2) items.push("ellipsis-start");
    for (let page = start; page <= end; page += 1) {
      items.push(page);
    }
    if (end < leaderboardTotalPages - 1) items.push("ellipsis-end");
    items.push(leaderboardTotalPages);

    return items;
  })();

  const leaderboardProblemColumns = leaderboard.reduce((acc, row) => {
    (row?.problemScores || []).forEach((problem) => {
      const id =
        problem?.problemId ||
        problem?.problemTitle ||
        `problem-${acc.length + 1}`;
      if (!acc.some((item) => item.id === id)) {
        acc.push({
          id,
          title: problem?.problemTitle || problem?.problemId || "Problem",
          maxScore: problem?.maxScore,
        });
      }
    });
    return acc;
  }, []);

  const formatDateTime = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleString();
  };

  useEffect(() => {
    if (activeTab === "leaderboard") {
      fetchLeaderboard(leaderboardOffset, LEADERBOARD_PAGE_SIZE);
    }
  }, [activeTab, fetchLeaderboard, leaderboardOffset]);

  const getExportFileName = (response) => {
    const disposition = response.headers.get("content-disposition") || "";
    const utf8Match = disposition.match(/filename\*=UTF-8''([^;]+)/i);
    if (utf8Match?.[1]) return decodeURIComponent(utf8Match[1]);
    const plainMatch = disposition.match(/filename="?([^";]+)"?/i);
    if (plainMatch?.[1]) return plainMatch[1];
    return `contest-${id}-result.xlsx`;
  };

  const handleExportResult = async () => {
    if (!user?.admin || !id) return;
    setExportLoading(true);
    setExportError("");
    try {
      const res = await fetch(`${backendURL}/admin/contest/${id}/export`, {
        method: "GET",
        credentials: "include",
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || "Failed to export contest results");
      }
      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = getExportFileName(res);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
      toast.success("Result workbook downloaded");
    } catch (error) {
      setExportError(error?.message || "Failed to export contest results");
      toast.error(error?.message || "Failed to export contest results");
    } finally {
      setExportLoading(false);
    }
  };

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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.14),transparent_28%),linear-gradient(180deg,#050505_0%,#09090b_45%,#020202_100%)] px-4 py-6 sm:px-6 lg:px-8 text-slate-200">
      <SubmissionCodePortal
        open={!!selectedCode}
        onOpenChange={(open) => {
          if (!open) setSelectedCode(null);
        }}
        title={selectedCode?.title || "Submitted code"}
        language={selectedCode?.language || ""}
        submittedAt={
          selectedCode?.submittedAt
            ? formatDateTime(selectedCode.submittedAt)
            : ""
        }
        code={selectedCode?.code || ""}
      />
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <header className="rounded-3xl border border-white/10 bg-white/5 px-6 py-6 shadow-[0_18px_50px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:px-8">
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Edit Contest
          </h1>
        </header>

        <div className="flex h-14 w-full flex-nowrap items-stretch gap-2 overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-2 shadow-[0_18px_50px_rgba(0,0,0,0.24)] backdrop-blur-xl">
          {[
            { id: "edit", label: "Edit" },
            { id: "leaderboard", label: "Leaderboard" },
            { id: "result", label: "Result" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 rounded-2xl px-4 text-sm font-medium transition-colors ${activeTab === tab.id ? "bg-zinc-100 text-zinc-900" : "text-slate-300 hover:bg-white/5 hover:text-white"}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "edit" && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="space-y-4">
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
                        <textarea
                          id="description"
                          name="description"
                          rows={4}
                          value={form.description}
                          onChange={handleChange}
                          className="rounded-2xl bg-zinc-800 text-white border border-white/6 px-4 py-3 placeholder:text-zinc-400 outline-none focus:border-white/10"
                          required
                        />
                      </LabelInputContainer>

                      <div className="flex gap-4">
                        <LabelInputContainer className="flex-1">
                          <Label htmlFor="startTime">Start Time</Label>
                          <Input
                            id="startTime"
                            name="startTime"
                            type="datetime-local"
                            value={form.startTime}
                            onChange={handleChange}
                            className="bg-zinc-800 text-white"
                            required
                          />
                        </LabelInputContainer>
                        <LabelInputContainer className="flex-1">
                          <Label htmlFor="endTime">End Time</Label>
                          <Input
                            id="endTime"
                            name="endTime"
                            type="datetime-local"
                            value={form.endTime}
                            onChange={handleChange}
                            className="bg-zinc-800 text-white"
                            required
                          />
                        </LabelInputContainer>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="w-full rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_18px_50px_rgba(0,0,0,0.24)] backdrop-blur-xl">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">
                      Search Problems
                    </h3>
                    <input
                      value={search}
                      onChange={(e) => SetSearch(e.target.value)}
                      placeholder="Search problems by title"
                      className="w-full rounded-md p-3 bg-zinc-800 border border-zinc-800 text-white"
                    />
                    <div className="mt-4 flex flex-wrap gap-2 max-h-48 overflow-y-auto z-20 p-4">
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

                <div className="w-full rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_18px_50px_rgba(0,0,0,0.24)] backdrop-blur-xl">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">
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
                                      chosenProblems.filter(
                                        (c) => c.id !== p.id,
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
        )}

        {activeTab === "leaderboard" && (
          <div className="min-h-[420px] rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_18px_50px_rgba(0,0,0,0.24)] backdrop-blur-xl">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-white">
                  Leaderboard
                </h2>

                {leaderboardContest?.title ? (
                  <p className="text-xs text-slate-500">
                    {leaderboardContest.title}
                  </p>
                ) : null}
              </div>
              <Buttonv2
                text="Refresh"
                ApiCall={async () => await fetchLeaderboard(leaderboardOffset)}
                loading={leaderboardLoading}
                variant="blue"
              />
            </div>

            {leaderboardLoading ? (
              <p className="text-slate-400">Loading leaderboard...</p>
            ) : leaderboardError ? (
              <p className="text-rose-300">{leaderboardError}</p>
            ) : leaderboard.length === 0 ? (
              <p className="text-slate-400">No leaderboard data available.</p>
            ) : (
              <div className="space-y-4">
                <div className="max-h-[62vh] overflow-auto rounded-2xl border border-white/10 bg-zinc-900/80 shadow-[0_14px_34px_rgba(0,0,0,0.38)] backdrop-blur-sm">
                  <table className="min-w-[1100px] divide-y divide-white/10 text-sm">
                    <thead className="bg-zinc-900/92 text-slate-300 uppercase tracking-wide text-xs">
                      <tr>
                        <th className="px-4 py-3 text-left">Rank</th>
                        <th className="px-4 py-3 text-left">User ID</th>
                        <th className="px-4 py-3 text-left">Name</th>
                        <th className="px-4 py-3 text-left">Roll No</th>
                        <th className="px-4 py-3 text-left">Branch</th>
                        <th className="px-4 py-3 text-left">Total Score</th>
                        <th className="px-4 py-3 text-left">Last Submission</th>
                        {leaderboardProblemColumns.map((problemColumn) => (
                          <th
                            key={problemColumn.id}
                            className="px-4 py-3 text-left min-w-[180px]"
                          >
                            {problemColumn.title}
                            {typeof problemColumn.maxScore === "number" ? (
                              <span className="ml-1 text-slate-500 normal-case tracking-normal">
                                / {problemColumn.maxScore}
                              </span>
                            ) : null}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10 bg-white/[0.02] text-slate-100">
                      {leaderboard.map((row, index) => (
                        <tr key={row?.userId || row?.uid || index}>
                          <td className="px-4 py-3">
                            {row?.rank ??
                              leaderboardPagination.offset + index + 1}
                          </td>
                          <td className="px-4 py-3">
                            {row?.userId ?? row?.uid ?? "-"}
                          </td>
                          <td className="px-4 py-3">{row?.name ?? "-"}</td>
                          <td className="px-4 py-3">{row?.rollNo ?? "-"}</td>
                          <td className="px-4 py-3">{row?.branch ?? "-"}</td>
                          <td className="px-4 py-3">{row?.totalScore ?? 0}</td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {formatDateTime(row?.lastSubmittedAt)}
                          </td>
                          {leaderboardProblemColumns.map((problemColumn) => {
                            const score = (row?.problemScores || []).find(
                              (problem) =>
                                (problem?.problemId ||
                                  problem?.problemTitle) === problemColumn.id,
                            );
                            const cellKey = `${row?.userId || row?.uid || index}-${problemColumn.id}`;
                            return (
                              <td
                                key={cellKey}
                                className="px-4 py-3 align-top max-w-[280px]"
                              >
                                {score ? (
                                  <div className="flex flex-col leading-tight">
                                    <div className="flex items-center gap-3">
                                      <span className="font-medium">
                                        {score?.marks ?? 0}
                                        {typeof score?.maxScore === "number"
                                          ? ` / ${score.maxScore}`
                                          : ""}
                                      </span>
                                      <span className="text-xs text-slate-400">
                                        {score?.verdict || "-"}
                                      </span>
                                    </div>
                                    <div className="text-xs text-slate-400 mt-1">
                                      {score?.language || "-"}
                                    </div>
                                    {score?.code ? (
                                      <div className="mt-2">
                                        <button
                                          type="button"
                                          onClick={() =>
                                            setSelectedCode({
                                              title:
                                                problemColumn?.title ||
                                                score?.problemTitle ||
                                                "Submitted code",
                                              language: score?.language || "",
                                              submittedAt:
                                                score?.submittedAt || "",
                                              code: score.code,
                                            })
                                          }
                                          className="text-xs text-sky-300 hover:underline"
                                        >
                                          Show code
                                        </button>
                                      </div>
                                    ) : null}
                                  </div>
                                ) : (
                                  "-"
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex flex-col items-center gap-4 pt-2">
                  <div className="text-[11px] uppercase tracking-[0.35em] text-slate-500">
                    Page {leaderboardCurrentPage} of {leaderboardTotalPages}
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <button
                      type="button"
                      disabled={
                        leaderboardLoading || leaderboardPagination.offset === 0
                      }
                      onClick={() => {
                        const nextOffset = Math.max(
                          0,
                          leaderboardPagination.offset -
                            leaderboardPagination.limit,
                        );
                        setLeaderboardOffset(nextOffset);
                      }}
                      className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <span aria-hidden="true">‹</span>
                    </button>

                    {leaderboardPageItems.map((item) =>
                      typeof item === "number" ? (
                        <button
                          key={item}
                          type="button"
                          disabled={leaderboardLoading}
                          onClick={() => {
                            const nextOffset =
                              (item - 1) * leaderboardPagination.limit;
                            setLeaderboardOffset(nextOffset);
                          }}
                          className={`flex h-11 min-w-11 items-center justify-center rounded-2xl border px-4 text-sm font-semibold transition ${
                            item === leaderboardCurrentPage
                              ? "border-sky-400/40 bg-sky-500/15 text-sky-100 shadow-[0_0_0_1px_rgba(56,189,248,0.12)]"
                              : "border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
                          } disabled:cursor-not-allowed disabled:opacity-40`}
                        >
                          {item}
                        </button>
                      ) : (
                        <span
                          key={item}
                          className="flex h-11 min-w-11 items-center justify-center rounded-2xl border border-white/5 bg-white/[0.03] px-3 text-sm text-slate-500"
                        >
                          ...
                        </span>
                      ),
                    )}

                    <button
                      type="button"
                      disabled={
                        leaderboardLoading || !leaderboardPagination.hasMore
                      }
                      onClick={() => {
                        const nextOffset =
                          leaderboardPagination.offset +
                          leaderboardPagination.limit;
                        setLeaderboardOffset(nextOffset);
                      }}
                      className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <span aria-hidden="true">›</span>
                    </button>
                  </div>
                  <div className="text-xs text-slate-500">
                    {leaderboardGeneratedAt
                      ? ` • Updated at ${new Date(leaderboardGeneratedAt).toLocaleString()}`
                      : ""}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "result" && (
          <div className="min-h-[420px] rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_18px_50px_rgba(0,0,0,0.24)] backdrop-blur-xl space-y-4">
            <div>
              <h2 className="text-xl font-semibold text-white">
                Result Export
              </h2>
              <p className="text-sm text-slate-400">
                Click to download the contest result workbook. It includes both
                the Leaderboard and Performance sheets.
              </p>
            </div>

            {user?.admin ? (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <StatefulButton
                  type="button"
                  onClick={handleExportResult}
                  disabled={exportLoading}
                >
                  Download Result XLSX
                </StatefulButton>
                {exportError ? (
                  <p className="text-sm text-rose-300">{exportError}</p>
                ) : null}
              </div>
            ) : (
              <p className="text-sm text-slate-400">
                This export is available to admin users only.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  ) : (
    <div />
  );
}
