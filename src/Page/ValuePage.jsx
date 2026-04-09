import React from 'react';
import { DigitalHuman } from './DigitalHuman';

const FullScreenIframe = () => {
  // 1. import 대신 직접 경로 문자열을 사용합니다.
  // public 폴더에 있으면 "/"로 시작하는 경로로 바로 접근 가능합니다.
  const backgroundImage = "/nowanbokjisaem.png"; // 파일명과 확장자(jpg/png)를 꼭 확인하세요!

  const wrapperStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    // 2. url() 안에 경로를 넣습니다.
    backgroundImage: `url(${backgroundImage})`,
    backgroundSize: '100% auto', // 가로를 꽉 채우고 세로는 비율에 맞게
    backgroundPosition: 'top center',
    backgroundRepeat: 'no-repeat',
    backgroundColor: '#ffffff',
    overflowY: 'auto',
    zIndex: 1,
  };

  const digitalHumanWrapperStyle = {
    position: 'fixed',
    bottom: '40px',
    right: '40px',
    zIndex: 10,
    pointerEvents: 'auto',
  };

  return (
    <div style={wrapperStyle}>
      {/* 이미지 높이만큼 스크롤 공간 확보 (필요시 조절) */}
      <div style={{ height: '100vh', width: '100%' }}></div>

      <div style={digitalHumanWrapperStyle}>
        <DigitalHuman apiKey={import.meta.env.VITE_KLEVER_API_KEY} />
      </div>
    </div>
  );
};

export default FullScreenIframe;