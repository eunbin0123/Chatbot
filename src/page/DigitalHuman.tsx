"use client";

import React, { useState, useEffect, useRef } from "react";
import "../css/DigitalHuman.css";

declare global {
  interface Window {
    KleverOneSdk: any;
  }
}

interface DigitalHumanProps {
  apiKey: string;
  layout: string;
  autoOff: number; // 초 단위
}

export function DigitalHuman({ apiKey, layout, autoOff }: DigitalHumanProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [size, setSize] = useState({width : 360, height : 300}); // 초기 사이즈
  const [isLoading, setIsLoading] = useState(false);
  const [isSdkLoaded, setIsSdkLoaded] = useState(false);
  const [inputText, setInputText] = useState("");

  const containerRef = useRef<HTMLDivElement>(null);
  const clientRef = useRef<any>(null);
  const autoOffTimerRef = useRef<any>(null);
  const widgetRef = useRef<HTMLDivElement | null>(null);

  // ================== SDK 로딩 ==================
  useEffect(() => {
    if (!document.getElementById("klever-sdk")) {
      const script = document.createElement("script");
      script.id = "klever-sdk";
      script.src =
        "https://unpkg.com/@klever-one/web-sdk@0.1.0-beta.19/dist/core/klever-one-core-v0.1.0-beta.19.umd.js";
      script.async = true;
      script.onload = () => setIsSdkLoaded(true);
      document.body.appendChild(script);
    } else {
      setIsSdkLoaded(true);
    }
  }, []);

  // ================== 자동 꺼짐 ==================
  const resetAutoOffTimer = () => {
    if (!autoOff) return;

    if (autoOffTimerRef.current) {
      clearTimeout(autoOffTimerRef.current);
    }

    autoOffTimerRef.current = setTimeout(() => {
      closeWidget();
    }, autoOff * 1000);
  };

  // ================== 열기 ==================
  const openWidget = () => {
    setIsLoading(true);
    setIsOpen(true);
    resetAutoOffTimer();
  };

  // ================== 닫기 ==================
  const closeWidget = () => {
    if (clientRef.current) {
      clientRef.current.disconnect();
      clientRef.current = null;
    }

    if (autoOffTimerRef.current) {
      clearTimeout(autoOffTimerRef.current);
    }

    setIsOpen(false);
    setIsLoading(false);
  };


  const handleResize = (mouseDownEvent: React.MouseEvent) => {
          mouseDownEvent.preventDefault();
          
          const onMouseMove = (mouseMoveEvent: MouseEvent) => {
              setSize((prev) => {
                  const isLeft = layout.includes("left");
                  const isTop = layout.includes("top");

                  
                  const deltaX = isLeft ? -mouseMoveEvent.movementX : mouseMoveEvent.movementX;
                  const deltaY = isTop ? -mouseMoveEvent.movementY : mouseMoveEvent.movementY;
  
                  // 예: bottom-right 위젯은 핸들이 좌측상단에 있음 -> 마우스가 왼쪽/위로 갈수록 커져야 함
                  // movementX가 음수(왼쪽)일 때 deltaX가 양수가 되어야 하므로 위 로직이 맞습니다.
                  const adjustX = layout === "bottom-right" || layout === "center" || layout === "top-right" ? -mouseMoveEvent.movementX : mouseMoveEvent.movementX;
                  const adjustY = layout === "bottom-right" || layout === "center" || layout === "bottom-left" ? -mouseMoveEvent.movementY : mouseMoveEvent.movementY;
  
                  return {
                      width: Math.min(Math.max(prev.width + adjustX, 300), 800),
                      height: Math.min(Math.max(prev.height + adjustY, 250), 600)
                  };
              });
          };
          const onMouseUp = () => {
              document.removeEventListener("mousemove", onMouseMove);
              document.removeEventListener("mouseup", onMouseUp);
          };
  
          document.addEventListener("mousemove", onMouseMove);
          document.addEventListener("mouseup", onMouseUp);
      };
  
     // 🚀 레이아웃별 최적화된 SVG 핸들 컴포넌트
     const ResizeHandle = () => {
          const isLeft = layout.includes("left");
          const isTop = layout.includes("top");
  
          const style: React.CSSProperties = {
              position: 'absolute',
              [isLeft ? 'right' : 'left']: '2px', // 살짝 더 구석에 밀착
              [isTop ? 'bottom' : 'top']: '2px',
              cursor: isLeft 
                  ? (isTop ? 'sw-resize' : 'nw-resize') 
                  : (isTop ? 'se-resize' : 'nw-resize'),
              zIndex: 10005,
              padding: '4px'
          };
  
          // 레이아웃별 둥근 꺽쇠 Path (M: 시작점, Q: 곡선 정점 및 끝점)
          let pathData = "M16,4 L8,4 Q4,4 4,8 L4,16"; // 기본: 좌상단 ㄴ (둥근 버전)
          
          if (layout === "bottom-right" || layout === "center") {
              pathData = "M16,4 L8,4 Q4,4 4,8 L4,16"; // 좌상단 ㄴ
          } else if (layout === "bottom-left") {
              pathData = "M8,4 L16,4 Q20,4 20,8 L20,16"; // 우상단 ㄱ
          } else if (layout === "top-right") {
              pathData = "M16,20 L8,20 Q4,20 4,16 L4,8"; // 좌하단 ㄴ 뒤집힌 모양
          } else if (layout === "top-left") {
              pathData = "M8,20 L16,20 Q20,20 20,16 L20,8"; // 우하단 ┘
          }
  
          return (
              <div className="dh-resize-handle" style={style} onMouseDown={handleResize}>
                  <svg 
                      width="22" 
                      height="22" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="white" 
                      strokeWidth="2.5" // 너무 두꺼우면 곡선이 뭉개지니 살짝 조절
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                  >
                      <path d={pathData}></path>
                  </svg>
              </div>
          );
      };


      // 🚀 레이아웃에 따라 위치가 바뀌는 닫기 버튼
          const CloseButton = () => {
              const isBottomLeft = layout === "bottom-left";
              
              const style: React.CSSProperties = {
                  position: 'absolute',
                  top: '12px',
                  // 좌측 하단 레이아웃일 때만 좌측 상단(left), 나머지는 우측 상단(right)
                  [isBottomLeft ? 'left' : 'right']: '12px', 
                  zIndex: 10006,
                  cursor: 'pointer',
                  background: 'rgba(0,0,0,0.3)',
                  borderRadius: '50%',
                  width: '30px',
                  height: '30px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: 'none',
                  transition: 'all 0.2s ease',
                  backdropFilter: 'blur(4px)'
              };
      
              return (
                  <button 
                      style={style} 
                      onClick={(e) => {
                          e.stopPropagation();
                          closeWidget();
                      }}
                      className="dh-inner-close-btn"
                  >
                      <svg viewBox="0 0 24 24" width="20" height="20" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                  </button>
              );
          };
  // ================== SDK 연결 ==================
  useEffect(() => {
    if (isOpen && isSdkLoaded && containerRef.current && !clientRef.current) {
      const { KleverOneClient } = window.KleverOneSdk;

      const client = new KleverOneClient({
        apiKey,
        container: containerRef.current,
        callbacks: {
          onReady: () => {
            setIsLoading(false);

            setTimeout(() => {
              try {
                client.sendText("안녕하세요");
                client.sendZoomIn();
              } catch (e) {
                console.error("초기 메시지 실패");
              }
            }, 200);
          },
          onError: (err: any) => {
            console.error("에러:", err);
            setIsLoading(false);
          },
        },
      });

      client.connect();
      clientRef.current = client;

      return () => {
        if (clientRef.current) {
          clientRef.current.disconnect();
          clientRef.current = null;
        }
      };
    }
  }, [isOpen, isSdkLoaded, apiKey]);

  // ================== 메시지 전송 ==================
  const sendMessage = () => {
    if (!inputText.trim() || !clientRef.current) return;
    clientRef.current.sendText(inputText);
    setInputText("");
    resetAutoOffTimer();
  };

  return (
    <>
      {/* 위젯 */}
      <div
        className={`dh-widget ${layout} ${isOpen ? "open" : "closed"}`}
        style={{ width: `${size.width}px`, height: `${size.height}px` }}
        onMouseDown={resetAutoOffTimer}
        onTouchStart={resetAutoOffTimer}
      >
        {isLoading && (
          <div className="dh-loading-overlay">
            <div className="dh-spinner" />
            <span>연결 중...</span>
          </div>
        )}

        <div ref={containerRef} className="dh-container" />
        {isOpen && <CloseButton />}
        <ResizeHandle />
        <div className="dh-input-bar">
          <input
            type="text"
            placeholder="메시지 입력..."
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value);
              resetAutoOffTimer();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") sendMessage();
              resetAutoOffTimer();
            }}
          />
          <button onClick={sendMessage} className="dh-send-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" width="18" height="18">
              <line x1="12" y1="19" x2="12" y2="5"></line>
              <polyline points="5 12 12 5 19 12"></polyline>
            </svg>
          </button>
        </div>
      </div>

      {!isOpen && (
                <button type="button" className={`dh-toggle-btn ${layout}`} onClick={openWidget}>
                    <svg viewBox="0 0 24 24" width="30" height="30" fill="white">
                        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
                    </svg>
                </button>
            )}
    </>
  );
}