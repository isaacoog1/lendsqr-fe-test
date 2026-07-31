/**
 * The single account accepted by the mock auth service. Shown on the login
 * screen and documented in the README so a reviewer can sign in without
 * hunting for it. Not a secret — there is no backend behind it.
 */
export const DEMO_CREDENTIALS = {
  email: 'admin@lendsqr.com',
  password: 'Password123!',
} as const
