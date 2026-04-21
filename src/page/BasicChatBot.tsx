import React, { useState, useEffect, useRef } from "react";
import { Config, PixelStreaming } from "@epicgames-ps/lib-pixelstreamingfrontend-ue5.4";
import { GoogleGenerativeAI } from '@google/generative-ai';
import "../css/FloatingWidget.css";

// 🚀 [핵심] MCP 도구를 사용하기 위한 함수들 임포트
import { buildOpenAITools, buildGeminiTools, executeMcpTool } from "../utils/adminUtils";

interface BasicChatbotProps {
  unrealurl: string;
  layout: string;
  avatarnum: number;
  llm: string; // "gpt" 또는 "gemini"
  assistantId?: string;
  agentName?: string;
  promptMode?: string;
  promptTags?: string[];
  promptManual?: string;
}

// 채팅 내역 저장을 위한 타입 선언
interface ChatMessage {
  role: "user" | "ai";
  text: string;
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
  agentName = "",
  promptMode = "tag",
  promptTags = [],
  promptManual = "" 
}: BasicChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isRendered, setIsRendered] = useState(false); 
  const [size, setSize] = useState({ width: 360, height: 300 }); 
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false); 
  const [isThinking, setIsThinking] = useState(false); 
  const [isMicOn, setIsMicOn] = useState(false);
  const [isResizing, setIsResizing] = useState(false); 

  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const historyEndRef = useRef<HTMLDivElement | null>(null);

  const videoWrapperRef = useRef<HTMLDivElement | null>(null);
  const psInstanceRef = useRef<PixelStreaming | null>(null);
  const [threadId, setThreadId] = useState<string | null>(null);

  useEffect(() => {
    if (isHistoryOpen && historyEndRef.current) {
      historyEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistory, isHistoryOpen]);

  const handleResize = (mouseDownEvent: React.MouseEvent) => {
    mouseDownEvent.preventDefault();
    setIsResizing(true); 

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
      setIsResizing(false); 
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
    setIsRendered(true); 
    setTimeout(() => setIsOpen(true), 10);
  };

  const closeWidget = () => {
    disconnectStreaming();
    setIsMicOn(false);
    setIsOpen(false); 
    setIsHistoryOpen(false); 

    setTimeout(() => setIsRendered(false), 400); 
  };

  useEffect(() => {
    if (isOpen && !psInstanceRef.current && videoWrapperRef.current) {
      const connect = async () => {
        try {
          const matchmakerUrl = unrealurl.replace("https://", "http://");
          const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws'; 
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
              "Value": String(avatarnum) 
            });
            psInstance.emitUIInteraction({
              "Category": "VoiceSetting",
              "Type": "Voice",
              "Value": "FU_kangil" 
            });
            if(avatarnum == 2){
                psInstance.emitUIInteraction({
                        Category: "VoiceSetting",
                        Type: "Voice",
                        Value: "FU_moonjung"
                      });
              }
              else{
                psInstance.emitUIInteraction({
                        Category: "VoiceSetting",
                        Type: "Voice",
                        Value: "FU_kangil"
                      });
              }
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
  }, [isOpen, unrealurl]); 

  useEffect(() => {
    if (psInstanceRef.current && isOpen) {
      psInstanceRef.current.emitUIInteraction({
        Category: "AvatarSetting",
        Type: "AvatarNum",
        Value: String(avatarnum)
      });

      if(avatarnum == 2){
        psInstanceRef.current.emitUIInteraction({
                Category: "VoiceSetting",
                Type: "Voice",
                Value: "FU_moonjung"
              });
      }
      else{
        psInstanceRef.current.emitUIInteraction({
                Category: "VoiceSetting",
                Type: "Voice",
                Value: "FU_kangil"
              });
      }
      
    }
  }, [avatarnum, isOpen]); 

  // ==========================================
  // 🚀 메시지 전송 로직 (RAG + MCP 완벽 통합)
  // ==========================================
  const sendMessage = async () => {
    const message = inputText.trim();
    if (!message || !psInstanceRef.current || isLoading || isThinking) return;

    try {
      setIsThinking(true); 
      setInputText("");

      setChatHistory(prev => [...prev, { role: "user", text: message }]);

      const widgetConfig = JSON.parse(localStorage.getItem("klever_widget_config") || "{}");
      const mcpList = widgetConfig.mcpList || [];

      let aiResponse = "";
      let finalSystemPrompt = ""; 
      
      if (promptMode === 'tag' && promptTags.length > 0) {
        const rules = promptTags.map(tag => {
          if (tagInstructions[tag]) return tagInstructions[tag];
          else if (!tag.startsWith("custom_")) return tag;
          return null;
        }).filter(Boolean);

        if (rules.length > 0) {
          finalSystemPrompt = rules.map((rule, index) => `${index + 1}. ${rule}`).join("\n");
        }
      } else if (promptMode === 'manual' && promptManual.trim()) {
        finalSystemPrompt = promptManual;
      }

      // ==========================================
      // 🟢 OpenAI (GPT) 엔진 처리
      // ==========================================
      if (llm === "gpt") {
        const gptApiKey = import.meta.env.VITE_OPENAI_API_KEY;
        const openAITools = buildOpenAITools(mcpList); 
        
        if (assistantId) {
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

          const runBody: any = { assistant_id: assistantId };
          const RAG_ENFORCEMENT_PROMPT = "CRITICAL INSTRUCTION: You MUST use the `file_search` tool to search your attached knowledge base files. Also, if the user asks for real-time or external data, use the provided custom functions (MCP tools).";

          if (finalSystemPrompt) {
            runBody.instructions = finalSystemPrompt + "\n\n" + RAG_ENFORCEMENT_PROMPT;
          } else {
            runBody.instructions = RAG_ENFORCEMENT_PROMPT;
          }

          const toolsArray: any[] = [{ type: "file_search" }];
          if (openAITools) {
             toolsArray.push(...openAITools);
          }
          runBody.tools = toolsArray;

          const runRes = await fetch(`https://api.openai.com/v1/threads/${currentThreadId}/runs`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${gptApiKey}`,
              "OpenAI-Beta": "assistants=v2"
            },
            body: JSON.stringify(runBody)
          });
          const runData = await runRes.json();
          const runId = runData.id;

          let runStatus = runData.status;
          
          while (runStatus === "queued" || runStatus === "in_progress" || runStatus === "requires_action") {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            const checkRes = await fetch(`https://api.openai.com/v1/threads/${currentThreadId}/runs/${runId}`, {
              headers: {
                "Authorization": `Bearer ${gptApiKey}`,
                "OpenAI-Beta": "assistants=v2"
              }
            });
            const checkData = await checkRes.json();
            runStatus = checkData.status;

            if (runStatus === "requires_action") {
              const toolCalls = checkData.required_action.submit_tool_outputs.tool_calls;
              const toolOutputs = [];

              for (const toolCall of toolCalls) {
                const args = JSON.parse(toolCall.function.arguments);
                const result = await executeMcpTool(toolCall.function.name, args, mcpList);
                toolOutputs.push({ tool_call_id: toolCall.id, output: result });
              }

              await fetch(`https://api.openai.com/v1/threads/${currentThreadId}/runs/${runId}/submit_tool_outputs`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${gptApiKey}`,
                  "OpenAI-Beta": "assistants=v2"
                },
                body: JSON.stringify({ tool_outputs: toolOutputs })
              });
              runStatus = "in_progress"; 
            }
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
          } else {
            aiResponse = "답변 생성 중 오류가 발생했습니다.";
          }

        } else {
          // [일반 Chat Completions API 로직 - RAG 없을 때]
          let messagesPayload = [];
          if (finalSystemPrompt) {
            messagesPayload.push({ role: "system", content: finalSystemPrompt });
          }
          messagesPayload.push({ role: "user", content: message });

          const fetchChat = async (msgs) => {
            const bodyPayload: any = { model: "gpt-4o", messages: msgs };
            if (openAITools) bodyPayload.tools = openAITools;

            const response = await fetch("https://api.openai.com/v1/chat/completions", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${gptApiKey}`
              },
              body: JSON.stringify(bodyPayload)
            });
            return await response.json();
          };

          let data = await fetchChat(messagesPayload);
          let responseMsg = data.choices[0]?.message;

          if (responseMsg?.tool_calls) {
             messagesPayload.push(responseMsg);
             
             for (const toolCall of responseMsg.tool_calls) {
                const args = JSON.parse(toolCall.function.arguments);
                const result = await executeMcpTool(toolCall.function.name, args, mcpList);
                messagesPayload.push({ 
                  role: "tool", 
                  tool_call_id: toolCall.id, 
                  name: toolCall.function.name, 
                  content: result 
                });
             }
             data = await fetchChat(messagesPayload);
             aiResponse = data.choices[0]?.message?.content;
          } else {
             aiResponse = responseMsg?.content;
          }
        }

      // ==========================================
      // 🟡 Google Gemini 엔진 처리 (🚀 완벽 픽스 버전)
      // ==========================================
      } else {
        try {
          const apiKey = import.meta.env.VITE_GEMINAI_API_KEY; 
          const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=${apiKey}`;

          let parts: any[] = [{ text: message }];
          const geminiTools = buildGeminiTools(mcpList); 

          if (assistantId) {
            try {
              const geminiFiles = JSON.parse(assistantId);
              geminiFiles.forEach((file: any) => {
                parts.unshift({
                  fileData: { mimeType: file.mimeType, fileUri: file.uri }
                });
              });
            } catch (e) {
              console.log("Gemini 파일 파싱 오류");
            }
          }

          const geminiBody: any = {
            contents: [{ role: "user", parts: parts }]
          };

          if (finalSystemPrompt) {
            geminiBody.systemInstruction = { parts: [{ text: finalSystemPrompt }] };
          }
          if (geminiTools) {
            geminiBody.tools = geminiTools; 
          }

          // 🚀 제미나이 전용 에러 캐칭 fetch 함수
          const fetchGemini = async (bodyPayload) => {
            const response = await fetch(url, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(bodyPayload)
            });
            const json = await response.json();
            if (json.error) {
              console.error("[제미나이 API 에러 로그]", json.error);
              throw new Error(json.error.message);
            }
            return json;
          };

          let data = await fetchGemini(geminiBody);
          const firstPart = data.candidates?.[0]?.content?.parts?.[0];

          // 🚀 제미나이가 도구를 사용하겠다고 요청했을 때
          if (firstPart && firstPart.functionCall) {
            const funcCall = firstPart.functionCall;
            const result = await executeMcpTool(funcCall.name, funcCall.args, mcpList);

            // 1. 실행 결과를 안전한 JSON Object로 변환
            let parsedResult;
            try {
              parsedResult = JSON.parse(result);
            } catch(e) {
              parsedResult = { raw_data: String(result) }; // 텍스트 반환 시 안전 포장
            }

            // 2. 모델의 이전 요청 기록을 다시 배열에 밀어넣음
            const modelContent = data.candidates[0].content;
            modelContent.role = "model"; // 제미나이 3.1 버그 대응 (가끔 role 누락됨)
            geminiBody.contents.push(modelContent);

            // 3. API 실행 결과를 제미나이가 원하는 까다로운 규격에 맞게 조립
            const functionResponseData: any = {
              name: funcCall.name,
              response: parsedResult
            };
            if (funcCall.id) functionResponseData.id = funcCall.id; // 제미나이 3.1 규격 추가

            // 4. 결과 제출
            geminiBody.contents.push({
              role: "user",
              parts: [{ functionResponse: functionResponseData }]
            });

            // 5. 최종 답변 생성
            const data2 = await fetchGemini(geminiBody);
            aiResponse = data2.candidates?.[0]?.content?.parts?.[0]?.text || "응답을 생성하지 못했습니다.";
          } else {
            aiResponse = firstPart?.text || "응답 생성에 실패했습니다.";
          }

        } catch (error) {
          console.error("Gemini 통신 중 에러 발생:", error);
          aiResponse = "Gemini 연결 및 도구 실행 중 오류가 발생했습니다.";
        }
      }

      if (aiResponse) {
        setChatHistory(prev => [...prev, { role: "ai", text: aiResponse }]);

        const isRagUsed = !!assistantId;
        console.log(`[🤖 AI 응답 로그] 
  - 사용 모델: ${llm.toUpperCase()}
  - RAG(문서) 사용 유무: ${isRagUsed ? "O" : "X"}
  - 응답 내용: ${aiResponse}`);

        psInstanceRef.current.emitUIInteraction({
          Category: "VoiceSetting",
          Type: "Script",
          Value: encodeURIComponent(aiResponse), 
        });
      }

    } catch (error) {
      console.error("LLM 전체 로직 에러:", error);
    } finally {
      setIsThinking(false); 
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
    return (
      <button
        className="fw-header-btn"
        style={{ right: '14px' }}
        onClick={(e) => {
          e.stopPropagation();
          closeWidget();
        }}
        title="위젯 닫기"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    );
  };

  const HistoryButton = () => {
    return (
      <button
        className={`fw-header-btn ${isHistoryOpen ? 'active' : ''}`}
        style={{ left: '14px' }} 
        onClick={(e) => {
          e.stopPropagation();
          setIsHistoryOpen(!isHistoryOpen);
        }}
        title="대화 내역 보기"
      >
        {isHistoryOpen ? (
          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
             <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        )}
      </button>
    );
  };

  return (
    <>
      <div id="fw-app-root">
        
        {isResizing && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999999, cursor: 'pointer' }} />
        )}

        <div className={`fw-widget ${layout} ${isOpen ? "open" : "closed"}`}
          style={{ 
            width: `${size.width}px`, 
            height: `${size.height}px`,
            userSelect: isResizing ? 'none' : 'auto',
            display: isRendered ? 'flex' : 'none',
            transition: isResizing ? 'none' : '' 
          }}
        >
          {isLoading && (
            <div className="fw-loading-overlay">
              <div className="loading-spinner" />
              <span>연결 중...</span>
            </div>
          )}

          <div 
            ref={videoWrapperRef} 
            className="fw-video-wrapper" 
            style={{ pointerEvents: isResizing ? 'none' : 'auto' }}
          />
          
          {isOpen && (
            <>
              <CloseButton />
              <HistoryButton />
            </>
          )}

          {isOpen && isHistoryOpen && (
            <div className="fw-chat-history">
              {chatHistory.length === 0 ? (
                <div className="fw-chat-empty">아직 대화 내역이 없습니다.</div>
              ) : (
                chatHistory.map((msg, idx) => (
                  <div key={idx} className={`fw-chat-bubble ${msg.role}`}>
                    {msg.text}
                  </div>
                ))
              )}
              <div ref={historyEndRef} />
            </div>
          )}

          <ResizeHandle />
          
          <div className="fw-input-bar">
            <input
              type="text"
              className="fw-input"
              value={inputText}
              onFocus={handleInputFocus}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyEvent}
              placeholder={isThinking ? "답변을 생성하고 있습니다..." : "메시지 입력..."}
              disabled={isLoading || isThinking}
            />

            <button
              type="button"
              className={`mic-btn ${isMicOn ? "active" : ""}`}
              onClick={toggleMic}
              disabled={isLoading || isThinking}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: "20px" }}>
                <path d="M12 14a3 3 0 003-3V7a3 3 0 10-6 0v4a3 3 0 003 3zm5-3a1 1 0 10-2 0 3 3 0 11-6 0 1 1 0 10-2 0 5 5 0 004 4.9V19H9a1 1 0 100 2h6a1 1 0 100-2h-2v-2.1A5 5 0 0017 11z" />
              </svg>
            </button>

            <button onClick={sendMessage} className="send-btn" disabled={isLoading || isThinking || !inputText.trim()}>
              {isThinking ? (
                 <div style={{ 
                   width: '18px', 
                   height: '18px', 
                   border: '2px solid rgba(255,255,255,0.3)', 
                   borderTop: '2px solid white', 
                   borderRadius: '50%', 
                   animation: 'fw-spin 1s linear infinite' 
                 }} />
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                  <line x1="12" y1="19" x2="12" y2="5"></line>
                  <polyline points="5 12 12 5 19 12"></polyline>
                </svg>
              )}
            </button>
          </div>
        </div>

        <button 
          type="button" 
          className={`fw-toggle ${layout} ${isOpen ? 'hidden' : ''}`} 
          onClick={openWidget}
          style={{ display: isRendered && isOpen ? 'none' : 'flex' }} 
        >
          <svg viewBox="0 0 24 24" width="30" height="30" fill="white">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
          </svg>
        </button>
      </div>
    </>
  );
}