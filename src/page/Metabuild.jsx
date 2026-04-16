import React, { useState, useEffect } from 'react';
import { BasicChatbot } from "./BasicChatBot";

const Metabuild = () => {
  // ✨ 1. 챗봇 설정값을 관리할 State (기본값 세팅)
  const [config, setConfig] = useState({
    layout: "bottom-right",
    avatarnum: 1,
    llm: "gpt",
    assistantId: ""
  });

  // ✨ 2. 컴포넌트 마운트 시 LocalStorage에서 설정 불러오기
  useEffect(() => {
    const savedConfig = localStorage.getItem("klever_widget_config");
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig));
    }
  }, []);

  const containerStyle = {
    position: 'relative',
    width: '100vw',
    height: '100vh',
    overflow: 'hidden',
    margin: 0,
    padding: 0,
  };

  const iframeStyle = {
    width: '100%',
    height: '100%',
    border: 'none',
  };

  const chatbotWrapperStyle = {
    position: 'absolute',
    bottom: '20px',
    right: '20px',
    zIndex: 1000,
  };

  return (
    <div style={containerStyle}>
      <iframe
        src="https://www.metabuild.co.kr/"
        title="Metabuild Website"
        style={iframeStyle}
        allowFullScreen
      />

      <div style={chatbotWrapperStyle}>
        <BasicChatbot 
          unrealurl={import.meta.env.VITE_MATCHMAKER}
          
          // ✨ 3. 상태(config)에 저장된 값들을 Props로 전달
          layout={config.layout}
          avatarnum={config.avatarnum}
          llm={config.llm}
          assistantId={config.assistantId} 
        />
      </div>
    </div>
  );
};

export default Metabuild;