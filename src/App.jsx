import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './page/Dashboard';
import Admin from "./page/Admin";
import FloatingWidget from './page/FloatingWidget';
import Customize from './page/Customize';
import { DigitalHuman } from './page/DigitalHuman';
import ValuePage from './page/ValuePage';
import {BasicChatbot} from './page/BasicChatBot';
import Metabuild from './page/Metabuild';
import KleverOne from './page/KleverOne';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/api" element={<DigitalHuman apiKey={import.meta.env.VITE_KLEVER_API_KEY} layout={"bottom-right"} />} />
        <Route path="/apiadmin" element={<Admin chatbotType = "sdk"/>} />
        <Route path="/normal" element={<BasicChatbot 
                unrealurl = {import.meta.env.VITE_MATCHMAKER}
                layout={"bottom-right"}
                avatarnum={1}
              />} />
        <Route path="/customize" element={<Customize />} />
        <Route path="/value" element={<ValuePage />} />
        <Route path="/basicadmin" element={<Admin chatbotType = "basic"/>} />
        <Route path="/metabuild" element={<Metabuild />} />
        <Route path="/keleverone" element={<KleverOne />} />
        
      </Routes>
    </Router>
  );
}