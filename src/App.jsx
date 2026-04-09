import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './Page/Dashboard';
import Admin from './Page/Admin';
import FloatingWidget from './Page/FloatingWidget';
import Customize from './Page/Customize';
import { DigitalHuman } from './Page/DigitalHuman';
import ChatbotTest from './Page/ChatbotTest';
import ValuePage from './Page/ValuePage';

function ExternalHTML() {
  return (
    <iframe 
      src="/WidgetLoader.html" 
      style={{ width: '100%', height: '100%', border: 'none' }} 
      title="External Page"
    />
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ValuePage />} />
        {/* /api 경로로 접속하면 Admin 컴포넌트를 보여줌 */}
        <Route path="/external" element={<ExternalHTML />} />
        <Route path="/api" element={<DigitalHuman apiKey={import.meta.env.VITE_KLEVER_API_KEY} />} />
        <Route path="/test" element={<ChatbotTest/>} />
        <Route path="/apiadmin" element={<Admin />} />
        <Route path="/normal" element={<FloatingWidget />} />
        <Route path="/customize" element={<Customize />} />
        <Route path="/value" element={<ValuePage />} />

      </Routes>
    </Router>
  );
}