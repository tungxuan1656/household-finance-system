import { createHashRouter, RouterProvider } from 'react-router-dom'

import { FatalLaunchPage } from '@/routes/fatal-launch'
import { HomePage } from '@/routes/home'
import { NotFoundPage } from '@/routes/not-found'

const router = createHashRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/fatal',
    element: <FatalLaunchPage />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
])

export const AppRouter = () => <RouterProvider router={router} />
