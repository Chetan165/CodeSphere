import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Buttonv2 from "./component/ui/Buttonv2";

const backendURL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

export default function Register() {
  const navigate = useNavigate();
  const [uid, setUid] = useState("");
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    branch: "COMP",
    section: "A",
    roll: "",
    yearStart: "23",
  });

  const branches = [
    "COMP",
    "IT",
    "AI&ML",
    "AI&DS",
    "CS&E",
    "E&CS",
    "E&TC",
    "CIVIL",
    "MECH",
    "IoT",
    "M&ME",
  ];
  const sections = ["A", "B", "C", "NA"];
  const years = ["21", "22", "23", "24", "25", "26"];

  useEffect(() => {
    const { yearStart, branch, section, roll } = formData;
    const gradYear = (parseInt(yearStart, 10) + 4).toString().slice(-2);
    const sec = section !== "NA" ? section : "";
    const uidStr = `${yearStart}-${branch}${sec}${roll || ""}-${gradYear}`;
    setUid(uidStr);
  }, [formData]);

  const checkUserState = useCallback(async () => {
    try {
      const response = await fetch(`${backendURL}/api/user`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const body = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (body.loggedIn === false) {
          toast.error("Please login first");
          setTimeout(() => navigate("/"), 800);
          return;
        }

        if (body.registered === true && body.sessionValid === false) {
          toast.error("Session active elsewhere. Login again.");
          setTimeout(() => navigate("/"), 1000);
          return;
        }

        if (body.registered === false) {
          return;
        }

        toast.error(body.error || "Authentication failed");
        return;
      }

      if (body && body.uid) {
        toast.error("You are already registered");
        setTimeout(() => navigate("/Dashboard"), 800);
        return;
      }
    } catch (err) {
      console.error("Error checking auth state:", err);
      toast.error("Unable to verify login. Try again.");
    } finally {
      setCheckingAuth(false);
    }
  }, [navigate]);

  useEffect(() => {
    checkUserState();
  }, [checkUserState]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...formData, uid };

    try {
      const response = await fetch(`${backendURL}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const body = await response.json().catch(() => ({}));
      console.log(body);
      if (!body.ok) {
        throw new Error(body.msg || "Registration failed");
      }
      if (response.ok && body.ok) {
        navigate("/dashboard");
        return;
      }

      if (body.loggedIn === false) {
        toast.error("Please login first");
        setTimeout(() => navigate("/"), 800);
        return;
      }

      toast.error(body.error || "Registration failed");
    } catch (err) {
      console.error("Register error:", err);
      toast.error(err.message || "Registration failed");
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b0b0d] text-slate-200">
        <div className="rounded-2xl border border-white/10 bg-zinc-900/80 px-5 py-4 shadow-[0_14px_34px_rgba(0,0,0,0.38)] backdrop-blur-sm">
          Checking session...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b0b0d] px-4 py-10 text-slate-200">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-white/5 blur-3xl" />
      </div>
      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-lg space-y-5 rounded-3xl border border-white/10 bg-zinc-900/80 p-6 shadow-[0_14px_34px_rgba(0,0,0,0.38)] backdrop-blur-sm md:p-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-slate-400">
              Setup
            </div>
            <h2 className="mt-1 text-2xl font-semibold text-white">
              User Registration
            </h2>
          </div>
          <div className="rounded-full border border-white/10 bg-zinc-950/60 px-3 py-1 text-xs font-medium text-slate-300">
            Profile
          </div>
        </div>

        <input
          type="text"
          name="name"
          placeholder="Full Name"
          className="w-full rounded-2xl border border-zinc-800 bg-zinc-950/50 px-4 py-3 text-slate-100 placeholder:text-zinc-500 outline-none transition focus:border-white/10 focus:ring-2 focus:ring-white/10"
          value={formData.name}
          onChange={handleChange}
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-full">
            <label className="text-sm text-slate-400 block mb-2">Branch</label>
          </div>

          <select
            name="branch"
            className="w-full rounded-2xl border border-zinc-800 bg-zinc-950/50 px-4 py-3 text-slate-100 outline-none transition focus:border-white/10 focus:ring-2 focus:ring-white/10 mt-1"
            value={formData.branch}
            onChange={handleChange}
          >
            {branches.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>

          <select
            name="section"
            className="w-full rounded-2xl border border-zinc-800 bg-zinc-950/50 px-4 py-3 text-slate-100 outline-none transition focus:border-white/10 focus:ring-2 focus:ring-white/10 mt-1"
            value={formData.section}
            onChange={handleChange}
          >
            {sections.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="text-sm text-slate-400">
          <label className="block mb-2">Roll Number</label>
          <input
            type="text"
            name="roll"
            placeholder="Roll Number (e.g. 48)"
            className="w-full rounded-2xl border border-zinc-800 bg-zinc-950/50 px-4 py-3 text-slate-100 placeholder:text-zinc-500 outline-none transition focus:border-white/10 focus:ring-2 focus:ring-white/10 mt-1"
            value={formData.roll}
            onChange={handleChange}
            required
          />
        </div>

        <div className="text-sm text-slate-400">
          <label className="block mb-2">Year of Admission</label>
          <select
            name="yearStart"
            className="w-full rounded-2xl border border-zinc-800 bg-zinc-950/50 px-4 py-3 text-slate-100 outline-none transition focus:border-white/10 focus:ring-2 focus:ring-white/10 mt-1"
            value={formData.yearStart}
            onChange={handleChange}
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        <div className="py-3 text-sm text-slate-400">
          <div className="mb-1">UID</div>
          <div className="font-mono text-slate-100">{uid}</div>
        </div>

        <div className="pt-2">
          <div className="w-full">
            <Buttonv2 text="Register" type="submit" variant="green" />
          </div>
        </div>
      </form>
    </div>
  );
}
