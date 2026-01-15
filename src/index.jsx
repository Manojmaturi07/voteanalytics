import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import reportWebVitals from './reportWebVitals.js';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found!');
}

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);

reportWebVitals();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

