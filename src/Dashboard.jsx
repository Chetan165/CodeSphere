import React, { useState } from "react";
import { useEffect } from "react";
import App from "./App.jsx";
import Logout from "./Logout.jsx";
import Contest_button from "./Contest_button.jsx";
import UserAuth from "./UserAuth.jsx";
import { EncryptedText } from "./component/ui/encrypted-text.jsx";
export default function Dashboard() {
  const [User, setUser] = useState();
  useEffect(() => {
    UserAuth(setUser);
  }, []);
  useEffect(() => {
    console.log(User);
  }, [User]);
  return User && User.uid ? (
    <div className="w-full min-h-screen bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.14),transparent_28%),linear-gradient(180deg,#050505_0%,#09090b_45%,#020202_100%)] px-4 py-6 sm:px-6 lg:px-8 text-slate-200">
      <div className="mx-auto flex w-full max-w-screen-2xl flex-col gap-6">
        <div className="flex justify-end">
          <Logout />
        </div>

        <header className="rounded-3xl border border-white/10 bg-white/5 px-6 py-6 shadow-[0_18px_50px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:px-8 sm:py-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <EncryptedText
                text={`Welcome, ${User?.displayName || "Guest"}`}
                encryptedClassName="text-neutral-500 text-3xl font-semibold"
                revealedClassName="dark:text-white text-white text-3xl font-semibold"
                revealDelayMs={50}
              />

              <img
                src={`${User?.photos[0].value}`}
                className="h-16 w-16 rounded-2xl border border-white/10 object-cover shadow-lg"
              />
            </div>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-6 shadow-[0_18px_50px_rgba(0,0,0,0.24)] backdrop-blur-xl">
            <p className="text-xs uppercase tracking-[0.25em] text-cyan-300/80">
              Next Step
            </p>
            <h2 className="mt-2 text-xl font-semibold text-white">
              Head to contests
            </h2>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-6 shadow-[0_18px_50px_rgba(0,0,0,0.24)] backdrop-blur-xl">
            <p className="text-xs uppercase tracking-[0.25em] text-rose-300/80">
              Dashboard & Statistics Coming Soon
            </p>
          </div>
        </section>

        <footer className="pt-8 text-center text-sm text-slate-400">
          CodeSphere &copy; 2026. NO RIGHTS RESERVED.
        </footer>
      </div>
    </div>
  ) : (
    <div className="w-full h-full flex-1 min-h-0"></div>
  );
}
