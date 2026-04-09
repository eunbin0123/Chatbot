import React from 'react';
import { DigitalHuman } from './DigitalHuman';

const FullScreenIframe = () => {
  // 전체 컨테이너 스타일
  const wrapperStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: '#ffffff', // 배경 하얗게
    overflow: 'hidden',
    zIndex: 1,
  };

  const iframeStyle = {
    width: '100%',
    height: '100%',
    border: 'none',
    backgroundColor: '#ffffff',
  };

  // DigitalHuman을 iframe 위에 띄우기 위한 스타일
  const digitalHumanWrapperStyle = {
    position: 'absolute',
    bottom: '20px', // 하단 배치 (원하는 위치로 수정 가능)
    right: '20px',  // 우측 배치 (원하는 위치로 수정 가능)
    zIndex: 10,     // iframe보다 위에 보이도록 설정
    pointerEvents: 'auto', // 클릭 등 상호작용 가능하게 설정
  };

  return (
    <div style={wrapperStyle}>
      {/* 배경 페이지 */}
      <iframe
        src="https://www.seochosenior.org/"
        title="서초구립 양재노인종합복지관"
        style={iframeStyle}
        allowFullScreen
      />

      {/* iframe 위에 겹쳐질 디지털 휴먼 */}
      <div style={digitalHumanWrapperStyle}>
        <DigitalHuman apiKey={import.meta.env.VITE_KLEVER_API_KEY} />
      </div>
    </div>
  );
};

export default FullScreenIframe;