import React from 'react';
import { DigitalHuman } from './DigitalHuman'; 

function ChatbotTest() {

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      {<DigitalHuman apiKey={import.meta.env.VITE_KLEVER_API_KEY} />}
    </div>
  );
}

export default ChatbotTest;