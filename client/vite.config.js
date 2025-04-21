import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load environment variables based on mode (development or production)
  const env = loadEnv(mode, process.cwd());
  
  // Get the API base URL from the environment variables
  const apiBaseUrl = env.VITE_API_BASE_URL || 'http://localhost:3000';
  
  return {
    plugins: [react()],
    server: {
      port: 5173, // Default development port
      proxy: {
        '/api': {
          target: apiBaseUrl,
          secure: mode === 'production',
          changeOrigin: mode === 'production',
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