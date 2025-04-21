import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load environment variables based on mode (development or production)
  const env = loadEnv(mode, process.cwd());
  
  // Get the API base URL from the environment variables based on mode
  const apiBaseUrl = mode === 'production' 
    ? env.VITE_API_BASE_URL_PRODUCTION || 'https://picc-online-inventory.onrender.com:10000'
    : env.VITE_API_BASE_URL_DEVELOPMENT || 'http://localhost:3000';
  
  console.log(`Mode: ${mode}, API Base URL: ${apiBaseUrl}`);
  
  return {
    plugins: [react()],
    server: {
      port: 5173, // Default development port
      proxy: {
        '/api': {
          target: apiBaseUrl,
          secure: mode === 'production',
          changeOrigin: true,
        },
      },
    },
    // Add build options for production
    build: {
      outDir: 'dist',
      sourcemap: mode !== 'production',
    },
  };
}); 