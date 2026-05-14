import React from "react";
import { useNavigate } from "react-router-dom";

const Contest_button = ({ admin }) => {
  const navigate = useNavigate();
  const sendToAdmin = () => {
    navigate("/admin/contest");
  };
  console.log(admin);
  return admin === true ? (
    <button
      className="bg-green-600 text-white rounded-lg p-2 hover:bg-green-700"
      onClick={() => sendToAdmin()}
    >
      Create Contest
    </button>
  ) : (
    <button className="bg-gray-400 text-white rounded-lg p-2" disabled>
      Not Authorized(contest)
    </button>
  );
};
export default Contest_button;
