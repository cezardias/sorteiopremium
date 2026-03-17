import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import { Toaster } from 'react-hot-toast';

// Lazy load pages
import Home from './pages/Home';
import Products from './pages/Products';
import Winners from './pages/Winners';
import Profile from './pages/Profile';
import Orders from './pages/Orders';

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center bg-dark">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      }>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="produtos" element={<Products />} />
            <Route path="sorteios" element={<Products />} />
            <Route path="ganhadores" element={<Winners />} />
            <Route path="perfil" element={<Profile />} />
            <Route path="usuario" element={<Profile />} />
            <Route path="pedidos" element={<Orders />} />
            <Route path="meus-pedidos" element={<Orders />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
