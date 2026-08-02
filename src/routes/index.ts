import { createBrowserRouter } from 'react-router-dom'
import { routes } from './routes'

/**
 * Built once at module load. The router owns the history stack, so it has to
 * outlive renders — creating it inside a component would throw navigation
 * state away on every one.
 */
export const router = createBrowserRouter(routes)
