import { Routes, Route, Navigate } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { ShoppingPage } from './pages/ShoppingPage';
import { MyPage } from './pages/MyPage';
import { PlansPage } from './pages/PlansPage';
import { CreatePlanPage } from './pages/CreatePlanPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/shopping" element={<ShoppingPage />} />
      <Route path="/me" element={<MyPage />} />
      <Route path="/plans" element={<PlansPage />} />
      <Route path="/create" element={<CreatePlanPage />} />
      {/* Fallback redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
