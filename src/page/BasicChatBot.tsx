import React, { useState, useEffect, useRef } from "react";
import { Config, PixelStreaming } from "@epicgames-ps/lib-pixelstreamingfrontend-ue5.4";
import "../css/FloatingWidget.css";

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
  mcpList?: any[]; // ✅ 추가
}

interface ChatMessage {
  role: "user" | "ai";
  text: string;
}

// 멀티턴용 LLM 메시지 히스토리 타입
interface LlmMessage {
  role: "system" | "user" | "assistant";
  content: string;
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
  promptManual = "",
  mcpList = [], // ✅ 추가
}: BasicChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isRendered, setIsRendered] = useState(false);
  const [size, setSize] = useState({ width: 360, height: 300 });
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  const [isPsConnected, setIsPsConnected] = useState(false);
  const [isPsFailed, setIsPsFailed] = useState(false);
  const greetingPlayedRef = useRef(false);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const historyEndRef = useRef<HTMLDivElement | null>(null);

  // ✅ 멀티턴 대화 히스토리 (LLM에 전달되는 실제 messages 배열)
  const llmHistoryRef = useRef<LlmMessage[]>([]);

  const videoWrapperRef = useRef<HTMLDivElement | null>(null);
  const psInstanceRef = useRef<PixelStreaming | null>(null);
  const threadIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (isHistoryOpen && historyEndRef.current) {
      historyEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistory, isHistoryOpen]);

  useEffect(() => {
    const handleBeforeUnload = () => stopCurrentAudio();
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      stopCurrentAudio();
    };
  }, []);

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
    threadIdRef.current = null;
    // ✅ 위젯 닫을 때 LLM 히스토리도 초기화
    llmHistoryRef.current = [];
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
          const protocol = 'ws';
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, speaker: speakerId, speed: 1.0, normalize: true })
      });
      if (!response.ok) throw new Error(`TTS API Error: ${response.status}`);
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
  // ✅ 시스템 프롬프트 빌더
  // ==========================================
  const buildSystemPrompt = (): string => {
    const widgetConfig = JSON.parse(localStorage.getItem("klever_widget_config") || "{}");
    const savedCustomTags = widgetConfig.customTags || [];

    const activePromptMode = promptMode || widgetConfig.promptMode || "tag";
    const activePromptTags = (promptTags && promptTags.length > 0) ? promptTags : (widgetConfig.promptTags || []);
    const activePromptManual = promptManual || widgetConfig.promptManual || "";

    if (activePromptMode === 'tag' && activePromptTags.length > 0) {
      const rules = activePromptTags.map((tag: string) => {
        if (tagInstructions[tag]) return tagInstructions[tag];
        if (tag.startsWith("custom_")) {
          const customMatch = savedCustomTags.find((t: any) => t.id === tag);
          return customMatch ? customMatch.label : null;
        }
        return tag;
      }).filter(Boolean);
      if (rules.length > 0) {
        return rules.map((rule: string, index: number) => `${index + 1}. ${rule}`).join("\n");
      }
    } else if (activePromptMode === 'manual' && activePromptManual.trim()) {
      return activePromptManual.trim();
    }
    return "";
  };

  // ==========================================
  // ✅ 진짜 MCP Tool Use 사이클 - GPT (non-Assistant)
  // ==========================================
  const runGptWithMcp = async (
    gptApiKey: string,
    messagesPayload: any[],
    activeMcpList: any[]
  ): Promise<string> => {
    const openAITools = buildOpenAITools(activeMcpList);
    const MAX_TOOL_ROUNDS = 5;
    let round = 0;

    while (round < MAX_TOOL_ROUNDS) {
      round++;
      const bodyPayload: any = { model: "gpt-4o", messages: messagesPayload };
      if (openAITools && openAITools.length > 0) {
        bodyPayload.tools = openAITools;
        bodyPayload.tool_choice = "auto";
      }

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${gptApiKey}` },
        body: JSON.stringify(bodyPayload)
      });
      const data = await response.json();
      const responseMsg = data.choices?.[0]?.message;
      if (!responseMsg) throw new Error("GPT 응답이 비어있습니다.");

      // tool_calls 없으면 최종 응답
      if (!responseMsg.tool_calls || responseMsg.tool_calls.length === 0) {
        return responseMsg.content || "";
      }

      // ✅ tool_calls 있으면: assistant 메시지 추가 후 도구 병렬 실행
      messagesPayload.push(responseMsg);

      const toolResults = await Promise.all(
        responseMsg.tool_calls.map(async (toolCall: any) => {
          let args = {};
          try { args = JSON.parse(toolCall.function.arguments || "{}"); } catch {}
          console.log(`[🔧 tool_use] LLM 선택 도구: ${toolCall.function.name}`, args);
          const result = await executeMcpTool(toolCall.function.name, args, activeMcpList);
          return {
            role: "tool",
            tool_call_id: toolCall.id,
            name: toolCall.function.name,
            content: String(result),
          };
        })
      );

      messagesPayload.push(...toolResults);
      // 다음 round에서 LLM이 tool 결과 보고 최종 응답 생성
    }

    throw new Error(`MCP Tool Use: 최대 반복 횟수(${MAX_TOOL_ROUNDS})를 초과했습니다.`);
  };

  // ==========================================
  // ✅ 진짜 MCP Tool Use 사이클 - Gemini
  // ==========================================
  const runGeminiWithMcp = async (
    apiKey: string,
    geminiContents: any[],
    systemPrompt: string,
    activeMcpList: any[]
  ): Promise<string> => {
    const geminiTools = buildGeminiTools(activeMcpList);
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    const MAX_TOOL_ROUNDS = 5;
    let round = 0;

    const callGemini = async (contents: any[]) => {
      const body: any = { contents };
      if (systemPrompt) body.systemInstruction = { parts: [{ text: systemPrompt }] };
      if (geminiTools && geminiTools.length > 0) body.tools = geminiTools;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error.message);
      return json;
    };

    while (round < MAX_TOOL_ROUNDS) {
      round++;
      const data = await callGemini(geminiContents);
      const parts = data.candidates?.[0]?.content?.parts || [];
      const functionCallParts = parts.filter((p: any) => p.functionCall);
      const textParts = parts.filter((p: any) => p.text);

      // functionCall 없으면 최종 응답
      if (functionCallParts.length === 0) {
        return textParts.map((p: any) => p.text).join("") || "";
      }

      // model 응답 전체를 contents에 추가
      geminiContents.push({ role: "model", parts });

      // 도구 병렬 실행
      const functionResponseParts = await Promise.all(
        functionCallParts.map(async (part: any) => {
          const { name, args } = part.functionCall;
          console.log(`[🔧 functionCall] LLM 선택 도구: ${name}`, args);
          const result = await executeMcpTool(name, args || {}, activeMcpList);
          let parsedResult: any;
          try { parsedResult = JSON.parse(result); } catch { parsedResult = { result }; }
          return { functionResponse: { name, response: parsedResult } };
        })
      );

      geminiContents.push({ role: "user", parts: functionResponseParts });
    }

    throw new Error(`MCP Tool Use: 최대 반복 횟수(${MAX_TOOL_ROUNDS})를 초과했습니다.`);
  };

  // ==========================================
  // ✅ 메시지 전송 로직 (멀티턴 + 진짜 MCP 사이클)
  // ==========================================
  const sendMessage = async () => {
    const message = inputText.trim();
    if (!message || isLoading || isThinking) return;

    try {
      setIsThinking(true);
      setInputText("");
      setChatHistory(prev => [...prev, { role: "user", text: message }]);

      if (!isPsConnected && !isHistoryOpen) setIsHistoryOpen(true);

      // ✅ prop으로 받은 mcpList 우선 사용, 없으면 localStorage 폴백
      const widgetConfig = JSON.parse(localStorage.getItem("klever_widget_config") || "{}");
      const activeMcpList = (mcpList && mcpList.length > 0)
        ? mcpList.filter((m: any) => m.active)
        : (widgetConfig.mcpList || []).filter((m: any) => m.active);

      const now = new Date();
      const currentTimeStr = now.toLocaleString("ko-KR", { timeZone: "Asia/Seoul" });
      const timeContext = `\n[현재 시각: ${currentTimeStr}. 날짜 관련 질문은 이 시간을 기준으로 계산하세요.]`;
      const messageWithTime = `${message}${timeContext}`;

      const finalSystemPrompt = buildSystemPrompt();
      const currentLlm = responseLlm || "gpt";
      let aiResponse = "";

      // ==========================================
      // 🟢 GPT 처리
      // ==========================================
      if (currentLlm === "gpt") {
        const gptApiKey = import.meta.env.VITE_OPENAI_API_KEY;

        // ── Assistant API (RAG 포함) 경로 ──
        if (assistantId) {
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

          const userContent = finalSystemPrompt
            ? `${message}\n\n[System Directive: 반드시 아래 규칙 준수]\n${finalSystemPrompt}${timeContext}`
            : messageWithTime;

          await fetch(`https://api.openai.com/v1/threads/${currentThreadId}/messages`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${gptApiKey}`, "OpenAI-Beta": "assistants=v2" },
            body: JSON.stringify({ role: "user", content: userContent })
          });

          const openAITools = buildOpenAITools(activeMcpList);
          const toolsArray: any[] = [{ type: "file_search" }];
          if (openAITools) toolsArray.push(...openAITools);

          const runBody: any = {
            assistant_id: assistantId,
            tools: toolsArray,
            ...(finalSystemPrompt ? { additional_instructions: "Strictly follow the System Directive in the user's message." } : {})
          };

          const runRes = await fetch(`https://api.openai.com/v1/threads/${currentThreadId}/runs`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${gptApiKey}`, "OpenAI-Beta": "assistants=v2" },
            body: JSON.stringify(runBody)
          });
          const runData = await runRes.json();
          const runId = runData.id;
          let runStatus = runData.status;

          // ✅ Assistant API의 tool_use 사이클 (requires_action 처리)
          while (runStatus === "queued" || runStatus === "in_progress" || runStatus === "requires_action") {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            const checkRes = await fetch(`https://api.openai.com/v1/threads/${currentThreadId}/runs/${runId}`, {
              headers: { "Authorization": `Bearer ${gptApiKey}`, "OpenAI-Beta": "assistants=v2" }
            });
            const checkData = await checkRes.json();
            runStatus = checkData.status;

            if (runStatus === "requires_action") {
              const toolCalls = checkData.required_action.submit_tool_outputs.tool_calls;
              const toolOutputs = await Promise.all(
                toolCalls.map(async (toolCall: any) => {
                  let args = {};
                  try { args = JSON.parse(toolCall.function.arguments); } catch {}
                  console.log(`[🔧 Assistant tool_use] ${toolCall.function.name}`, args);
                  const result = await executeMcpTool(toolCall.function.name, args, activeMcpList);
                  return { tool_call_id: toolCall.id, output: String(result) };
                })
              );

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
          // ── 일반 Chat Completions 경로 (멀티턴) ──
          // ✅ 첫 메시지에만 system prompt 추가, 이후엔 히스토리 누적
          if (llmHistoryRef.current.length === 0 && finalSystemPrompt) {
            llmHistoryRef.current.push({ role: "system", content: finalSystemPrompt });
          }
          llmHistoryRef.current.push({ role: "user", content: messageWithTime });

          // runGptWithMcp에 히스토리 복사본 전달 (tool 메시지 포함 후 내부에서 수정됨)
          const messagesForThisTurn = [...llmHistoryRef.current];
          aiResponse = await runGptWithMcp(gptApiKey, messagesForThisTurn, activeMcpList);

          // ✅ 최종 assistant 응답을 히스토리에 추가 (tool 메시지 제외, 최종 텍스트만)
          llmHistoryRef.current.push({ role: "assistant", content: aiResponse });
        }

      // ==========================================
      // 🟡 Gemini 처리
      // ==========================================
      } else {
        try {
          const apiKey = import.meta.env.VITE_GEMINAI_API_KEY;

          // ✅ Gemini 멀티턴: contents 배열에 대화 히스토리 누적
          // llmHistoryRef를 Gemini 형식으로 변환
          const geminiContents: any[] = llmHistoryRef.current
            .filter((m) => m.role !== "system")
            .map((m) => ({
              role: m.role === "assistant" ? "model" : "user",
              parts: [{ text: m.content }]
            }));

          // RAG 파일 첨부 (첫 메시지에만)
          const userParts: any[] = [{ text: messageWithTime }];
          if (assistantId && geminiContents.length === 0) {
            try {
              const geminiFiles = JSON.parse(assistantId);
              geminiFiles.forEach((file: any) => {
                userParts.unshift({ fileData: { mimeType: file.mimeType, fileUri: file.uri } });
              });
            } catch {
              // 일반 ID 형식이면 무시
            }
          }

          geminiContents.push({ role: "user", parts: userParts });

          aiResponse = await runGeminiWithMcp(apiKey, geminiContents, finalSystemPrompt, activeMcpList);

          // ✅ 히스토리 업데이트
          llmHistoryRef.current.push({ role: "user", content: messageWithTime });
          llmHistoryRef.current.push({ role: "assistant", content: aiResponse });

        } catch (error) {
          console.error("Gemini 통신 중 에러:", error);
          aiResponse = "Gemini 연결 중 오류가 발생했습니다.";
        }
      }

      if (aiResponse) {
        setChatHistory(prev => [...prev, { role: "ai", text: aiResponse }]);

        console.log(`\n[🤖 KLEVER ONE 파이프라인]
===========================================
👂 분석 엔진  : ${analysisLlm || "설정 안됨"}
🧠 RAG 엔진   : ${assistantId ? (ragLlm || "설정 안됨") : "미사용"}
🔧 활성 MCP   : ${activeMcpList.map((m: any) => m.name).join(", ") || "없음"}
🗣️ 응답 엔진  : ${responseLlm || "gpt"}
===========================================
📝 사용자: ${message}
💬 AI: ${aiResponse}\n`);

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
          if (isHistoryOpen) setIsHistoryOpen(false);
          else closeWidget();
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