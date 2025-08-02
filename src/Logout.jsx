import React from "react";

const Logout = () => {
  const handleLogout = async () => {
    try {
      await fetch('http://localhost:3000/logout', {
        method: 'GET',
        credentials: 'include' // ensures cookies are sent
      });

      localStorage.removeItem('user'); // optional cleanup
      window.location.href = '/'; // redirect to home or login
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return (
    <button onClick={handleLogout} className="px-4 py-2 bg-red-600 text-white rounded-lg">
      Logout
    </button>
  );
};

export default Logout;
