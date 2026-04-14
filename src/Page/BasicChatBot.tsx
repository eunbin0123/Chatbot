import React, { useState, useEffect, useRef } from "react";
import { Config, PixelStreaming } from "@epicgames-ps/lib-pixelstreamingfrontend-ue5.4";
import { GoogleGenerativeAI } from '@google/generative-ai';
import "../css/FloatingWidget.css";

interface BasicChatbotProps {
  unrealurl: string;
  layout: string;
  autoOff: number; // 초 
  avatarnum: number;
  llm: string; // "gpt" 또는 "gemini"
}

export function BasicChatbot({ unrealurl, layout, autoOff, avatarnum, llm }: BasicChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [size, setSize] = useState({ width: 360, height: 300 }); // 초기 사이즈
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);

  const videoWrapperRef = useRef<HTMLDivElement | null>(null);
  const psInstanceRef = useRef<PixelStreaming | null>(null);
  const widgetRef = useRef<HTMLDivElement | null>(null);
  const autoOffTimerRef = useRef<any>(null);

  const handleResize = (mouseDownEvent: React.MouseEvent) => {
    mouseDownEvent.preventDefault();

    const onMouseMove = (mouseMoveEvent: MouseEvent) => {
      setSize((prev) => {
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

  const ResizeHandle = () => {
    const isLeft = layout.includes("left");
    const isTop = layout.includes("top");

    const style: React.CSSProperties = {
      position: 'absolute',
      [isLeft ? 'right' : 'left']: '2px',
      [isTop ? 'bottom' : 'top']: '2px',
      cursor: isLeft
        ? (isTop ? 'sw-resize' : 'nw-resize')
        : (isTop ? 'se-resize' : 'nw-resize'),
      zIndex: 10005,
      padding: '4px'
    };

    let pathData = "M16,4 L8,4 Q4,4 4,8 L4,16";

    if (layout === "bottom-right" || layout === "center") {
      pathData = "M16,4 L8,4 Q4,4 4,8 L4,16";
    } else if (layout === "bottom-left") {
      pathData = "M8,4 L16,4 Q20,4 20,8 L20,16";
    } else if (layout === "top-right") {
      pathData = "M16,20 L8,20 Q4,20 4,16 L4,8";
    } else if (layout === "top-left") {
      pathData = "M8,20 L16,20 Q20,20 20,16 L20,8";
    }

    return (
      <div className="fw-resize-handle" style={style} onMouseDown={handleResize}>
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d={pathData}></path>
        </svg>
      </div>
    );
  };

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


  const disconnectStreaming = () => {
    if (psInstanceRef.current) {
      psInstanceRef.current.disconnect();
      psInstanceRef.current = null;
    }
    if (videoWrapperRef.current) {
      videoWrapperRef.current.innerHTML = "";
    }
    setIsLoading(false);
  };

  const openWidget = () => {
    setIsLoading(true);
    setIsOpen(true);
  };

  const closeWidget = () => {
    disconnectStreaming();
    setIsMicOn(false);
    setIsOpen(false);
  };

  useEffect(() => {
    if (isOpen && !psInstanceRef.current && videoWrapperRef.current) {
      const connect = async () => {
        try {
          const matchmakerUrl = unrealurl.replace("https://", "http://");
          const protocol = window.location.protocol === 'https:' ? 'wss' : 'wss';
          const res = await fetch(`${matchmakerUrl}/signallingserver`);
          const data = await res.json();
          const ssUrl = `${protocol}://${data.signallingServer}`;
          const config = new Config({
            initialSettings: {
              ss: ssUrl,
              AutoPlayVideo: true,
              AutoConnect: true,
              HoveringMouse: true,
              KeyboardInput: false,
              MouseInput: false,
            },
          });

          const psInstance = new PixelStreaming(config);
          psInstanceRef.current = psInstance;

          psInstance.addEventListener("videoInitialized", () => {
            if (videoWrapperRef.current) {
              videoWrapperRef.current.innerHTML = "";
              videoWrapperRef.current.appendChild(psInstance.videoElementParent);
              setIsLoading(false);
            }

            psInstance.emitUIInteraction({
              "Category": "SystemSetting",
              "Type": "WebConnected",
              "Width": "1280",
              "Height": "720"
            });
            psInstance.emitUIInteraction({
              "Category": "AvatarSetting",
              "Type": "AvatarNum",
              "Value": "1"
            });
            psInstance.emitUIInteraction({
              "Category": "PageSetting",
              "Type": "WindowSize"
            });
          });

        } catch (err) {
          console.error("Matchmaker connection failed:", err);
          setIsLoading(false);
        }
      };

      connect();

      return () => {
        disconnectStreaming();
      };
    }
  }, [isOpen]);

  useEffect(() => {
    if (psInstanceRef.current && isOpen) {
      psInstanceRef.current.emitUIInteraction({
        Category: "AvatarSetting",
        Type: "AvatarNum",
        Value: String(avatarnum)
      });
      console.log(`아바타 변경 신호 전송됨: ${avatarnum}`);
    }
  }, [avatarnum, isOpen]);

 // 🚀 LLM 연결 및 언리얼 전송 로직
const sendMessage = async () => {
  const message = inputText.trim();
  if (!message || !psInstanceRef.current || isLoading) return;

  try {
    setIsLoading(true);
    setInputText("");
    resetAutoOffTimer();
    let aiResponse = "";

    // 1. LLM 타입에 따른 API 호출 분기
    if (llm === "gpt") {
      // [GPT 연동 부분]
      
      const gptApiKey = import.meta.env.VITE_OPENAI_API_KEY;
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer sk-${import.meta.env.VITE_OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-4",
          messages: [{ role: "user", content: message }]
        })
      });
      
      const data = await response.json();
      aiResponse = data.choices[0]?.message?.content || "GPT 응답을 생성하지 못했습니다.";
      console.log("aiResponse (GPT): %s", aiResponse);

   } else {
  try {
    const apiKey = import.meta.env.VITE_GEMINAI_API_KEY; 
    // 리스트에 존재 확인된 3.1 Flash Lite 모델 경로입니다.
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: message }] }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini 에러:", data);
      throw new Error(`Error ${response.status}`);
    }

    aiResponse = data.candidates[0].content.parts[0].text;
    console.log("연결 성공! (Gemini 3.1 Flash Lite)");

  } catch (error) {
    console.error("호출 실패:", error);
    aiResponse = "연결 오류가 발생했습니다.";
  }
}
    // 2. 응답받은 결과를 언리얼 엔진으로 전송
    // aiResponse가 비어있지 않을 때만 전송
    if (aiResponse) {
      psInstanceRef.current.emitUIInteraction({
        Category: "VoiceSetting",
        Type: "Script",
        Value: encodeURIComponent(aiResponse), // 인코딩하여 전송
      });
    }

  } catch (error) {
    console.error("LLM 전체 로직 에러:", error);
  } finally {
    setIsLoading(false);
  }
};

  const handleKeyEvent = (e: any) => {
    if (e.key === "Enter") sendMessage();
  };

  const toggleMic = () => {
    setIsMicOn((v) => !v);
  };

  const handleInputFocus = () => {
    if (psInstanceRef.current) {
      psInstanceRef.current.emitUIInteraction({
        Category: "Chat",
        Type: "Typing"
      });
    }
  };

  const CloseButton = () => {
    const isBottomLeft = layout === "bottom-left";

    const style: React.CSSProperties = {
      position: 'absolute',
      top: '12px',
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
        className="fw-inner-close-btn"
      >
        <svg viewBox="0 0 24 24" width="20" height="20" stroke="white" strokeWidth="2.5" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    );
  };

  return (
    <>
      <div id="fw-app-root">
        <div className={`fw-widget ${layout} ${isOpen ? "open" : "closed"}`}
          style={{ width: `${size.width}px`, height: `${size.height}px` }}
          onMouseDown={resetAutoOffTimer}
        onTouchStart={resetAutoOffTimer}
        >
          {isLoading && (
            <div className="fw-loading-overlay">
              <div className="loading-spinner" />
              <span>연결 중...</span>
            </div>
          )}

          <div ref={videoWrapperRef} className="fw-video-wrapper" />
          {isOpen && <CloseButton />}
          <ResizeHandle />
          <div className="fw-input-bar">
            <input
              type="text"
              className="fw-input"
              value={inputText}
              onFocus={handleInputFocus}
              onChange={(e) => {setInputText(e.target.value); resetAutoOffTimer();}}
              onKeyDown={handleKeyEvent}
              placeholder="메시지 입력..."
              disabled={isLoading}
            />

            <button
              type="button"
              className={`mic-btn ${isMicOn ? "active" : ""}`}
              onClick={toggleMic}
              disabled={isLoading}
            >
              <svg viewBox="0 0 24 24" fill="white" style={{ width: "20px" }}>
                <path d="M12 14a3 3 0 003-3V7a3 3 0 10-6 0v4a3 3 0 003 3zm5-3a1 1 0 10-2 0 3 3 0 11-6 0 1 1 0 10-2 0 5 5 0 004 4.9V19H9a1 1 0 100 2h6a1 1 0 100-2h-2v-2.1A5 5 0 0017 11z" />
              </svg>
            </button>

            <button onClick={sendMessage} className="send-btn" disabled={isLoading}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                width="18"
                height="18"
              >
                <line x1="12" y1="19" x2="12" y2="5"></line>
                <polyline points="5 12 12 5 19 12"></polyline>
              </svg>
            </button>
          </div>
        </div>

        {!isOpen && (
          <button type="button" className={`fw-toggle ${layout}`} onClick={openWidget}>
            <svg viewBox="0 0 24 24" width="30" height="30" fill="white">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
            </svg>
          </button>
        )}
      </div>
    </>
  );
};