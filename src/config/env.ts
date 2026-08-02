interface AppConfig {
  apiBaseUrl: string
  usersPath: string
  appName: string
}

/**
 * The default points at the deployed mock API, so a fresh clone runs with no
 * `.env` file. Override both to serve the endpoints from somewhere else — see
 * the API section of the README.
 *
 * The `www` host is deliberate: the apex domain answers with a 307 to it, and
 * a browser treats a redirected CORS preflight as a network error rather than
 * following it.
 */
export const config: AppConfig = {
  apiBaseUrl:
    import.meta.env.VITE_API_BASE_URL ||
    'https://www.checkmeout.me/api/lendsqr',
  usersPath: import.meta.env.VITE_USERS_PATH || '/users',
  appName: 'Lendsqr',
}
