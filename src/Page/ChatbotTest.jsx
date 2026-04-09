import React from 'react';
import { DigitalHuman } from './DigitalHuman'; 

function ChatbotTest() {
  // 스크립트 태그 문자열을 그대로 유지
  const scriptHtml = `
    <script 
      src="https://chatbot-demo-xr.vercel.app/api" 
      data-layout="top-right" 
      data-auto-off="900"
    ></script>
  `;

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      
      
      {/* dangerouslySetInnerHTML를 사용하여 
          요청하신 script 태그 형태를 그대로 DOM에 주입합니다. 
      */}
      <div dangerouslySetInnerHTML={{ __html: scriptHtml }} style={{ width: '100vw', height: '100vh' }}/>
    </div>
  );
}

export default ChatbotTest;