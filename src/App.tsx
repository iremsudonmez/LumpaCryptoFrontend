import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './features/auth/LoginPage';
import { ProtectedRoute } from './routes/ProtectedRoute';

// temporary landing page -> replaced by the real market page next
function MarketPlaceholder() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <p className="text-white text-xl">Login works! Market page comes next 🎉</p>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<div className="text-white p-8">Register page soon</div>} />
      <Route
        path="/market"
        element={
          <ProtectedRoute>
            <MarketPlaceholder />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/market" replace />} />
    </Routes>
  );
}