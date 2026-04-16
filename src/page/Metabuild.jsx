import React from 'react';
import { BasicChatbot } from "./BasicChatbot";
const KleverOne = () => {
  // 전체 컨테이너 스타일
  const containerStyle = {
    position: 'relative', // 챗봇의 기준점이 됨
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

  // 챗봇을 화면 오른쪽 하단 등에 고정시키기 위한 스타일
  const chatbotWrapperStyle = {
    position: 'absolute',
    bottom: '20px',
    right: '20px',
    zIndex: 1000, // iframe보다 위에 보이도록 설정
  };

  return (
    <div style={containerStyle}>
      {/* 배경이 되는 풀페이지 iframe */}
      <iframe
        src="https://www.metabuild.co.kr/"
        title="Metabuild Website"
        style={iframeStyle}
        allowFullScreen
      />

      {/* iframe 위에 올라가는 챗봇 컨테이너 */}
      <div style={chatbotWrapperStyle}>
        <BasicChatbot 
          unrealurl={import.meta.env.VITE_MATCHMAKER}
          layout={"bottom-right"} // 외부에서 정의된 layout 변수가 있어야 함
          
          /* 1. 아바타: 변경 즉시 반영 */
          avatarnum={1} // 외부에서 정의된 currentAvatarNum 필요
          
          /* 2. LLM 엔진 및 Assistant: 저장해야만 반영 */
          llm={"gpt"} // 외부에서 정의된 savedAgent 필요
          assistantId={""} 
        />
      </div>
    </div>
  );
};

export default KleverOne;