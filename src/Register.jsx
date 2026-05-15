import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
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
  const years = ["21", "22", "23", "24", "25"];

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
      <div className="min-h-screen flex items-center justify-center">
        Checking session...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-white">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md p-8 rounded-xl w-full max-w-md space-y-4"
      >
        <h2 className="text-2xl font-bold text-center text-indigo-700 mb-4">
          User Registration
        </h2>
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring"
          value={formData.name}
          onChange={handleChange}
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <select
            name="branch"
            className="w-full px-4 py-2 border rounded-xl"
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
            className="w-full px-4 py-2 border rounded-xl"
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

        <input
          type="text"
          name="roll"
          placeholder="Roll Number (e.g. 48)"
          className="w-full px-4 py-2 border rounded-xl"
          value={formData.roll}
          onChange={handleChange}
          required
        />

        <select
          name="yearStart"
          className="w-full px-4 py-2 border rounded-xl"
          value={formData.yearStart}
          onChange={handleChange}
        >
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>

        <div className="text-sm text-gray-500 mt-2">
          UID: <span className="font-mono text-indigo-600">{uid}</span>
        </div>

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white font-semibold py-2 rounded-xl hover:bg-indigo-700 transition"
        >
          Register
        </button>
      </form>
    </div>
  );
}
