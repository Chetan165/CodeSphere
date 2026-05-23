import React, { useState } from "react";
import toast from "react-hot-toast";
import Buttonv2 from "./component/ui/Buttonv2";
import { BorderMagicButton } from "./component/ui/BorderMagicButton";
import { useNavigate } from "react-router-dom";
import RegistrationModal from "./component/ui/RegistrationModal";
const backendURL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

const ContestCard = ({
  contest,
  admin,
  contests,
  SetContests,
  compact = false,
}) => {
  const { title, description, id, startTime, endTime } = contest;
  const nowTs = Date.now();
  const startTs = Date.parse(startTime);
  const endTs = Date.parse(endTime);
  const status =
    nowTs < startTs ? "upcoming" : nowTs > endTs ? "past" : "ongoing";

  const formatDateTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const navigate = useNavigate();
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  // track whether we are in the flow from the modal (prevents double-check)
  const [awaitingRegisterThenEnter, setAwaitingRegisterThenEnter] =
    useState(false);

  const proceedToContest = async () => {
    try {
      // fetch contest meta first (authoritative server time)
      const metaRes = await fetch(`${backendURL}/api/contests/${id}/meta`, {
        method: "GET",
        credentials: "include",
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
        },
      });
      if (metaRes.ok) {
        const meta = await metaRes.json();
        if (meta && meta.ok && meta.contest) {
          const nowTs = Date.parse(meta.serverNow || new Date().toISOString());
          const startTs = Date.parse(meta.contest.startTime);
          const endTs = Date.parse(meta.contest.endTime);
          if (nowTs < startTs) {
            toast.error("This contest has not started yet");
            return;
          }
          if (nowTs > endTs) {
            toast.error("This contest has ended");
            return;
          }
        }
      }

      // prefetch challenge summaries (optional, best-effort)
      await fetch(`${backendURL}/api/contests/${id}/challenges`, {
        method: "GET",
        credentials: "include",
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
        },
      });

      navigate(`/contests/${id}`);
      return;
    } catch (err) {
      console.warn("proceedToContest failed", err);
      navigate(`/contests/${id}`);
    }
  };

  const enterContest = async () => {
    try {
      // If we are coming back from registering, skip check
      if (awaitingRegisterThenEnter) {
        setAwaitingRegisterThenEnter(false);
        await proceedToContest();
        return;
      }

      // Check registration first
      try {
        const checkRes = await fetch(
          `${backendURL}/api/contests/${id}/registered`,
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          },
        );

        if (checkRes.status === 401) {
          toast.error("Please log in to enter the contest");
          return;
        }

        if (!checkRes.ok) {
          console.warn("Registration check failed", checkRes.status);
          // best-effort: continue to contest
          await proceedToContest();
          return;
        }

        const json = await checkRes.json();
        if (json && json.ok && json.registered === false) {
          // open modal to confirm registration
          setShowRegisterModal(true);
          return;
        }
      } catch (e) {
        console.warn("Registration check error", e);
      }

      // All good — proceed
      await proceedToContest();
    } catch (err) {
      console.warn("enterContest check failed", err);
      navigate(`/contests/${id}`);
    }
  };

  const handleRegister = async () => {
    setShowRegisterModal(false);
    const loading = toast.loading("Registering for contest...");
    try {
      let regRes = await fetch(`${backendURL}/api/contests/register/${id}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (regRes.status === 404) {
        regRes = await fetch(`${backendURL}/api/contests/register/${id}`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        });
      }

      toast.dismiss(loading);

      if (!regRes.ok) {
        let msg = "Failed to register for contest";
        try {
          const j = await regRes.json();
          if (j && j.message) msg = j.message;
        } catch (parseErr) {
          console.warn("Failed to parse contest registration error", parseErr);
        }
        toast.error(msg);
        return;
      }

      const regJson = await regRes.json();
      if (!(regJson && regJson.ok)) {
        toast.error("Failed to register for contest");
        return;
      }

      toast.success("Registered successfully");
      // proceed into contest after successful registration
      setAwaitingRegisterThenEnter(true);
      await enterContest();
    } catch (e) {
      toast.dismiss();
      toast.error("Failed to register for contest");
      console.warn("handleRegister error", e);
    }
  };
  const DeleteContest = async () => {
    try {
      const res = await fetch(`${backendURL}/api/deleteContest/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      return res.json();
    } catch (err) {
      console.log(err);
      return false;
    }
  };
  const handleDelete = async () => {
    const isDeleted = await DeleteContest();
    if (isDeleted.ok) {
      // Filter out the deleted contest from the list
      SetContests((prevContests) => prevContests.filter((e) => e.id !== id));
      console.log(contests);
    } else {
      if (isDeleted.msg) {
        toast.error(isDeleted.msg);
      }
    }
  };

  const confirmThenDelete = async () => {
    try {
      // simple confirmation to prevent accidental deletes
      // replace with a styled modal later if desired
      const ok = confirm("Are you sure you want to delete this contest?");
      if (!ok) return;
      await handleDelete();
      toast.success("Contest deleted");
    } catch (e) {
      console.warn("delete failed", e);
      toast.error("Failed to delete contest");
    }
  };

  if (compact) {
    return (
      <>
        <div className="w-full mb-3 rounded-xl border border-white/10 bg-white/5 shadow-[0_10px_24px_rgba(0,0,0,0.28)] transition-shadow hover:shadow-[0_14px_32px_rgba(0,0,0,0.36)] backdrop-blur-xl">
          <div className="rounded-xl p-3 relative overflow-hidden bg-black/15 flex items-center justify-between">
            <div className="flex-1 pr-4 min-w-0">
              <h2 className="text-lg font-semibold text-white truncate">
                {contest.title}
              </h2>
              <div className="text-xs text-slate-400">
                {new Date(contest.startTime).toLocaleString()}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {admin && (
                <div className="flex items-center gap-2">
                  <div className="flex-shrink-0">
                    <Buttonv2
                      text="Edit"
                      ApiCall={async () => {
                        navigate(`/contests/${id}/edit`);
                      }}
                      funct={() => {}}
                      variant="blue"
                    />
                  </div>
                </div>
              )}
              <div className="flex-shrink-0 flex items-center gap-2">
                <div>
                  <Buttonv2
                    text="View"
                    ApiCall={async () => {
                      await enterContest();
                    }}
                    funct={() => {}}
                  />
                </div>
                {admin && status === "upcoming" && (
                  <div>
                    <BorderMagicButton
                      size={40}
                      active={false}
                      onClick={confirmThenDelete}
                      aria-label="Delete contest"
                      title="Delete contest"
                      className="ml-2"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-4 h-4 text-white"
                      >
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                        <path d="M10 11v6M14 11v6" />
                      </svg>
                    </BorderMagicButton>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* include modal so registration flow works from compact card too */}
        <RegistrationModal
          open={showRegisterModal}
          onOpenChange={setShowRegisterModal}
          onConfirm={handleRegister}
        />
      </>
    );
  }

  return (
    <>
      <div className="w-full mb-6 rounded-3xl border border-white/10 bg-white/5 shadow-[0_14px_34px_rgba(0,0,0,0.32)] transition-shadow hover:shadow-[0_18px_42px_rgba(0,0,0,0.4)] backdrop-blur-xl">
        <div className="rounded-3xl p-6 relative overflow-hidden bg-black/15">
          <div className="flex items-start gap-6">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-semibold text-white leading-tight">
                {title}
              </h1>
              <p className="text-slate-300 mt-2 text-sm leading-relaxed max-h-16 overflow-hidden">
                {description}
              </p>

              <div className="flex items-center gap-6 text-sm text-slate-400 mt-5">
                <div>
                  <div className="text-xs text-slate-400">Start</div>
                  <div className="text-sm text-slate-200">
                    {formatDateTime(startTime)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-400">End</div>
                  <div className="text-sm text-slate-200">
                    {formatDateTime(endTime)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-zinc-800 flex justify-end">
            <div className="flex items-center gap-3">
              {admin && status === "upcoming" && (
                <BorderMagicButton
                  size={44}
                  active={true}
                  onClick={confirmThenDelete}
                  aria-label="Delete contest"
                  title="Delete contest"
                  className="mr-3"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-5 h-5 text-white"
                  >
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                    <path d="M10 11v6M14 11v6" />
                  </svg>
                </BorderMagicButton>
              )}

              {admin && (
                <div className="flex-shrink-0">
                  <Buttonv2
                    text="Edit"
                    ApiCall={async () => {
                      navigate(`/contests/${id}/edit`);
                    }}
                    funct={() => {}}
                    variant="blue"
                  />
                </div>
              )}

              <div className="flex-shrink-0">
                <Buttonv2
                  text="View Contest"
                  ApiCall={async () => {
                    await enterContest();
                    return;
                  }}
                  funct={() => {}}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Registration confirmation modal (shared component) */}
      <RegistrationModal
        open={showRegisterModal}
        onOpenChange={setShowRegisterModal}
        onConfirm={handleRegister}
      />
    </>
  );
};

export default ContestCard;
