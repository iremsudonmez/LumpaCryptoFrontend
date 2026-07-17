import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './features/auth/LoginPage';
import { RegisterPage } from './features/auth/RegisterPage';
import { MarketPage } from './features/market/MarketPage';
import { PortfolioPage } from './features/portfolio/PortfolioPage';
import { AiChatPage } from './features/ai-chat/AiChatPage';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './routes/ProtectedRoute';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/market" element={<MarketPage />} />
        <Route path="/portfolio" element={<PortfolioPage />} />
        <Route path="/ai" element={<AiChatPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/market" replace />} />
    </Routes>
  );
}