import React, { useState, useEffect } from 'react';
import { BasicChatbot } from "./BasicChatBot";

const KleverOne = () => {
  const [config, setConfig] = useState({
    layout: "bottom-right",
    avatarnum: 1, // 차누가 1번이라고 가정
    llm: "gpt",
    assistantId: ""
  });

  useEffect(() => {
    const savedAdminConfig = localStorage.getItem("klever_admin_config");
    
    if (savedAdminConfig) {
      const parsedConfig = JSON.parse(savedAdminConfig);
      const agents = parsedConfig.apiKeys || [];

      // 🚀 여기서 "klever one"만 딱 찾습니다.
      const targetAgent = agents.find(agent => agent.name === "chilloen");

      if (targetAgent) {
        const getAvatarNum = (charName) => {
          if (charName === "yuri") return 2;
          if (charName === "sujin") return 4;
          return 1;
        };

        setConfig({
          layout: parsedConfig.layout || "bottom-right",
          avatarnum: getAvatarNum(targetAgent.character),
          llm: targetAgent.llm || "gpt",
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
      <iframe src="https://www.chilloen.com/" title="chilloen Website" style={iframeStyle} allowFullScreen />
      <div style={chatbotWrapperStyle}>
        <BasicChatbot 
          unrealurl={import.meta.env.VITE_MATCHMAKER}
          layout={config.layout}
          avatarnum={config.avatarnum}
          llm={config.llm}
          assistantId={config.assistantId} 
          agentName='chilloean'
        />
      </div>
    </div>
  );
};

export default KleverOne;