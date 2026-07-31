interface AppConfig {
  apiBaseUrl: string
  usersPath: string
  appName: string
}

/**
 * The defaults point at the dataset committed under `public/api`, so the app
 * runs with no `.env` file and no network. `.env.production` overrides them to
 * the hosted mock endpoint — see the Mock API section of the README.
 */
export const config: AppConfig = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '/api',
  usersPath: import.meta.env.VITE_USERS_PATH || '/users.json',
  appName: 'Lendsqr',
}
