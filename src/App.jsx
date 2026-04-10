import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './Page/Dashboard';
import Admin from './Page/Admin';
import BasicAdmin from './Page/BasicAdmin';
import FloatingWidget from './Page/FloatingWidget';
import Customize from './Page/Customize';
import { DigitalHuman } from './Page/DigitalHuman';
import ChatbotTest from './Page/ChatbotTest';
import ValuePage from './Page/ValuePage';
import {BasicChatbot} from './Page/BasicChatBot';



export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/external" element={<ChatbotTest />} />
        <Route path="/api" element={<DigitalHuman apiKey={import.meta.env.VITE_KLEVER_API_KEY} />} />
        <Route path="/test" element={<ChatbotTest/>} />
        <Route path="/apiadmin" element={<Admin />} />
        <Route path="/normal" element={<BasicChatbot />} />
        <Route path="/customize" element={<Customize />} />
        <Route path="/value" element={<ValuePage />} />
        <Route path="/basicadmin" element={<BasicAdmin />} />

      </Routes>
    </Router>
  );
}