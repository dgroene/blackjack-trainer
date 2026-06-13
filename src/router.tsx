import { createHashRouter } from 'react-router-dom'
import { GamePage } from './pages/GamePage'
import { ChartPagePlaceholder } from './pages/ChartPagePlaceholder'

export const router = createHashRouter([
  { path: '/', element: <GamePage /> },
  { path: '/chart', element: <ChartPagePlaceholder /> },
])
