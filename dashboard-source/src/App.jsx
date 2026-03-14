import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Clients from './pages/Clients';

const DashboardHome = () => <div className="text-center py-20"><h2 className="text-3xl font-bold opacity-30">Página Inicial do Dashboard</h2><p className="opacity-50 mt-4">Navegue no menu lateral.</p></div>;
const PlaceholderPage = ({title}) => <div className="text-center py-20"><h2 className="text-3xl font-bold opacity-30">{title}</h2><p className="opacity-50 mt-4">Página em Construção</p></div>;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" />} />
        
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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
