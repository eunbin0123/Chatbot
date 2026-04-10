import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './Page/Dashboard';
import Admin from './Page/Admin';
import FloatingWidget from './Page/FloatingWidget';
import Customize from './Page/Customize';
import { DigitalHuman } from './Page/DigitalHuman';
import ValuePage from './Page/ValuePage';
import {BasicChatbot} from './Page/BasicChatBot';



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

      </Routes>
    </Router>
  );
}