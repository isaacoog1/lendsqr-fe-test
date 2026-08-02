import '@testing-library/jest-dom/vitest'
import { configure } from '@testing-library/react'

// Routes are lazily imported, so the first findBy* in a file waits on Vite
// transforming that chunk as well as on React rendering it. Testing Library's
// 1s default leaves no room for that on a cold worker, and the suite loses the
// race intermittently — the assertions are sound, the clock was too tight.
// Keep this below testTimeout so a real failure still reports as a Testing
// Library error, which prints the DOM, rather than a bare test timeout.
configure({ asyncUtilTimeout: 5000 })
