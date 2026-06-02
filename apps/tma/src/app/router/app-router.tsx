import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import { FatalLaunchPage } from '@/routes/fatal-launch'
import { HomePage } from '@/routes/home'

const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/fatal',
    element: <FatalLaunchPage />,
  },
])

export const AppRouter = () => <RouterProvider router={router} />
