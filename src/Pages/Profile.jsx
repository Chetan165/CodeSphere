import React, { useEffect, useState } from "react";
import UserAuth from "../UserAuth.jsx";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        await UserAuth((nextUser) => {
          if (!mounted) return;
          setUser(nextUser);
        });
      } catch {
        // UserAuth already handles redirects and toasts.
      } finally {
        if (mounted) setLoadingUser(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const avatarSrc = user?.photos?.[0]?.value || null;
  const authorizationStatus = user?.admin ? "Admin" : "Regular";
  const statusTone = user?.admin
    ? "border-cyan-400/30 bg-cyan-400/10 text-cyan-200"
    : "border-emerald-400/30 bg-emerald-400/10 text-emerald-200";

  const detailRows = [
    { label: "Display Name", value: user?.displayName || "Unknown user" },
    { label: "UID", value: user?.uid || "-" },
    { label: "Authorization Status", value: authorizationStatus },
    {
      label: "Email",
      value: user?.email || "No email available",
    },
  ];

  if (loadingUser) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.14),transparent_28%),linear-gradient(180deg,#050505_0%,#09090b_45%,#020202_100%)] px-4 py-10 text-slate-200">
        <div className="mx-auto flex w-full max-w-2xl items-center justify-center rounded-3xl border border-white/10 bg-zinc-900/80 px-5 py-4 shadow-[0_14px_34px_rgba(0,0,0,0.38)] backdrop-blur-sm">
          Checking session...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.14),transparent_28%),linear-gradient(180deg,#050505_0%,#09090b_45%,#020202_100%)] px-4 py-8 text-slate-200 sm:px-6 lg:px-8">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-24 top-12 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-white/5 blur-3xl" />
      </div>

      <div className="relative mx-auto flex w-full max-w-2xl flex-col gap-6">
        <div>
          <div className="text-xs uppercase tracking-[0.3em] text-slate-400">
            Profile
          </div>
          <h1 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">
            Profile details
          </h1>
        </div>

        <section className="overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/80 shadow-[0_14px_34px_rgba(0,0,0,0.38)] backdrop-blur-sm">
          <div className="border-b border-white/10 px-6 py-6 sm:px-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                {avatarSrc ? (
                  <img
                    src={avatarSrc}
                    alt="User avatar"
                    className="h-16 w-16 rounded-2xl border border-white/10 object-cover shadow-lg"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-zinc-950/70 text-lg font-semibold text-slate-300">
                    {user?.displayName?.slice(0, 1)?.toUpperCase() || "U"}
                  </div>
                )}

                <div>
                  <div className="text-xs uppercase tracking-[0.25em] text-slate-400">
                    Signed in as
                  </div>
                  <h2 className="mt-1 text-2xl font-semibold text-white">
                    {user?.displayName || "Unknown user"}
                  </h2>
                </div>
              </div>

              <div
                className={`inline-flex w-fit rounded-full border px-3 py-1 text-xs font-medium ${statusTone}`}
              >
                Authorization: {authorizationStatus}
              </div>
            </div>
          </div>

          <div className="grid gap-4 p-6 sm:p-8">
            <div className="rounded-2xl border border-white/10 bg-zinc-950/50 px-4 py-4">
              <div className="grid gap-4 sm:grid-cols-2">
                {detailRows.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-4"
                  >
                    <div className="text-xs uppercase tracking-[0.25em] text-slate-500">
                      {item.label}
                    </div>
                    <div className="mt-2 text-sm font-medium text-slate-100">
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-xs uppercase tracking-[0.25em] text-cyan-300/80">
                  Session status
                </div>
                <p className="mt-2 text-sm text-slate-300">
                  The current session is authenticated and tied to this user
                  profile.
                </p>
              </div>
            </div> */}
          </div>
        </section>
      </div>
    </div>
  );
}
