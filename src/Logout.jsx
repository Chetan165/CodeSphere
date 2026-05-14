import React from "react";
import Buttonv2 from "./component/ui/Buttonv2";
import { useNavigate } from "react-router-dom";
const backendURL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

const Logout = () => {
  const navigate = useNavigate();
  const handleLogout = async () => {
    try {
      await fetch(`${backendURL}/logout`, {
        method: "GET",
        credentials: "include", // ensures cookies are sent
      });

      localStorage.removeItem("CodeSphereUserData"); // optional cleanup
      navigate("/");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <Buttonv2
      text="Logout"
      ApiCall={async () => await handleLogout()}
      funct={() => {}}
      variant="red"
    />
  );
};

export default Logout;
