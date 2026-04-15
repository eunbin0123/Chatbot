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
  assistantId?: string;
}

export function BasicChatbot({ unrealurl, layout, autoOff, avatarnum, llm, assistantId }: BasicChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [size, setSize] = useState({ width: 360, height: 300 }); // 초기 사이즈
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);

  const videoWrapperRef = useRef<HTMLDivElement | null>(null);
  const psInstanceRef = useRef<PixelStreaming | null>(null);
  const widgetRef = useRef<HTMLDivElement | null>(null);
  const autoOffTimerRef = useRef<any>(null);

  const [threadId, setThreadId] = useState<string | null>(null);

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

  // 🚀 LLM 연결 및 스트리밍 전송 로직
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
        const gptApiKey = import.meta.env.VITE_OPENAI_API_KEY;
        
        // !!수정!! Assistant ID 존재 여부에 따라 RAG 모드와 기본 모드 분기 처리
        if (assistantId) {
          // ==========================================
          // [RAG 모드] Assistant ID가 있을 때 (Assistants API 사용)
          // ==========================================
          console.log("GPT RAG 모드로 답변을 생성합니다. (Assistant ID: " + assistantId + ")");
          
          let currentThreadId = threadId;
          if (!currentThreadId) {
            const threadRes = await fetch("https://api.openai.com/v1/threads", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${gptApiKey}`,
                "OpenAI-Beta": "assistants=v2"
              }
            });
            const threadData = await threadRes.json();
            currentThreadId = threadData.id;
            setThreadId(currentThreadId);
          }

          // 현재 스레드에 사용자 메시지 추가
          await fetch(`https://api.openai.com/v1/threads/${currentThreadId}/messages`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${gptApiKey}`,
              "OpenAI-Beta": "assistants=v2"
            },
            body: JSON.stringify({ role: "user", content: message })
          });

          // Assistant 실행
          const runRes = await fetch(`https://api.openai.com/v1/threads/${currentThreadId}/runs`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${gptApiKey}`,
              "OpenAI-Beta": "assistants=v2"
            },
            body: JSON.stringify({ assistant_id: assistantId })
          });
          const runData = await runRes.json();
          const runId = runData.id;

          // 처리 완료 대기 (Polling)
          let runStatus = runData.status;
          while (runStatus === "queued" || runStatus === "in_progress") {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            const checkRes = await fetch(`https://api.openai.com/v1/threads/${currentThreadId}/runs/${runId}`, {
              headers: {
                "Authorization": `Bearer ${gptApiKey}`,
                "OpenAI-Beta": "assistants=v2"
              }
            });
            const checkData = await checkRes.json();
            runStatus = checkData.status;
          }

          // 답변 가져오기
          if (runStatus === "completed") {
            const msgsRes = await fetch(`https://api.openai.com/v1/threads/${currentThreadId}/messages`, {
              headers: {
                "Authorization": `Bearer ${gptApiKey}`,
                "OpenAI-Beta": "assistants=v2"
              }
            });
            const msgsData = await msgsRes.json();
            
            const rawAnswer = msgsData.data[0]?.content[0]?.text?.value || "응답을 불러오지 못했습니다.";
            aiResponse = rawAnswer.replace(/【.*?】/g, ''); // 출처 마크다운 제거
            console.log("aiResponse (GPT RAG): %s", aiResponse);
          } else {
            console.error(`GPT 실행 실패 상태: ${runStatus}`);
            aiResponse = "답변 생성 중 오류가 발생했습니다.";
          }

        } else {
          // ==========================================
          // !!수정!! [기본 모드] Assistant ID가 없을 때 (일반 Chat API 사용)
          // ==========================================
          console.log("GPT 기본 모드로 답변을 생성합니다. (파일 연동 없음)");
          
          const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${gptApiKey}`
            },
            body: JSON.stringify({
              model: "gpt-4o", // 필요시 gpt-4로 변경 가능
              messages: [{ role: "user", content: message }]
            })
          });
          
          const data = await response.json();
          if (!response.ok) {
            throw new Error(`GPT Error: ${data.error?.message}`);
          }
          
          aiResponse = data.choices[0]?.message?.content || "GPT 응답을 생성하지 못했습니다.";
          console.log("aiResponse (GPT Basic): %s", aiResponse);
        }

      } else {
        // ==========================================
        // !!수정!! [Gemini 로직] 기본 모드 & RAG 모드 지원
        // ==========================================
        try {
          const apiKey = import.meta.env.VITE_GEMINAI_API_KEY; 
          const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=${apiKey}`;

          // 1. 기본 메시지 세팅
          let parts: any[] = [{ text: message }];

          // 2. RAG (파일) 이 업로드 되어 있는지 확인
          // assistantId에 우리가 아까 JSON.stringify로 넣었던 파일 정보들이 들어있습니다.
          if (assistantId) {
            try {
              const geminiFiles = JSON.parse(assistantId);
              
              // 질문(text) 보다 앞부분에 파일 데이터들을 차곡차곡 넣어줍니다.
              geminiFiles.forEach((file: any) => {
                parts.unshift({
                  fileData: {
                    mimeType: file.mimeType,
                    fileUri: file.uri
                  }
                });
              });
              console.log(`Gemini RAG 모드 작동 중 (참부된 파일 수: ${geminiFiles.length})`);
            } catch (e) {
              console.log("Gemini 기본 모드 작동 중 (파일 없음)");
            }
          } else {
            console.log("Gemini 기본 모드 작동 중 (파일 없음)");
          }

          // 3. API 호출 (parts 배열 통째로 전송)
          const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: parts }]
            })
          });

          const data = await response.json();

          if (!response.ok) {
            console.error("Gemini 에러:", data);
            throw new Error(`Error ${response.status}`);
          }

          aiResponse = data.candidates[0].content.parts[0].text;
          console.log("Gemini 응답 성공!");

        } catch (error) {
          console.error("호출 실패:", error);
          aiResponse = "연결 오류가 발생했습니다.";
        }
      }

      // 2. 응답받은 결과를 스트리밍 환경으로 전송
      if (aiResponse) {
              console.log("Message : %s", aiResponse);

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