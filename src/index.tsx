import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Chart, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import App from 'components/App';
import ErrorBoundary from 'components/ErrorBoundary';
import { store } from './store';
import './stylesheet.scss';

Chart.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend);

const root = createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <ErrorBoundary level="root">
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path="/scratch-paper/:gistId" element={<App/>}/>
          <Route path="/:categoryKey/:algorithmKey" element={<App/>}/>
          <Route path="/" element={<App/>}/>
        </Routes>
      </BrowserRouter>
    </Provider>
  </ErrorBoundary>
);
