import React, { Suspense, lazy } from 'react';
import { HashRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import { Toaster } from 'react-hot-toast';

// Lazy load pages
const Home = lazy(() => import('./pages/Home'));
const Products = lazy(() => import('./pages/Products'));
const Winners = lazy(() => import('./pages/Winners'));
const Profile = lazy(() => import('./pages/Profile'));
const Orders = lazy(() => import('./pages/Orders'));
const Login = lazy(() => import('./pages/Login'));
const RaffleDetail = lazy(() => import('./pages/RaffleDetail'));

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
    this.state = { hasError: false, errorStack: '' };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    console.error("UI Error:", error, errorInfo);
    this.setState({ errorStack: error.toString() + "\n" + (errorInfo.componentStack || '') });
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-dark text-white p-8 text-center overflow-auto">
          <div className="max-w-4xl w-full space-y-4">
            <h1 className="text-2xl font-black uppercase text-primary">Ops! Algo deu errado.</h1>
            <div className="text-left bg-red-900/50 text-red-100 p-4 rounded text-[10px] font-mono whitespace-pre-wrap break-all border border-red-500/50">
              {this.state.errorStack || 'Erro desconhecido. Veja o console.'}
            </div>
            <button onClick={() => window.location.reload()} className="px-8 py-3 bg-primary text-black font-bold uppercase rounded-xl">Recarregar</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

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
            <Route path="raffle/:id" element={<RaffleDetail />} />
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
    <HashRouter>
      <Toaster position="top-right" />
      <AppContent />
    </HashRouter>
  );
}

export default App;
