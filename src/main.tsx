// src/index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { PlaceProvider } from './context/PlaceContext';

const rootElement = document.getElementById('root');

if (!rootElement) {
    throw new Error('Root element not found');
}

ReactDOM.createRoot(rootElement as HTMLElement).render(
    <React.StrictMode>
        <PlaceProvider>
            <App />
        </PlaceProvider>
    </React.StrictMode>
);