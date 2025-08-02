import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
export default function Register() {
  const [uid, setUid] = useState('');
  const [user, setUser] = useState();
  const isloggdin= async () => {
    try{
       const search= await fetch('http://localhost:3000/api/user', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important to send cookies
      });
      const res=await search.json()
      if (res && res.uid) {
        setUser(res);
        toast.error('You are already Registerd');
        setTimeout(()=>window.location.href = '/Dashboard',1000);
      }
    }catch(err) {
      console.error('Error checking login status:', err);

    }
  }
  const [formData, setFormData] = useState({
    name: '',
    branch: 'COMP',
    section: 'A',
    roll: '',
    yearStart: '23',
  });


  const branches = ['COMP', 'IT', 'AI&ML', 'AI&DS', 'CS&E', 'E&CS', 'E&TC', 'CIVIL', 'MECH','IoT','M&ME'];
  const sections = ['A', 'B', 'C', 'NA'];
  const years = ['21', '22', '23', '24', '25']; // Extend as needed

  useEffect(() => {
    const { yearStart, branch, section, roll } = formData;
    const gradYear = (parseInt(yearStart) + 4).toString().slice(-2);
    const sec = section !== 'NA' ? section : '';
    const uidStr = `${yearStart}-${branch}${sec}${roll ? roll : ''}-${gradYear}`;
    setUid(uidStr);
  }, [formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  useEffect(() => {isloggdin()}, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...formData, uid };
    try {
      const search = await fetch('http://localhost:3000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include', // Important to send cookies
      });
      const res=await search.json()
      if (res.ok) {
        window.location.href = '/Dashboard';
      } else {
        toast.error('User with this info already exists(if already registered, please use the same email)');
        console.error('Registration failed');
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };
  return !(user && user.uid) ? (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-white">
      <form onSubmit={handleSubmit} className="bg-white shadow-md p-8 rounded-xl w-full max-w-md space-y-4">
        <h2 className="text-2xl font-bold text-center text-indigo-700 mb-4">User Registration</h2>

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
          <select name="branch" className="w-full px-4 py-2 border rounded-xl" value={formData.branch} onChange={handleChange}>
            {branches.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>

          <select name="section" className="w-full px-4 py-2 border rounded-xl" value={formData.section} onChange={handleChange}>
            {sections.map((s) => (
              <option key={s} value={s}>{s}</option>
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

        <select name="yearStart" className="w-full px-4 py-2 border rounded-xl" value={formData.yearStart} onChange={handleChange}>
          {years.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>

        <div className="text-sm text-gray-500 mt-2">UID: <span className="font-mono text-indigo-600">{uid}</span></div>

        <button type="submit" className="w-full bg-indigo-600 text-white font-semibold py-2 rounded-xl hover:bg-indigo-700 transition">
          Register
        </button>
      </form>
    </div>
  ) : <div></div>;
}
