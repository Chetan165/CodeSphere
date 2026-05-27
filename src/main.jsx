import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import ContestCreationForm from "./Contest_admin.jsx";
import Register from "./Register.jsx";
import Sample from "./Pages/Sample.jsx";
import "./index.css";
import App from "./App.jsx";
import Dashboard from "./Dashboard.jsx";
import ProblemCreationForm from "./Problem_admin.jsx";
import Contest from "./Contest.jsx";
import ContestEdit from "./ContestEdit.jsx";
import { Toaster } from "react-hot-toast";
import AutoCraft from "./Pages/AutoCraft.jsx";
import ContestChallenges from "./ContestChallenges.jsx";
import SolvePage from "./SolvePage.jsx";
import { SidebarDemo } from "./Pages/Sidebar.jsx";
import Profile from "./Pages/Profile.jsx";
import NoPage from "./Pages/NoPage.jsx";

const router = createBrowserRouter([
  {
    path: "*",
    element: <NoPage />,
  },
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/",
    element: (
      <SidebarDemo>
        <Outlet />
      </SidebarDemo>
    ),
    children: [
      {
        path: "/*",
        element: <NoPage />,
      },
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "Profile",
        element: <Profile />,
      },
      {
        path: "sample",
        element: <Sample />,
      },
      {
        path: "admin/contest",
        element: <ContestCreationForm />,
      },
      {
        path: "admin/problem",
        element: <ProblemCreationForm />,
      },
      {
        path: "/admin/autocraft",
        element: <AutoCraft />,
      },
      {
        path: "contests",
        element: <Contest />,
      },
      {
        path: "contests/:id",
        element: <ContestChallenges />,
      },
      {
        path: "contests/:id/edit",
        element: <ContestEdit />,
      },
      {
        path: "contests/:ContestId/challenges/:id",
        element: <SolvePage />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
    <Toaster
      position="top-center"
      toastOptions={{
        style: {
          background: "#111827",
          color: "#f9fafb",
          border: "1px solid #374151",
        },
      }}
    />
  </StrictMode>,
);
