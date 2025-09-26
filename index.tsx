

import React from 'react';
import ReactDOM from 'react-dom/client';
// FIX: The App component is not default-exported from App.tsx. Changed to a named import.
import { default as App } from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);