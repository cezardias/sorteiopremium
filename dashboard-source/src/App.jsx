import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Clients from './pages/Clients';

const DashboardHome = () => (
  <div className="text-center py-20">
    <h2 className="text-3xl font-bold opacity-30">Página Inicial do Dashboard</h2>
    <p className="opacity-50 mt-4">Navegue no menu lateral.</p>
  </div>
);

const PlaceholderPage = ({title}) => (
  <div className="text-center py-20">
    <h2 className="text-3xl font-bold opacity-30">{title}</h2>
    <p className="opacity-50 mt-4">Página em Construção</p>
  </div>
);

const NotFound = () => (
  <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
    <h1 className="text-6xl font-bold text-red-500">404</h1>
    <p className="text-xl mt-4 opacity-70">Rota não encontrada no React.</p>
    <a href="/" className="mt-6 text-green-500 underline">Voltar para Início</a>
  </div>
);

function App() {
  // Basename '/' is usually right for subdomain root.
  // We wrap in Suspense just in case.
  return (
    <BrowserRouter basename="/">
      <Suspense fallback={<div className="p-20 text-center">Carregando App...</div>}>
        <Routes>
          {/* Fallback to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          <Route path="/dashboard" element={<Layout />}>
            <Route index element={<DashboardHome />} />
            <Route path="clientes" element={<Clients />} />
            <Route path="vendas" element={<PlaceholderPage title="Vendas" />} />
            <Route path="sorteios" element={<PlaceholderPage title="Sorteios" />} />
            <Route path="pedidos" element={<PlaceholderPage title="Pedidos" />} />
            <Route path="ranking" element={<PlaceholderPage title="Ranking" />} />
            <Route path="ganhadores" element={<PlaceholderPage title="Ganhadores" />} />
            <Route path="configurações" element={<PlaceholderPage title="Configurações" />} />
          </Route>

          {/* Fallback Catch-all Debug */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
