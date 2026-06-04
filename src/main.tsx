import {StrictMode, Component, ReactNode} from 'react';
import {createRoot} from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';

import { AuthProvider } from './context/AuthContext';

// main.tsx
console.log('Dritzz App: Script Loaded');

class ErrorBoundary extends Component<any, any> {
  public state: any;
  public props: any;

  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('Dritzz App: Boundary caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', color: 'white', background: '#900', fontFamily: 'sans-serif', minHeight: '100vh' }}>
          <h2>Application Render Error</h2>
          <pre>{this.state.error?.message}</pre>
          <pre style={{ fontSize: '12px', opacity: 0.8, overflow: 'auto' }}>{this.state.error?.stack}</pre>
          <button onClick={() => window.location.reload()} style={{ padding: '10px', background: 'white', color: 'black', border: 'none', cursor: 'pointer' }}>Reload</button>
        </div>
      );
    }
    return this.props.children;
  }
}

function initApp() {
  const rootElement = document.getElementById('root');
  console.log('Dritzz App: Finding root element...', { found: !!rootElement });

  if (rootElement) {
    try {
      console.log('Dritzz App: Creating React root...');
      const root = createRoot(rootElement);
      console.log('Dritzz App: Rendering components...');
      root.render(
        <StrictMode>
          <ErrorBoundary>
            <AuthProvider>
              <BrowserRouter>
                <App />
              </BrowserRouter>
            </AuthProvider>
          </ErrorBoundary>
        </StrictMode>,
      );
      console.log('Dritzz App: Render initiated successfully.');
    } catch (error) {
      console.error('Dritzz App: Runtime error during mounting:', error);
      const errorMsg = error instanceof Error ? error.message : String(error);
      rootElement.innerHTML = `<div style="padding: 20px; color: white; background: #900; font-family: sans-serif;">
        <h3>Application Error</h3>
        <p>${errorMsg}</p>
        <button onclick="window.location.reload()" style="background: white; color: black; border: none; padding: 10px 20px; cursor: pointer;">Reload</button>
      </div>`;
    }
  } else {
    console.warn('Dritzz App: Root element (#root) not found.');
  }
}

// Support both immediate and deferred execution
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

// Global error catcher
window.onerror = function(msg, url, line, col, error) {
  console.error('Dritzz App: Global Error:', { msg, url, line, col, error });
  return false;
};
