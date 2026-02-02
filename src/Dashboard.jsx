import React, { useState } from "react";
import { useEffect } from "react";
import App from "./App.jsx";
import Logout from "./Logout.jsx";
import toast from "react-hot-toast";
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
    <div className="w-full h-full flex-1 min-h-0 flex flex-col items-center justify-start bg-black mt-10 gap-3">
      <div className="flex flex-row justify-end items-center w-full px-4">
        <Logout />
      </div>
      <header className="text-center mb-10">
        <div className="flex flex-row items-center justify-center gap-4 mb-4">
          <EncryptedText
            text={`Welcome, ${User?.displayName || "Guest"}`}
            encryptedClassName="text-neutral-500 text-3xl font-semibold"
            revealedClassName="dark:text-white text-black text-3xl font-semibold"
            revealDelayMs={50}
          />

          <img src={`${User?.photos[0].value}`} />
        </div>
        <p className="text-gray-600 mt-3 text-lg">
          Access contests, view leaderboards, and more.
        </p>
      </header>

      <footer className="mt-16 text-sm text-gray-400">
        Coding Platform by Chetan Sharma
      </footer>
    </div>
  ) : (
    <div className="w-full h-full flex-1 min-h-0"></div>
  );
}
