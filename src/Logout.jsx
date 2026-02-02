import React from "react";
import RedButton from "./component/elements/RedButton";

const Logout = () => {
  const handleLogout = async () => {
    try {
      await fetch("http://localhost:3000/logout", {
        method: "GET",
        credentials: "include", // ensures cookies are sent
      });

      localStorage.removeItem("user"); // optional cleanup
      window.location.href = "/"; // redirect to home or login
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return <RedButton funct={handleLogout} text="Logout"></RedButton>;
};

export default Logout;
