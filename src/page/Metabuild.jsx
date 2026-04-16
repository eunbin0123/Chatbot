import React, { useState, useEffect } from 'react';
import { BasicChatbot } from "./BasicChatBot";

const Metabuild = () => {
  const [config, setConfig] = useState({
    layout: "bottom-right",
    avatarnum: 2, // 유리가 2번이라고 가정
    llm: "gemini",
    assistantId: ""
  });

  useEffect(() => {
    const savedAdminConfig = localStorage.getItem("klever_admin_config");
    
    if (savedAdminConfig) {
      const parsedConfig = JSON.parse(savedAdminConfig);
      const agents = parsedConfig.apiKeys || [];

      // 🚀 여기서 "Metabuild"만 딱 찾습니다.
      const targetAgent = agents.find(agent => agent.name === "metabuild");

      if (targetAgent) {
        const getAvatarNum = (charName) => {
          if (charName === "yuri") return 2;
          if (charName === "sujin") return 4;
          return 1;
        };

        setConfig({
          layout: parsedConfig.layout || "bottom-right",
          avatarnum: getAvatarNum(targetAgent.character),
          llm: targetAgent.llm || "gemini",
          assistantId: targetAgent.assistantId || ""
        });
      }
    }
  }, []);

  const containerStyle = { position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', margin: 0, padding: 0 };
  const iframeStyle = { width: '100%', height: '100%', border: 'none' };
  const chatbotWrapperStyle = { position: 'absolute', bottom: '20px', right: '20px', zIndex: 1000 };

  return (
    <div style={containerStyle}>
      <iframe src="https://www.metabuild.co.kr/" title="Metabuild Website" style={iframeStyle} allowFullScreen />
      <div style={chatbotWrapperStyle}>
        <BasicChatbot 
          unrealurl={import.meta.env.VITE_MATCHMAKER}
          layout={config.layout}
          avatarnum={config.avatarnum}
          llm={config.llm}
          assistantId={config.assistantId} 
          agentName='metabuild'
        />
      </div>
    </div>
  );
};

export default Metabuild;