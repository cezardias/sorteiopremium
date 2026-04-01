import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Clients from './pages/Clients';
import Raffles from './pages/Raffles';
import Sales from './pages/Sales';
import Orders from './pages/Orders';
import Ranking from './pages/Ranking';
import Winners from './pages/Winners';
import SiteSettings from './pages/SiteSettings';
import Users from './pages/Users';
import PaymentSettings from './pages/PaymentSettings';
import ProfileSettings from './pages/ProfileSettings';
import WhatsAppCampaign from './pages/WhatsAppCampaign';
import Affiliates from './pages/Affiliates';
import Login from './pages/Login';
import DashboardHome from './pages/DashboardHome';
import api from './api/api';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('admin_token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

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

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("React Error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-20 bg-red-900/20 border border-red-500 rounded-xl m-10 text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-4 uppercase">Ops! Ocorreu um erro no sistema</h1>
          <p className="text-gray-300 font-mono text-sm mb-4">{this.state.error?.toString()}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-red-500 text-white font-bold uppercase rounded-lg"
          >
            Tentar Recarregar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter basename="/">
        <Suspense fallback={<div className="p-20 text-center text-green-500 font-bold tracking-widest animate-pulse">Carregando...</div>}>
          <div className="fixed bottom-4 right-4 z-[9999] bg-black/80 text-[8px] text-gray-500 p-1 rounded font-mono pointer-events-none">
            Production Build v2.3 - Global Theme Update
          </div>
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
            <Route path="sorteios" element={<Raffles />} />
            <Route path="vendas" element={<Sales />} />
            <Route path="pedidos" element={<Orders />} />
            <Route path="ranking" element={<Ranking />} />
            <Route path="ganhadores" element={<Winners />} />
            <Route path="afiliados" element={<Affiliates />} />
            <Route path="usuarios" element={<Users />} />
            <Route path="site" element={<SiteSettings />} />
            <Route path="pagamentos" element={<PaymentSettings />} />
            <Route path="perfil" element={<ProfileSettings />} />
            <Route path="whatsapp" element={<WhatsAppCampaign />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
