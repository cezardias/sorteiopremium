import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Clients from './pages/Clients';
import Login from './pages/Login';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('admin_token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const DashboardHome = () => (
  <div className="text-center py-20">
    <h2 className="text-3xl font-bold text-white uppercase tracking-widest bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">Geral do Painel</h2>
    <p className="text-gray-400 mt-4 font-bold tracking-widest uppercase text-sm">Use o menu lateral para gerenciar Clientes, Vendas e Sorteios.</p>
  </div>
);

const PlaceholderPage = ({title}) => (
  <div className="text-center py-20">
    <h2 className="text-3xl font-bold text-gray-700 uppercase tracking-widest">{title}</h2>
    <p className="text-gray-500 mt-4 font-bold tracking-widest">Página em fase de migração para o novo sistema nativo.</p>
  </div>
);

const NotFound = () => (
  <div className="flex flex-col items-center justify-center min-h-[50vh] text-center text-gray-400">
    <h1 className="text-6xl font-bold text-red-500/50">404</h1>
    <p className="text-xl mt-4 opacity-70 font-bold uppercase tracking-widest">Rota não encontrada</p>
    <a href="/dashboard" className="mt-6 text-green-500 underline uppercase text-sm font-bold tracking-widest">Voltar para início</a>
  </div>
);

function App() {
  return (
    <BrowserRouter basename="/">
      <Suspense fallback={<div className="p-20 text-center text-green-500 font-bold tracking-widest animate-pulse">Carregando...</div>}>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<DashboardHome />} />
            <Route path="clientes" element={<Clients />} />
            <Route path="vendas" element={<PlaceholderPage title="Vendas" />} />
            <Route path="sorteios" element={<PlaceholderPage title="Sorteios" />} />
            <Route path="pedidos" element={<PlaceholderPage title="Pedidos" />} />
            <Route path="ranking" element={<PlaceholderPage title="Ranking" />} />
            <Route path="ganhadores" element={<PlaceholderPage title="Ganhadores" />} />
            <Route path="configurações" element={<PlaceholderPage title="Configurações" />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
