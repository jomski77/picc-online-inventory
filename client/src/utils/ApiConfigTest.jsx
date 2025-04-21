import { useState, useEffect } from 'react';
import { apiGet } from './apiConfig';

export default function ApiConfigTest() {
  const [apiInfo, setApiInfo] = useState({
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'Not configured',
    mode: import.meta.env.VITE_API_MODE || 'development',
    // Other env vars for debug
    env: import.meta.env.MODE,
    dev: import.meta.env.DEV,
    prod: import.meta.env.PROD,
  });

  const [testResult, setTestResult] = useState(null);

  const runApiTest = async () => {
    try {
      // Try a simple test endpoint
      const response = await apiGet('auth/test');
      const data = await response.json();
      setTestResult({
        status: response.status,
        ok: response.ok,
        data: data
      });
    } catch (error) {
      setTestResult({
        error: true,
        message: error.message
      });
    }
  };

  // Only show in development mode
  if (!import.meta.env.DEV) {
    return null;
  }

  return (
    <div 
      style={{ 
        position: 'fixed', 
        bottom: '10px', 
        right: '10px', 
        padding: '10px', 
        background: '#333', 
        color: '#fff',
        borderRadius: '4px',
        fontSize: '12px',
        maxWidth: '300px',
        zIndex: 9999,
      }}
    >
      <h4 style={{ margin: '0 0 8px', fontSize: '14px' }}>API Configuration</h4>
      <div>
        <div>Base URL: {apiInfo.baseUrl}</div>
        <div>Mode: {apiInfo.mode}</div>
        <div>Env: {apiInfo.env}</div>
        <div>Dev: {apiInfo.dev ? 'Yes' : 'No'}</div>
        <div>Prod: {apiInfo.prod ? 'Yes' : 'No'}</div>
      </div>
      
      <div style={{ marginTop: '10px' }}>
        <button 
          onClick={runApiTest}
          style={{
            padding: '4px 8px',
            background: '#0070f3',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          Test API Connection
        </button>
        
        {testResult && (
          <div style={{ marginTop: '10px', fontSize: '11px' }}>
            {testResult.error ? (
              <div style={{ color: '#ff4949' }}>
                Error: {testResult.message}
              </div>
            ) : (
              <div>
                <div>Status: {testResult.status}</div>
                <div>Success: {testResult.ok ? 'Yes' : 'No'}</div>
                <div style={{ wordBreak: 'break-all' }}>
                  Data: {JSON.stringify(testResult.data)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 