import React, { useState } from 'react'
import { useEffect } from 'react';
import App from './App.jsx';
import Logout from './Logout.jsx';
import toast from 'react-hot-toast';
import Contest_button from './Contest_button.jsx';
import UserAuth from './UserAuth.jsx';
export default function Dashboard() {
  const [User,setUser]=useState();
  useEffect(() => {
    UserAuth(setUser);
  }, []);
  useEffect(() => {console.log(User)}, [User]);
  return User && User.uid ? (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-100 to-white px-4">
      <header className="text-center mb-10">
        <div className='flex flex-row items-center justify-center gap-4 mb-4'>
        <h1 className="text-4xl font-bold text-indigo-700">Welcome {`${User?.displayName || 'Guest'}`}</h1>
        <img src={`${User?.photos[0].value}`}/>
        </div>
        <p className="text-gray-600 mt-3 text-lg">
          Access contests, view leaderboards, and more.
        </p>
      </header>

      <div className="flex flex-col sm:flex-row gap-4">
        <a
          href="/contests"
          className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-lg font-semibold hover:bg-indigo-700 transition"
        >
          View Contests
        </a>
        <a
          href="/profile"
          className="px-6 py-3 border border-indigo-600 text-indigo-600 rounded-xl text-lg font-semibold hover:bg-indigo-50 transition"
        >
          Edit Profile
        </a>
        <Logout/>
      </div>

      <footer className="mt-16 text-sm text-gray-400">
        Coding Platform — T&P Cell
      </footer>
    </div>
  ) : <div></div>
}
