import React, { useState, useEffect } from 'react';
import { BasicChatbot } from "./BasicChatBot";

const Metabuild = () => {
  const [config, setConfig] = useState({
    layout: "bottom-right",
    avatarnum: 2, // 유리가 2번이라고 가정
    llm: "gemini",
    assistantId: "",
    promptMode: "tag", // 🚀 추가됨: 기본 태그 모드 설정
    promptTags: [],    // 🚀 추가됨: 프롬프트 태그 배열
    promptManual: ""   // 🚀 추가됨: 직접 입력 프롬프트
  });

  useEffect(() => {
    const savedAdminConfig = localStorage.getItem("klever_admin_config");
    
    if (savedAdminConfig) {
      const parsedConfig = JSON.parse(savedAdminConfig);
      const agents = parsedConfig.apiKeys || [];

      // 🚀 여기서 "metabuild"만 딱 찾습니다. (이름 대소문자 주의)
      const targetAgent = agents.find(agent => agent.name === "metabuild");

      if (targetAgent) {
        const getAvatarNum = (charName) => {
          if (charName === "yuri") return 2;
          if (charName === "sujin") return 4;
          return 1;
        };

        // 🚀 핵심: Admin.js에서 했던 것처럼 커스텀 태그를 실제 텍스트로 변환
        const resolvedTags = (targetAgent.promptTags || []).map(tagId => {
          const customMatch = (targetAgent.customTags || []).find(t => t.id === tagId);
          if (customMatch) return customMatch.label; // 커스텀 태그면 한글 텍스트 반환
          return tagId; // 기본 제공 태그는 ID 그대로 넘김
        });

        setConfig({
          layout: parsedConfig.layout || "bottom-right",
          avatarnum: getAvatarNum(targetAgent.character),
          llm: targetAgent.llm || "gemini",
          assistantId: targetAgent.assistantId || "",
          promptMode: targetAgent.promptMode || "tag", // 🚀 추가됨
          promptTags: resolvedTags,                    // 🚀 추가됨 (텍스트로 변환된 태그 배열)
          promptManual: targetAgent.promptManual || "" // 🚀 추가됨
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
          promptMode={config.promptMode}     
          promptTags={config.promptTags}     
          promptManual={config.promptManual} 
        />
      </div>
    </div>
  );
};

export default Metabuild;