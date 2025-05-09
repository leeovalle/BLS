import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '')
  
  // Create a new object with REACT_APP_ variables
  const envWithReactPrefix = {}
  Object.keys(env).forEach(key => {
    if (key.startsWith('REACT_APP_')) {
      envWithReactPrefix[`import.meta.env.${key}`] = JSON.stringify(env[key])
    }
  })

  return {
    plugins: [react()],
    define: envWithReactPrefix
  }
})
