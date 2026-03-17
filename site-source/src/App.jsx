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
import Login from './pages/Login';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('client_token');
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    console.error("UI Error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-dark text-white p-8 text-center">
          <div className="max-w-md space-y-4">
            <h1 className="text-2xl font-black uppercase tracking-tighter text-primary">Ops! Algo deu errado.</h1>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Ocorreu um erro ao carregar a interface. Tente recarregar.</p>
            <button onClick={() => window.location.reload()} className="px-8 py-3 bg-primary text-black font-bold uppercase rounded-xl">Recarregar</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

import { useLocation } from 'react-router-dom';

function AppContent() {
  const location = useLocation();
  React.useEffect(() => {
    console.log("Current Route:", location.pathname);
  }, [location]);

  return (
    <ErrorBoundary>
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
            <Route path="login" element={<Login />} />
            
            <Route path="perfil" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="usuario" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            
            <Route path="pedidos" element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            } />
            <Route path="meus-pedidos" element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            } />
            
            <Route path="*" element={<Home />} />
          </Route>
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
