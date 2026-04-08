import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './Page/Dashboard';
import Admin from './Page/Admin';
import FloatingWidget from './Page/FloatingWidget';
import Customize from './Page/Customize';
export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        {/* /api 경로로 접속하면 Admin 컴포넌트를 보여줌 */}
        <Route path="/api" element={<Admin />} />
        <Route path="/normal" element={<FloatingWidget />} />
        <Route path="/customize" element={<Customize />} />

      </Routes>
    </Router>
  );
}