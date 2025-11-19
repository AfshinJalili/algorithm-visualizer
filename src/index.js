import React from 'react';
import { createRoot } from 'react-dom/client';
import { combineReducers, createStore } from 'redux';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Chart, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import App from 'components/App';
import * as reducers from 'reducers';
import './stylesheet.scss';

Chart.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend);

const store = createStore(combineReducers(reducers));

const root = createRoot(document.getElementById('root'));
root.render(
  <Provider store={store}>
    <BrowserRouter>
      <Routes>
        <Route path="/scratch-paper/:gistId" element={<App/>}/>
        <Route path="/:categoryKey/:algorithmKey" element={<App/>}/>
        <Route path="/" element={<App/>}/>
      </Routes>
    </BrowserRouter>
  </Provider>
);
