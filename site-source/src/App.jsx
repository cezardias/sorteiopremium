import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
// ... rest of imports

// ... logic

function App() {
  return (
    <HashRouter>
      <Toaster position="top-right" />
      <AppContent />
    </HashRouter>
  );
}
