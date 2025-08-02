import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

export default function App() {
  const SearchUser=async ()=>{
    try{
      const response=await fetch('http://localhost:3000/api/user',{
        method:'GET',
        headers:{
          'Content-Type': 'application/json',
        },
        credentials:'include'
      })
      const res=await response.json();
      if(res){
        if(res.email && res.uid){
          window.location.href='/Dashboard';
        }
        else if(res.email && !res.uid)
          window.location.href='/Register';
      }
    }catch(error){
      console.log(error)
    }
  }
  useEffect(()=>SearchUser)
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-100 to-white px-4">
      <header className="text-center mb-10">
        <h1 className="text-5xl font-bold text-indigo-600">Coding Platform</h1>
        <p className="text-gray-600 mt-3 text-lg">
          DSA Contests. Live Leaderboards. College-level Coding.
        </p>
      </header>

      <div className="flex flex-col sm:flex-row gap-4">
        <a
          href="http://localhost:3000/auth/google"
          className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-lg font-semibold hover:bg-indigo-700 transition"
        >
          Login with College Email
        </a>
        <a
          href="#about"
          className="px-6 py-3 border border-indigo-600 text-indigo-600 rounded-xl text-lg font-semibold hover:bg-indigo-50 transition"
        >
          Learn More
        </a>
      </div>

      <footer className="mt-16 text-sm text-gray-400">
        By-Chetan Sharma
      </footer>
    </div>
  );
}

