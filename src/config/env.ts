interface AppConfig {
  apiBaseUrl: string
  appName: string
}

export const config: AppConfig = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'https://run.mocky.io/v3',
  appName: 'Lendsqr',
}
