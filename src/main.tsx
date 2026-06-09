import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

navigator.serviceWorker.getRegistrations().then(function(rs) {
  for (var r of rs) {
    if (r.active && r.active.scriptURL.indexOf('sw-check-permissions') !== -1) { r.unregister(); }
    if (r.active && r.active.scriptURL.indexOf('sw.js') !== -1) { r.update(); }
  }
});
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js?v=3');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
