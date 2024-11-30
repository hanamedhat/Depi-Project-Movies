import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import'./nav.css';
import './profile.css';
import './movies.css';
import './details.css';
import App from './App';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

