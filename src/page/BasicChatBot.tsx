import React, { useState, useEffect, useRef } from "react";
import { Config, PixelStreaming } from "@epicgames-ps/lib-pixelstreamingfrontend-ue5.4";
import "../css/FloatingWidget.css";

// 🚀 [핵심] MCP 도구를 사용하기 위한 함수들 임포트
import { buildOpenAITools, buildGeminiTools, executeMcpTool } from "../utils/adminUtils";

interface BasicChatbotProps {
  unrealurl: string;
  layout: string;
  autoOff?: number;
  avatarnum: number;
  analysisLlm?: string;
  ragLlm?: string;
  responseLlm: string;
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
  "no_competitors": "타사나경쟁사에 대한 언급은 피하고, 우리 서비스에 집중하세요.",
  "no_personal_info": "사용자의 개인정보를 요구하거나 저장하지 마세요.",
  "polite_tone": "항상 정중하고 예의 바른 존댓말로 답변하세요.",
  "require_citation": "사실 기반의 정보를 제공할 때는 가능한 한 출처나 근거를 함께 언급하세요.",
  "empathy_first": "답변 시작 시 먼저 사용자의 감정이나 상황에 공감하는 문장을 한 줄 넣어주세요."
};

export function BasicChatbot({
  unrealurl,
  layout,
  autoOff,
  avatarnum,
  analysisLlm,
  ragLlm,
  responseLlm,
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

  // ✅ 픽셀스트리밍 연결 상태 추적
  const [isPsConnected, setIsPsConnected] = useState(false);

  // ✅ 픽셀스트리밍 연결 실패(fallback) 상태
  const [isPsFailed, setIsPsFailed] = useState(false);

  // ✅ fallback 인사 중복 방지용 ref
  const greetingPlayedRef = useRef(false);

  // ✅ 현재 재생 중인 TTS Audio 인스턴스 추적 (정지 제어용)
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const historyEndRef = useRef<HTMLDivElement | null>(null);

  const videoWrapperRef = useRef<HTMLDivElement | null>(null);
  const psInstanceRef = useRef<PixelStreaming | null>(null);

  // ✅ [FIX #6] threadId를 ref로 관리하여 위젯 닫기/열기 시 초기화 가능하도록
  const threadIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (isHistoryOpen && historyEndRef.current) {
      historyEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistory, isHistoryOpen]);

  // ✅ 페이지 이탈(새로고침/탭 닫기/URL 이동) 시 TTS 정지
  useEffect(() => {
    const handleBeforeUnload = () => {
      stopCurrentAudio();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      stopCurrentAudio();
    };
  }, []);

  // ==========================================
  // ✅ 픽셀스트리밍 실패 시 AI 자동 인사
  // ==========================================
  useEffect(() => {
    if (isPsFailed && !greetingPlayedRef.current) {
      greetingPlayedRef.current = true;
      const greetingText = "안녕하세요. 무엇을 도와드릴까요?";
      setChatHistory([{ role: "ai", text: greetingText }]);
      playFallbackTTS(greetingText, avatarnum);
    }
  }, [isPsFailed]);

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
      cursor: isLeft ? (isTop ? 'sw-resize' : 'nw-resize') : (isTop ? 'se-resize' : 'nw-resize'),
      zIndex: 10005,
      padding: '4px'
    };

    let pathData = "M16,4 L8,4 Q4,4 4,8 L4,16";
    if (layout === "bottom-right" || layout === "center") pathData = "M16,4 L8,4 Q4,4 4,8 L4,16";
    else if (layout === "bottom-left") pathData = "M8,4 L16,4 Q20,4 20,8 L20,16";
    else if (layout === "top-right") pathData = "M16,20 L8,20 Q4,20 4,16 L4,8";
    else if (layout === "top-left") pathData = "M8,20 L16,20 Q20,20 20,16 L20,8";

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
    if (videoWrapperRef.current) videoWrapperRef.current.innerHTML = "";
    setIsLoading(false);
    setIsPsConnected(false);
  };

  const openWidget = () => {
    setIsLoading(true);
    setIsRendered(true);
    greetingPlayedRef.current = chatHistory.length > 0;
    setIsPsFailed(false);
    setTimeout(() => setIsOpen(true), 10);
  };

  const closeWidget = () => {
    disconnectStreaming();
    stopCurrentAudio();
    // ✅ [FIX #6] 위젯 닫을 때 threadId 초기화 (다음 오픈 시 새 thread 시작)
    threadIdRef.current = null;
    setIsMicOn(false);
    setIsOpen(false);
    setIsHistoryOpen(false);
    setIsPsFailed(false);
    greetingPlayedRef.current = chatHistory.length > 0;
    setTimeout(() => setIsRendered(false), 400);
  };

  useEffect(() => {
    if (isOpen && !psInstanceRef.current && videoWrapperRef.current) {
      const connect = async () => {
        try {
          const matchmakerUrl = unrealurl.replace("https://", "http://");
          const protocol = window.location.protocol === 'https:' ? 'ws' : 'ws';
          const res = await fetch(`${matchmakerUrl}/signallingserver`);
          const data = await res.json();
          const ssUrl = `${protocol}://${data.signallingServer}`;
          const config = new Config({
            initialSettings: {
              ss: ssUrl, AutoPlayVideo: true, AutoConnect: true, HoveringMouse: true, KeyboardInput: false, MouseInput: false,
            },
          });

          const psInstance = new PixelStreaming(config);
          psInstanceRef.current = psInstance;

          psInstance.addEventListener("videoInitialized", () => {
            if (videoWrapperRef.current) {
              videoWrapperRef.current.innerHTML = "";
              videoWrapperRef.current.appendChild(psInstance.videoElementParent);
              setIsLoading(false);
              setIsPsConnected(true);
              setIsPsFailed(false);
            }
            psInstance.emitUIInteraction({ "Category": "SystemSetting", "Type": "WebConnected", "Width": "1280", "Height": "720" });
            psInstance.emitUIInteraction({ "Category": "AvatarSetting", "Type": "AvatarNum", "Value": String(avatarnum) });
            psInstance.emitUIInteraction({ "Category": "VoiceSetting", "Type": "Voice", "Value": avatarnum == 2 ? "FU_moonjung" : "FU_kangil" });
            psInstance.emitUIInteraction({ "Category": "PageSetting", "Type": "WindowSize" });
          });

          // ✅ 스트리밍 연결 해제 이벤트 감지
          psInstance.addEventListener("webRtcDisconnected", () => {
            setIsPsConnected(false);
            setIsPsFailed(true);
            setIsHistoryOpen(true);
          });

        } catch (err) {
          console.error("Matchmaker connection failed:", err);
          setIsLoading(false);
          setIsPsConnected(false);
          setIsPsFailed(true);
          setIsHistoryOpen(true);
        }
      };
      connect();
      return () => disconnectStreaming();
    }
  }, [isOpen, unrealurl, avatarnum]);

  useEffect(() => {
    if (psInstanceRef.current && isOpen && isPsConnected) {
      psInstanceRef.current.emitUIInteraction({ Category: "AvatarSetting", Type: "AvatarNum", Value: String(avatarnum) });
      psInstanceRef.current.emitUIInteraction({ Category: "VoiceSetting", Type: "Voice", Value: avatarnum == 2 ? "FU_moonjung" : "FU_kangil" });
    }
  }, [avatarnum, isOpen, isPsConnected]);

  // ==========================================
  // 🟢 웹에서 직접 TTS를 호출하는 함수 구현 (Fallback)
  // ==========================================

  const stopCurrentAudio = () => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      currentAudioRef.current = null;
    }
  };

  const playFallbackTTS = async (text: string, avatarNum: number) => {
    try {
      stopCurrentAudio();

      const speakerId = avatarNum === 2 ? "moonjung" : "kangil";
      const ttsUrl = import.meta.env.VITE_FUSION_TTS_URL || "/tts-proxy/tts";
      const response = await fetch(ttsUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: text,
          speaker: speakerId,
          speed: 1.0,
          normalize: true
        })
      });

      if (!response.ok) {
        throw new Error(`TTS API Error: ${response.status}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      currentAudioRef.current = audio;
      audio.play();

      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        currentAudioRef.current = null;
      };
    } catch (error) {
      console.error("Fallback TTS 재생 실패:", error);
    }
  };

  // ==========================================
  // 🚀 메시지 전송 로직
  // ==========================================
  const sendMessage = async () => {
    const message = inputText.trim();
    if (!message || isLoading || isThinking) return;

    try {
      setIsThinking(true);
      setInputText("");
      setChatHistory(prev => [...prev, { role: "user", text: message }]);

      if (!isPsConnected && !isHistoryOpen) {
        setIsHistoryOpen(true);
      }

      const widgetConfig = JSON.parse(localStorage.getItem("klever_widget_config") || "{}");
      const mcpList = widgetConfig.mcpList || [];
      const savedCustomTags = widgetConfig.customTags || [];

      let aiResponse = "";

      const activePromptMode = promptMode || widgetConfig.promptMode || "tag";
      const activePromptTags = (promptTags && promptTags.length > 0) ? promptTags : (widgetConfig.promptTags || []);
      const activePromptManual = promptManual || widgetConfig.promptManual || "";

      let finalSystemPrompt = "";

      if (activePromptMode === 'tag' && activePromptTags.length > 0) {
        const rules = activePromptTags.map((tag: string) => {
          if (tagInstructions[tag]) return tagInstructions[tag];
          else if (tag.startsWith("custom_")) {
            const customMatch = savedCustomTags.find((t: any) => t.id === tag);
            return customMatch ? customMatch.label : null;
          }
          else return tag;
        }).filter(Boolean);

        if (rules.length > 0) {
          finalSystemPrompt = rules.map((rule: string, index: number) => `${index + 1}. ${rule}`).join("\n");
        }
      } else if (activePromptMode === 'manual' && activePromptManual.trim()) {
        finalSystemPrompt = activePromptManual.trim();
      }

      const now = new Date();
      const currentTimeStr = now.toLocaleString("ko-KR", { timeZone: "Asia/Seoul" });
      const timeContext = `\n[System Note: 현재 현실 세계의 시각은 ${currentTimeStr} 입니다. 사용자가 '오늘', '내일', '이번 주' 등의 시간을 말하면 반드시 이 시간을 기준으로 실제 날짜를 계산해서 구글 캘린더나 도구에 전달하세요.]`;

      // ✅ [FIX #3] GPT non-assistant 경로: system 프롬프트는 system role에만 넣고,
      //    user 메시지에는 원본 메시지 + 시간 컨텍스트만 추가 (이중 삽입 제거)
      const USER_MESSAGE_WITH_TIME = `${message}${timeContext}`;

      // Assistant API 경로에서만 user 메시지에 시스템 지침 포함 (system role 없으므로)
      const ENFORCED_USER_MESSAGE_FOR_ASSISTANT = finalSystemPrompt
        ? `${message}\n\n================\n[System Directive for AI: 반드시 아래의 페르소나 및 규칙을 엄격하게 적용하여 답변할 것.]\n${finalSystemPrompt}${timeContext}`
        : USER_MESSAGE_WITH_TIME;

      const TOOL_REMINDER_MESSAGE = finalSystemPrompt
        ? `[System Reminder: 방금 제공된 검색 결과나 도구 데이터를 바탕으로 답변하되, 반드시 처음에 지시받은 페르소나와 규칙(존댓말 등)을 유지하여 자연스럽게 답변하세요.]`
        : "";

      const currentLlm = responseLlm || "gpt";

      // ==========================================
      // 🟢 OpenAI (GPT) 엔진 처리
      // ==========================================
      if (currentLlm === "gpt") {
        const gptApiKey = import.meta.env.VITE_OPENAI_API_KEY;
        const openAITools = buildOpenAITools(mcpList);

        if (assistantId) {
          // ✅ [FIX #6] ref 기반 threadId 사용
          let currentThreadId = threadIdRef.current;
          if (!currentThreadId) {
            const threadRes = await fetch("https://api.openai.com/v1/threads", {
              method: "POST",
              headers: { "Content-Type": "application/json", "Authorization": `Bearer ${gptApiKey}`, "OpenAI-Beta": "assistants=v2" }
            });
            const threadData = await threadRes.json();
            currentThreadId = threadData.id;
            threadIdRef.current = currentThreadId;
          }

          await fetch(`https://api.openai.com/v1/threads/${currentThreadId}/messages`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${gptApiKey}`, "OpenAI-Beta": "assistants=v2" },
            body: JSON.stringify({ role: "user", content: ENFORCED_USER_MESSAGE_FOR_ASSISTANT })
          });

          const runBody: any = { assistant_id: assistantId };

          if (finalSystemPrompt) {
            runBody.additional_instructions = "Follow the System Directive embedded in the user's message strictly.";
          }

          const toolsArray: any[] = [{ type: "file_search" }];
          if (openAITools) toolsArray.push(...openAITools);
          runBody.tools = toolsArray;

          const runRes = await fetch(`https://api.openai.com/v1/threads/${currentThreadId}/runs`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${gptApiKey}`, "OpenAI-Beta": "assistants=v2" },
            body: JSON.stringify(runBody)
          });
          const runData = await runRes.json();
          const runId = runData.id;
          let runStatus = runData.status;

          while (runStatus === "queued" || runStatus === "in_progress" || runStatus === "requires_action") {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            const checkRes = await fetch(`https://api.openai.com/v1/threads/${currentThreadId}/runs/${runId}`, {
              headers: { "Authorization": `Bearer ${gptApiKey}`, "OpenAI-Beta": "assistants=v2" }
            });
            const checkData = await checkRes.json();
            runStatus = checkData.status;

            if (runStatus === "requires_action") {
              const toolCalls = checkData.required_action.submit_tool_outputs.tool_calls;
              const toolOutputs = [];

              for (const toolCall of toolCalls) {
                const args = JSON.parse(toolCall.function.arguments);
                const result = await executeMcpTool(toolCall.function.name, args, mcpList);
                toolOutputs.push({ tool_call_id: toolCall.id, output: String(result) });
              }

              await fetch(`https://api.openai.com/v1/threads/${currentThreadId}/runs/${runId}/submit_tool_outputs`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${gptApiKey}`, "OpenAI-Beta": "assistants=v2" },
                body: JSON.stringify({ tool_outputs: toolOutputs })
              });
              runStatus = "in_progress";
            }
          }

          if (runStatus === "completed") {
            const msgsRes = await fetch(`https://api.openai.com/v1/threads/${currentThreadId}/messages`, {
              headers: { "Authorization": `Bearer ${gptApiKey}`, "OpenAI-Beta": "assistants=v2" }
            });
            const msgsData = await msgsRes.json();
            const rawAnswer = msgsData.data?.[0]?.content?.[0]?.text?.value;
            aiResponse = rawAnswer ? rawAnswer.replace(/【.*?】/g, '') : "답변을 불러오지 못했습니다.";
          } else {
            aiResponse = "답변 생성 중 오류가 발생했습니다.";
          }

        } else {
          // ✅ [FIX #3] system role과 user 메시지 이중 삽입 제거
          //    system role에만 finalSystemPrompt 넣고, user 메시지에는 원본만
          let messagesPayload: any[] = [];
          if (finalSystemPrompt) {
            messagesPayload.push({ role: "system", content: finalSystemPrompt });
          }
          messagesPayload.push({ role: "user", content: USER_MESSAGE_WITH_TIME });

          const fetchChat = async (msgs: any) => {
            const bodyPayload: any = { model: "gpt-4o", messages: msgs };
            if (openAITools) bodyPayload.tools = openAITools;

            const response = await fetch("https://api.openai.com/v1/chat/completions", {
              method: "POST",
              headers: { "Content-Type": "application/json", "Authorization": `Bearer ${gptApiKey}` },
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
                content: String(result)
              });
            }

            if (TOOL_REMINDER_MESSAGE) {
              messagesPayload.push({ role: "user", content: TOOL_REMINDER_MESSAGE });
            }

            data = await fetchChat(messagesPayload);
            aiResponse = data.choices[0]?.message?.content || "응답을 생성하지 못했습니다.";
          } else {
            aiResponse = responseMsg?.content || "응답을 생성하지 못했습니다.";
          }
        }

      // ==========================================
      // 🟡 Google Gemini 엔진 처리
      // ==========================================
      } else {
        try {
          const apiKey = import.meta.env.VITE_GEMINAI_API_KEY;
          // ✅ [FIX #1] 존재하는 올바른 Gemini 모델명으로 수정
          const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=${apiKey}`;

          // ✅ [FIX #3] Gemini도 system instruction과 user 메시지 분리
          //    user parts에는 원본 메시지만, system은 systemInstruction으로
          let parts: any[] = [{ text: USER_MESSAGE_WITH_TIME }];
          const geminiTools = buildGeminiTools(mcpList);

          if (assistantId) {
            try {
              const geminiFiles = JSON.parse(assistantId);
              geminiFiles.forEach((file: any) => {
                parts.unshift({ fileData: { mimeType: file.mimeType, fileUri: file.uri } });
              });
            } catch (e) {
              // assistantId가 JSON이 아닌 경우 (일반 문자열) 조용히 무시
              console.log("Gemini 파일 파싱 건너뜀 - 일반 ID 형식");
            }
          }

          const geminiBody: any = { contents: [{ role: "user", parts: parts }] };
          if (finalSystemPrompt) {
            geminiBody.systemInstruction = { parts: [{ text: finalSystemPrompt }] };
          }
          if (geminiTools) geminiBody.tools = geminiTools;

          const fetchGemini = async (bodyPayload: any) => {
            const response = await fetch(url, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(bodyPayload)
            });
            const json = await response.json();
            if (json.error) throw new Error(json.error.message);
            return json;
          };

          // ✅ [FIX #4] Gemini 다중 tool call 루프 처리
          let data = await fetchGemini(geminiBody);
          let loopCount = 0;
          const MAX_TOOL_LOOPS = 5; // 무한루프 방지

          while (loopCount < MAX_TOOL_LOOPS) {
            const firstPart = data.candidates?.[0]?.content?.parts?.[0];

            if (!firstPart || !firstPart.functionCall) {
              // tool call 없음 → 텍스트 응답
              aiResponse = firstPart?.text || "응답 생성에 실패했습니다.";
              break;
            }

            // tool call 처리
            const funcCall = firstPart.functionCall;
            const result = await executeMcpTool(funcCall.name, funcCall.args, mcpList);

            let parsedResult: any;
            try {
              parsedResult = JSON.parse(result);
            } catch (e) {
              parsedResult = { raw_data: String(result) };
            }

            const modelContent = data.candidates[0].content;
            modelContent.role = "model";
            geminiBody.contents.push(modelContent);

            const functionResponseData: any = { name: funcCall.name, response: parsedResult };
            if (funcCall.id) functionResponseData.id = funcCall.id;

            const userParts: any[] = [{ functionResponse: functionResponseData }];
            if (TOOL_REMINDER_MESSAGE && loopCount === 0) {
              // 첫 번째 tool 결과 전달 시에만 reminder 추가
              userParts.push({ text: TOOL_REMINDER_MESSAGE });
            }

            geminiBody.contents.push({ role: "user", parts: userParts });

            data = await fetchGemini(geminiBody);
            loopCount++;
          }

          if (loopCount >= MAX_TOOL_LOOPS) {
            // 최대 루프 초과 시 마지막 응답 사용
            aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "응답 생성에 실패했습니다.";
          }

        } catch (error) {
          console.error("Gemini 통신 중 에러 발생:", error);
          aiResponse = "Gemini 연결 및 도구 실행 중 오류가 발생했습니다.";
        }
      }

      if (aiResponse) {
        setChatHistory(prev => [...prev, { role: "ai", text: aiResponse }]);

        // ✅ [추가됨] 사용 엔진(LLM) 파이프라인 콘솔 로그 출력 (UI 표시 제거, 오직 콘솔에만 출력)
        const isRagUsed = !!assistantId;
        console.log(`\n[🤖 KLEVER ONE 에이전트 파이프라인 상태]
===========================================
👂 분석(듣기) 엔진  : ${analysisLlm || "설정 안됨"}
🧠 지식(RAG) 엔진   : ${isRagUsed ? (ragLlm || "설정 안됨") : "미사용"}
🗣️ 생성(말하기) 엔진: ${responseLlm || "gpt"}
===========================================
📝 사용자 입력 내용 : ${message}
💬 AI 응답 내용     : ${aiResponse}\n`);

        if (psInstanceRef.current && isPsConnected) {
          psInstanceRef.current.emitUIInteraction({
            Category: "VoiceSetting",
            Type: "Script",
            Value: encodeURIComponent(aiResponse),
          });
        } else {
          playFallbackTTS(aiResponse, avatarnum);
        }
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

  const toggleMic = () => setIsMicOn((v) => !v);

  const handleInputFocus = () => {
    if (psInstanceRef.current && isPsConnected) {
      psInstanceRef.current.emitUIInteraction({ Category: "Chat", Type: "Typing" });
    }
  };

  const CloseButton = () => (
    <button
      className="fw-header-btn"
      style={{ right: '14px' }}
      onClick={(e) => {
        e.stopPropagation();
        if (!isPsConnected) {
          closeWidget();
        } else {
          if (isHistoryOpen) {
            setIsHistoryOpen(false);
          } else {
            closeWidget();
          }
        }
      }}
      title={(!isPsConnected || !isHistoryOpen) ? "위젯 닫기" : "대화 내역 닫기"}
    >
      <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </button>
  );

  const HistoryButton = () => (
    <button
      className={`fw-header-btn ${isHistoryOpen ? 'active' : ''}`}
      style={{ left: '14px' }}
      onClick={(e) => { e.stopPropagation(); setIsHistoryOpen(!isHistoryOpen); }}
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

  return (
    <>
      <div id="fw-app-root">
        {isResizing && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999999, cursor: 'pointer' }} />
        )}

        <div
          className={`fw-widget ${layout} ${isOpen ? "open" : "closed"}`}
          style={{
            width: `${size.width}px`,
            height: `${size.height}px`,
            userSelect: isResizing ? 'none' : 'auto',
            display: isRendered ? 'flex' : 'none',
            transition: isResizing ? 'none' : '',
            backgroundColor: isPsFailed ? '#000000' : 'transparent',
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

          {isOpen && <><CloseButton /><HistoryButton /></>}

          {isOpen && isHistoryOpen && (
            <div className="fw-chat-history">
              {chatHistory.length === 0 ? (
                <div className="fw-chat-empty">아직 대화 내역이 없습니다.</div>
              ) : (
                chatHistory.map((msg, idx) => (
                  <div key={idx} className={`fw-chat-bubble ${msg.role}`}>{msg.text}</div>
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

            <button
              onClick={sendMessage}
              className="send-btn"
              disabled={isLoading || isThinking || !inputText.trim()}
            >
              {isThinking ? (
                <div style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', animation: 'fw-spin 1s linear infinite' }} />
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