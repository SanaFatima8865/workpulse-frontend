import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';

import { store } from '@/store';
import App from '@/App';
import '@/index.css';

const root = document.getElementById('root');

if (!root) {
  throw new Error('Root element #root not found. Check index.html.');
}

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
