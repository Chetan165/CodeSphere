import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Buttonv2 from "./component/ui/Buttonv2";

const backendURL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

const getErrorMessage = (body, fallback) => {
  if (typeof body?.error === "string" && body.error.trim()) return body.error;
  if (typeof body?.msg === "string" && body.msg.trim()) return body.msg;
  if (typeof body?.message === "string" && body.message.trim()) return body.message;
  return fallback;
};

export default function Signup() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    try {
      const response = await fetch(`${backendURL}/api/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          id: formData.id.trim(),
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
        }),
      });

      const body = await response.json().catch(() => ({}));

      if (!response.ok || !body?.ok) {
        toast.error(getErrorMessage(body, "Signup failed. Please try again."));
        return;
      }

      if (body?.user) {
        localStorage.setItem("CodeSphereUserData", JSON.stringify(body.user));
      }

      toast.success("Signup successful");
      if (body?.user) {
        navigate("/dashboard");
        return;
      }

      navigate("/login");
    } catch (err) {
      console.error("Signup error:", err);
      toast.error("Unable to signup right now. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b0b0d] px-4 py-10 text-slate-200">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-sky-500/10 blur-3xl" />
      </div>

      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-lg space-y-5 rounded-3xl border border-white/10 bg-zinc-900/80 p-6 shadow-[0_14px_34px_rgba(0,0,0,0.38)] backdrop-blur-sm md:p-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-slate-400">
              Create Account
            </div>
            <h2 className="mt-1 text-2xl font-semibold text-white">Sign Up</h2>
          </div>
          <div className="rounded-full border border-white/10 bg-zinc-950/60 px-3 py-1 text-xs font-medium text-slate-300">
            New User
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-slate-400">UID</label>
          <input
            type="text"
            name="id"
            placeholder="Choose your UID"
            className="w-full rounded-2xl border border-zinc-800 bg-zinc-950/50 px-4 py-3 text-slate-100 placeholder:text-zinc-500 outline-none transition focus:border-white/10 focus:ring-2 focus:ring-white/10"
            value={formData.id}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-slate-400">Name</label>
          <input
            type="text"
            name="name"
            placeholder="Your full name"
            className="w-full rounded-2xl border border-zinc-800 bg-zinc-950/50 px-4 py-3 text-slate-100 placeholder:text-zinc-500 outline-none transition focus:border-white/10 focus:ring-2 focus:ring-white/10"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-slate-400">Email</label>
          <input
            type="email"
            name="email"
            placeholder="you@example.com"
            className="w-full rounded-2xl border border-zinc-800 bg-zinc-950/50 px-4 py-3 text-slate-100 placeholder:text-zinc-500 outline-none transition focus:border-white/10 focus:ring-2 focus:ring-white/10"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-slate-400">Password</label>
          <input
            type="password"
            name="password"
            placeholder="Create a password"
            className="w-full rounded-2xl border border-zinc-800 bg-zinc-950/50 px-4 py-3 text-slate-100 placeholder:text-zinc-500 outline-none transition focus:border-white/10 focus:ring-2 focus:ring-white/10"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <div className="pt-2 flex items-center justify-between gap-3">
          <p className="text-sm text-slate-400">
            Already have an account? <Link to="/login" className="text-emerald-300 hover:text-emerald-200">Login</Link>
          </p>
          <Buttonv2
            text={submitting ? "Creating..." : "Sign Up"}
            type="submit"
            variant="green"
            loading={submitting}
            disabled={submitting}
          />
        </div>
      </form>
    </div>
  );
}
