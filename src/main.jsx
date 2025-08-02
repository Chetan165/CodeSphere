import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter,RouterProvider } from 'react-router-dom'
import { createRoot } from 'react-dom/client'
import ContestCreationForm from './Contest_admin.jsx'
import Register from './Register.jsx'
import './index.css'
import App from './App.jsx'
import Dashboard from './Dashboard.jsx'
import ProblemCreationForm from './Problem_admin.jsx'
import Contest from './Contest.jsx'
import {Toaster} from 'react-hot-toast'
import ContestChallenges from './ContestChallenges.jsx'
import SolvePage from './SolvePage.jsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
  },
  {
    path: '/Dashboard',
    element: <Dashboard />,
  },
  {
    path: '/Register',
    element: <Register />,
  },
  {
    path: '/admin/contest',
    element: <ContestCreationForm />,
  },
  {
    path: '/admin/problem',
    element: <ProblemCreationForm />,
  },
  {
    path: '/contests',
    element: <Contest />,
  },
  {
    path:'/contests/:id',
    element:<ContestChallenges/>
  },
  {
    path:'/contests/:ContestId/challenges/:id',
    element:<SolvePage/>
  }
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
    <Toaster/>
  </StrictMode>,
)
