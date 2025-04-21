import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load environment variables based on mode (development or production)
  const env = loadEnv(mode, process.cwd());
  
  // Always use production URL
  const apiBaseUrl = 'https://picc-online-inventory.onrender.com';
  
  console.log(`Mode: ${mode}, Using production API URL: ${apiBaseUrl}`);
  
  return {
    plugins: [react()],
    server: {
      port: 5173, // Default development port
      // No proxy - all requests go directly to the production URL
    },
    // Add build options for production
    build: {
      outDir: 'dist',
      sourcemap: mode !== 'production',
    },
  };
}); 