import React, { useState, useEffect, useRef } from "react";
import { Config, PixelStreaming } from "@epicgames-ps/lib-pixelstreamingfrontend-ue5.4";
import { GoogleGenerativeAI } from '@google/generative-ai';
import "../css/FloatingWidget.css";

interface BasicChatbotProps {
  unrealurl: string;
  layout: string;
  avatarnum: number;
  llm: string; // "gpt" 또는 "gemini"
  assistantId?: string;
  agentName?: string; // 🚀 로컬 스토리지에서 특정 에이전트의 프롬프트 설정을 찾기 위한 이름
}

const tagInstructions: Record<string, string> = {
  "no_politics": "정치적인 주제에 대한 질문에는 절대 답변하지 마세요.",
  "no_religion": "종교와 관련된 논쟁이나 의견 표출을 피하세요.",
  "no_social_controversy": "사회적 논란이 될 수 있는 주제에 대해서는 철저히 중립을 지키세요.",
  "no_profanity": "어떤 상황에서도 비속어나 혐오 표현을 사용하지 마세요.",
  "no_competitors": "타사나 경쟁사에 대한 언급은 피하고, 우리 서비스에 집중하세요.",
  "no_personal_info": "사용자의 개인정보를 요구하거나 저장하지 마세요.",
  "polite_tone": "항상 정중하고 예의 바른 존댓말로 답변하세요.",
  "require_citation": "사실 기반의 정보를 제공할 때는 가능한 한 출처나 근거를 함께 언급하세요.",
  "empathy_first": "답변을 시작할 때 먼저 사용자의 감정이나 상황에 공감하는 문장을 한 줄 넣어주세요."
};

export function BasicChatbot({ 
  unrealurl, 
  layout, 
  avatarnum, 
  llm, 
  assistantId,
  agentName = "" // 기본값
}: BasicChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [size, setSize] = useState({ width: 360, height: 300 }); 
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);

  // 🚀 내부에서 로컬 스토리지 프롬프트를 관리할 상태
  const [promptSettings, setPromptSettings] = useState({
    mode: "tag",
    tags: [] as string[],
    manual: ""
  });

  const videoWrapperRef = useRef<HTMLDivElement | null>(null);
  const psInstanceRef = useRef<PixelStreaming | null>(null);
  const [threadId, setThreadId] = useState<string | null>(null);

  // 🚀 컴포넌트 마운트 시 로컬 스토리지에서 프롬프트 설정 가져오기
  useEffect(() => {
    try {
      const savedAdminConfig = localStorage.getItem("klever_admin_config");
      if (savedAdminConfig) {
        const parsedConfig = JSON.parse(savedAdminConfig);
        const agents = parsedConfig.apiKeys || [];
        
        // agentName이 있으면 해당 에이전트 검색, 없으면 첫 번째 에이전트 사용 (안전 장치)
        const targetAgent = agentName 
          ? agents.find((a: any) => a.name === agentName) 
          : agents[0];

        if (targetAgent) {
          setPromptSettings({
            mode: targetAgent.promptMode || "tag",
            tags: targetAgent.promptTags || [],
            manual: targetAgent.promptManual || ""
          });
          console.log(`[${agentName || 'default'}] 프롬프트 설정 로드 완료`);
        }
      }
    } catch (e) {
      console.error("로컬 스토리지 프롬프트 파싱 오류:", e);
    }
  }, [agentName]);

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
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d={pathData}></path>
        </svg>
      </div>
    );
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
// 💡 상단에 연결 중 상태를 추적하기 위한 ref를 하나 추가하세요.
const isConnectingRef = useRef(false);

useEffect(() => {
  // 인스턴스가 없고, 연결 시도 중이 아닐 때만 실행
  if (isOpen && !psInstanceRef.current && videoWrapperRef.current && !isConnectingRef.current) {
    let isCancelled = false; // 언마운트 시 비동기 작업 중단용 플래그

    const connect = async () => {
      isConnectingRef.current = true;
      try {
        const matchmakerUrl = import.meta.env.VITE_MATCHMAKER.replace("https://", "http://");
                            const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
                            const res = await fetch(`${matchmakerUrl}/signallingserver`);
                            const data = await res.json();
                            const ssUrl = `${protocol}://${data.signallingServer}`;
                            const config = new Config({
                                                initialSettings: {
                                                    ss: ssUrl,
                                                    AutoPlayVideo: true,
                                                    AutoConnect: true,
                                                    //StartVideoMuted: true,
                                                    HoveringMouse: true,
                                                    KeyboardInput:false,
                                                    MouseInput:false,
                                                },
                                            });
        
        const psInstance = new PixelStreaming(config);
        psInstanceRef.current = psInstance;

        psInstance.addEventListener("videoInitialized", () => {
          // 💡 비디오 초기화 시점에도 위젯이 닫혀있는지 체크
          if (isCancelled) {
            psInstance.disconnect();
            return;
          }

          if (videoWrapperRef.current) {
            videoWrapperRef.current.innerHTML = "";
            videoWrapperRef.current.appendChild(psInstance.videoElementParent);
            setIsLoading(false);
          }

          // 초기 UI Interaction 이벤트 전송
          psInstance.emitUIInteraction({
            "Category": "SystemSetting",
            "Type": "WebConnected",
            "Width": "1280",
            "Height": "720"
          });
          psInstance.emitUIInteraction({
            "Category": "AvatarSetting",
            "Type": "AvatarNum",
            "Value": String(avatarnum)
          });
          psInstance.emitUIInteraction({
            "Category": "PageSetting",
            "Type": "WindowSize"
          });
        });

        // 💡 안정성을 위해 스트리밍 끊김 감지 이벤트 추가 (선택사항)
        psInstance.addEventListener("disconnect", () => {
          console.warn("Pixel Streaming이 서버와 연결이 끊어졌습니다.");
          if (isOpen) setIsLoading(false);
        });

      } catch (err) {
        console.error("Matchmaker connection failed:", err);
        if (!isCancelled) setIsLoading(false);
      } finally {
        isConnectingRef.current = false;
      }
    };

    connect();

    return () => {
      isCancelled = true; // cleanup 시 플래그 활성화
      disconnectStreaming();
    };
  }
// 🚨 가장 중요: 의존성 배열에서 avatarnum을 반드시 제거하세요!
}, [isOpen, unrealurl]);

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

  const sendMessage = async () => {
    const message = inputText.trim();
    if (!message || !psInstanceRef.current || isLoading) return;

    try {
      setIsLoading(true);
      setInputText("");
      let aiResponse = "";

      // 🚀 상태값(로컬 스토리지 기반)에서 프롬프트 세팅 꺼내오기
      const { mode, tags, manual } = promptSettings;

      let finalSystemPrompt = "당신은 KLEVER ONE의 전문적이고 친절한 AI 안내 에이전트입니다. 다음 규칙을 엄격히 준수하세요:\n";
      
      if (mode === 'tag' && tags.length > 0) {
        const rules = tags.map(tag => tagInstructions[tag]).filter(Boolean);
        if (rules.length > 0) {
          finalSystemPrompt += rules.map((rule, index) => `${index + 1}. ${rule}`).join("\n");
        } else {
          finalSystemPrompt = "당신은 KLEVER ONE의 친절한 AI 에이전트입니다.";
        }
      } else if (mode === 'manual' && manual.trim()) {
        finalSystemPrompt = manual;
      } else {
        finalSystemPrompt = "당신은 KLEVER ONE의 친절한 AI 에이전트입니다.";
      }

      if (llm === "gpt") {
        const gptApiKey = import.meta.env.VITE_OPENAI_API_KEY;
        
        if (assistantId) {
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

          await fetch(`https://api.openai.com/v1/threads/${currentThreadId}/messages`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${gptApiKey}`,
              "OpenAI-Beta": "assistants=v2"
            },
            body: JSON.stringify({ role: "user", content: message })
          });

          const runRes = await fetch(`https://api.openai.com/v1/threads/${currentThreadId}/runs`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${gptApiKey}`,
              "OpenAI-Beta": "assistants=v2"
            },
            body: JSON.stringify({ 
              assistant_id: assistantId,
              instructions: finalSystemPrompt
            })
          });
          const runData = await runRes.json();
          const runId = runData.id;

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

          if (runStatus === "completed") {
            const msgsRes = await fetch(`https://api.openai.com/v1/threads/${currentThreadId}/messages`, {
              headers: {
                "Authorization": `Bearer ${gptApiKey}`,
                "OpenAI-Beta": "assistants=v2"
              }
            });
            const msgsData = await msgsRes.json();
            
            const rawAnswer = msgsData.data[0]?.content[0]?.text?.value || "응답을 불러오지 못했습니다.";
            aiResponse = rawAnswer.replace(/【.*?】/g, ''); 
            console.log("aiResponse (GPT RAG): %s", aiResponse);
          } else {
            console.error(`GPT 실행 실패 상태: ${runStatus}`);
            aiResponse = "답변 생성 중 오류가 발생했습니다.";
          }

        } else {
          console.log("GPT 기본 모드로 답변을 생성합니다.");
          
          const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${gptApiKey}`
            },
            body: JSON.stringify({
              model: "gpt-4o",
              messages: [
                { role: "system", content: finalSystemPrompt },
                { role: "user", content: message }
              ]
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
        try {
          const apiKey = import.meta.env.VITE_GEMINAI_API_KEY; 
          const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=${apiKey}`;

          let parts: any[] = [{ text: message }];

          if (assistantId) {
            try {
              const geminiFiles = JSON.parse(assistantId);
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
              console.log("Gemini 파일 파싱 오류, 기본 모드로 전환");
            }
          }

          const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              systemInstruction: { 
                parts: [{ text: finalSystemPrompt }]
              },
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

      if (aiResponse) {
        console.log("Message : %s", aiResponse);
        psInstanceRef.current.emitUIInteraction({
          Category: "VoiceSetting",
          Type: "Script",
          Value: encodeURIComponent(aiResponse), 
        });
      }

    } catch (error) {
      console.error("LLM 전체 로직 에러:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyEvent = (e: React.KeyboardEvent<HTMLInputElement>) => {
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
              onChange={(e) => setInputText(e.target.value)}
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
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
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
}