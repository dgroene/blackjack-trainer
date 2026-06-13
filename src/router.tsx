import { createHashRouter } from 'react-router-dom'
import { GamePage } from './pages/GamePage'
import { ChartPage } from './pages/ChartPage'

export const router = createHashRouter([
  { path: '/', element: <GamePage /> },
  { path: '/chart', element: <ChartPage /> },
])
