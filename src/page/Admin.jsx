// Admin.jsx
import React, { useState, useEffect, useRef } from "react";
import { BasicChatbot } from "./BasicChatBot";
import { DigitalHuman } from "./DigitalHuman";
import "../css/Admin.css"; 

import { 
  loadSavedConfig, 
  syncTagsToStorage,
  syncMcpToStorage, 
  saveConfiguration, 
  processVectorIdFinish, 
  processKnowledgeUpload, 
  createBundle 
} from "../utils/adminUtils";

const i18n = {
  ko: {
    subTitle: "AI 디지털 휴먼 에이전트 설정",
    reset: "초기화",
    save: "변경사항 저장",
    tab1: "1. 에이전트 설정",
    tab2: "2. AI 연결",
    tab3: "3. 동작 설정",
    apiKeyTitle: "API 키 관리",
    apiKeyDesc: "여러 에이전트 연동을 위한 인증 키를 발급하고 관리하세요.",
    newKeyBtn: "+ 신규 키 발급",
    modelTitle: "디지털휴먼 모델 선택",
    modelDesc: "KLEVER ONE 디지털휴먼의 외형을 선택하세요.",
    studioBtn: "휴먼 생성 및 수정",
    agentSelectLabel: "설정할 에이전트(API 키) 선택",
    llmTitle: "인공지능(LLM) 엔진 연결",
    llmDesc: "에이전트의 두뇌 역할을 할 기본 언어 모델을 선택하세요.",
    ragTitle: "해당 엔진의 지식저장소 (RAG) 설정",
    ragDesc: "선택한 엔진이 답변 시 참고할 지식 기반(Knowledge Base)을 연결합니다.",
    mcpTitle: "MCP 기반 도구 연동",
    mcpDesc: "기본 제공 기능이나 커스텀 API 엔드포인트를 연결하여 에이전트의 기능을 확장하세요.",
    promptTitle: "에이전트 행동 지침 (프롬프팅)",
    promptDesc: "에이전트가 답변 시 지켜야 할 핵심 규칙이나 페르소나를 설정하세요.",
    layoutTitle: "화면 배치",
    layoutDesc: "사용자 웹사이트에서 에이전트가 표시될 위치를 선택하세요.",
    timeTitle: "시간 설정",
    timeDesc: "자동 꺼짐 시간 (미사용 시)",
    codeTitle: "웹사이트 삽입 코드",
    codeDesc: "사용하시는 환경에 맞는 코드를 복사하여 웹사이트에 붙여넣으세요.",
  },
  en: {
    subTitle: "Digital Human AI Agent Settings Environment",
    reset: "Reset",
    save: "Save Changes",
    tab1: "1. Agent Settings",
    tab2: "2. AI Connection",
    tab3: "3. Behavior Settings",
    apiKeyTitle: "API Key Management",
    apiKeyDesc: "Issue and manage authentication keys for multiple agents.",
    newKeyBtn: "+ Issue New Key",
    modelTitle: "Select Digital Human Model",
    modelDesc: "Choose the appearance of your KLEVER ONE digital human.",
    studioBtn: "Create & Edit Human",
    agentSelectLabel: "Select Agent (API Key)",
    llmTitle: "AI (LLM) Engine Connection",
    llmDesc: "Select the base language model to act as the agent's brain.",
    ragTitle: "Knowledge Base (RAG) Settings",
    ragDesc: "Connect the knowledge base the engine will refer to when answering.",
    mcpTitle: "MCP-based Tool Integration",
    mcpDesc: "Expand agent features by connecting built-in tools or custom API endpoints.",
    promptTitle: "Agent Behavior Guidelines (Prompting)",
    promptDesc: "Set core rules or a persona the agent must follow.",
    layoutTitle: "Screen Layout",
    layoutDesc: "Choose where the agent will be displayed on your website.",
    timeTitle: "Time Settings",
    timeDesc: "Auto-off time (when idle)",
    codeTitle: "Website Embed Code",
    codeDesc: "Copy and paste the appropriate code for your environment into your website.",
  },
  zh: {
    subTitle: "数字人 AI 代理设置环境",
    reset: "重置",
    save: "保存更改",
    tab1: "1. 代理设置",
    tab2: "2. AI 连接",
    tab3: "3. 行为设置",
    apiKeyTitle: "API 密钥管理",
    apiKeyDesc: "发布和管理多个代理的身份验证密钥。",
    newKeyBtn: "+ 颁发新密钥",
    modelTitle: "选择数字人模型",
    modelDesc: "选择 KLEVER ONE 数字人的外观。",
    studioBtn: "创建和编辑人类",
    agentSelectLabel: "选择代理 (API 密钥)",
    llmTitle: "AI (LLM) 引擎连接",
    llmDesc: "选择将充当代理大脑的基础语言模型。",
    ragTitle: "知识库 (RAG) 设置",
    ragDesc: "连接引擎在回答时将参考的知识库。",
    mcpTitle: "基于 MCP 的工具集成",
    mcpDesc: "通过连接内置工具或自定义 API 端点来扩展代理功能。",
    promptTitle: "代理行为准则 (提示)",
    promptDesc: "设置代理必须遵循的核心规则或角色。",
    layoutTitle: "屏幕布局",
    layoutDesc: "选择代理在您网站上显示的位置。",
    timeTitle: "时间设置",
    timeDesc: "自动关闭时间 (空闲时)",
    codeTitle: "网站嵌入代码",
    codeDesc: "将适合您环境的代码复制并粘贴到您的网站中。",
  },
  vi: {
    subTitle: "Môi trường Cài đặt Đại lý AI Người Kỹ thuật số",
    reset: "Đặt lại",
    save: "Lưu Thay đổi",
    tab1: "1. Cài đặt Đại lý",
    tab2: "2. Kết nối AI",
    tab3: "3. Cài đặt Hành vi",
    apiKeyTitle: "Quản lý Khóa API",
    apiKeyDesc: "Cấp và quản lý khóa xác thực cho nhiều đại lý.",
    newKeyBtn: "+ Cấp Khóa Mới",
    modelTitle: "Chọn Mô hình Người Kỹ thuật số",
    modelDesc: "Chọn ngoại hình cho người kỹ thuật số KLEVER ONE của bạn.",
    studioBtn: "Tạo & Chỉnh sửa Người",
    agentSelectLabel: "Chọn Đại lý (Khóa API)",
    llmTitle: "Kết nối Công cụ AI (LLM)",
    llmDesc: "Chọn mô hình ngôn ngữ cơ sở làm bộ não của đại lý.",
    ragTitle: "Cài đặt Cơ sở Kiến thức (RAG)",
    ragDesc: "Kết nối cơ sở kiến thức mà công cụ sẽ tham khảo khi trả lời.",
    mcpTitle: "Tích hợp Công cụ dựa trên MCP",
    mcpDesc: "Mở rộng tính năng đại lý bằng cách kết nối các công cụ tích hợp hoặc API tùy chỉnh.",
    promptTitle: "Nguyên tắc Hành vi của Đại lý (Nhắc nhở)",
    promptDesc: "Đặt các quy tắc cốt lõi hoặc tính cách mà đại lý phải tuân theo.",
    layoutTitle: "Bố cục Màn hình",
    layoutDesc: "Chọn vị trí hiển thị đại lý trên trang web của bạn.",
    timeTitle: "Cài đặt Thời gian",
    timeDesc: "Thời gian tự động tắt (khi rảnh rỗi)",
    codeTitle: "Mã Nhúng Trang Web",
    codeDesc: "Sao chép và dán mã thích hợp cho môi trường của bạn vào trang web.",
  },
  ja: {
    subTitle: "デジタルヒューマン AI エージェント設定環境",
    reset: "リセット",
    save: "変更を保存",
    tab1: "1. エージェント設定",
    tab2: "2. AI 接続",
    tab3: "3. 動作設定",
    apiKeyTitle: "API キー管理",
    apiKeyDesc: "複数のエージェントの認証キーを発行および管理します。",
    newKeyBtn: "+ 新しいキーを発行",
    modelTitle: "デジタルヒューマンモデルの選択",
    modelDesc: "KLEVER ONE デジタルヒューマンの外観を選択してください。",
    studioBtn: "ヒューマンの作成と編集",
    agentSelectLabel: "エージェント (API キー) の選択",
    llmTitle: "AI (LLM) エンジン接続",
    llmDesc: "エージェントの頭脳として機能する基本言語モデルを選択します。",
    ragTitle: "ナレッジベース (RAG) 設定",
    ragDesc: "回答時にエンジンが参照するナレッジベースを接続します。",
    mcpTitle: "MCP ベースのツール統合",
    mcpDesc: "組み込みツールまたはカスタム API エンドポイントを接続して、エージェント機能を拡張します。",
    promptTitle: "エージェントの行動ガイドライン (プロンプト)",
    promptDesc: "エージェントが従うべきコアルールまたはペルソナを設定します。",
    layoutTitle: "画面レイアウト",
    layoutDesc: "ウェブサイトでエージェントを表示する場所を選択します。",
    timeTitle: "時間設定",
    timeDesc: "自動オフ時間 (アイドル時)",
    codeTitle: "ウェブサイト埋め込みコード",
    codeDesc: "環境に適したコードをコピーしてウェブサイトに貼り付けます。",
  }
};

export default function Admin({ chatbotType }) {
  const [uiLang, setUiLang] = useState("ko");
  const [activeTab, setActiveTab] = useState("agent");
  const [isDarkMode, setIsDarkMode] = useState(true);

  // ── [1] 챗봇 자동 실행 ──
  useEffect(() => {
    const timer = setTimeout(() => {
      const toggleButton = document.querySelector(".fw-toggle");
      if (toggleButton) toggleButton.click();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // ── 에이전트 & 키 ──
  const [apiKeys, setApiKeys] = useState([
    {
      id: 1,
      name: "chilloen",
      value: "sk-live-a1b2c3d4e5f6g7h8i9j0",
      date: "2026-04-07",
      character: "chanu",
      voice: "",
      language: "ko",
      assistantId: "",
      promptMode: "tag",
      promptTags: ["no_politics", "no_religion", "no_social_controversy", "no_profanity", "polite_tone"],
      customTags: [],
      promptManual: "",
      engines: { analysis: "gpt", rag: "gpt", response: "gpt" },
      keys: { analysis: "", response: "", rag: { gpt: "", gemini: "", llamon: "" } }
    },
  ]);
  const [selectedAgentId, setSelectedAgentId] = useState(1);
  const [uiCharacter, setUiCharacter] = useState("chanu");

  // ── 새 AI 연결 탭 전용 상태 (분리된 엔진 관리) ──
  const [selectedStage, setSelectedStage] = useState("analysis");
  const [stageStatus, setStageStatus] = useState({
    analysis: true,
    rag: true,
    mcp: true,
    prompt: true,
    response: true,
  });
  
  const [stageEngines, setStageEngines] = useState({
    analysis: "OpenAI GPT-5.3",
    rag: "OpenAI GPT-5.3",
    response: "OpenAI GPT-5.3",
    analysisKey: "",
    responseKey: "",
    ragKeys: { gpt: "", gemini: "", llamon: "" },
    ragVectorId: "",
  });

  const getMappedLlmType = (engineName) => {
    if (!engineName) return "gpt";
    if (engineName.includes("GPT")) return "gpt";
    if (engineName.includes("Gemini")) return "gemini";
    if (engineName.includes("LLaMON")) return "llamon";
    return "gpt";
  };
  const getFullEngineName = (shortType) => {
    if (shortType === "gemini") return "Google Gemini 3.1 Pro";
    if (shortType === "llamon") return "LLaMON";
    return "OpenAI GPT-5.3";
  };

  // ── RAG ──
  const [uiRagType, setUiRagType] = useState("none");
  const [nativeRagId, setNativeRagId] = useState("");
  const [externalRagUrl, setExternalRagUrl] = useState("");
  const [ragInput, setRagInput] = useState("");
  const [ragFiles, setRagFiles] = useState([]);
  const [ragTexts, setRagTexts] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [savedKnowledge, setSavedKnowledge] = useState([]);
  const [selectedKnowledgeIds, setSelectedKnowledgeIds] = useState([]);
  const [isKnowledgeListOpen, setIsKnowledgeListOpen] = useState(true);
  const [autoAssistantId, setAutoAssistantId] = useState("");
  const [lastVerifiedVsId, setLastVerifiedVsId] = useState("");
  const fileInputRef = useRef(null);
  const prevAgentIdRef = useRef(null);
  const [ragCache, setRagCache] = useState({
    gpt: { nativeRagId: "", autoAssistantId: "", savedKnowledge: [] },
    gemini: { nativeRagId: "", autoAssistantId: "", savedKnowledge: [] },
    llamon: { nativeRagId: "", autoAssistantId: "", savedKnowledge: [] },
  });

  // ── MCP (폴더 및 아이템 관리) ──
  const [mcpDirectories, setMcpDirectories] = useState([]); // 초기 빈 배열, 서버 데이터 로드 시 채워짐
  const [mcpList, setMcpList] = useState([]); // 백엔드 동기화용 Flat 리스트
  const [isInitialMcpLoaded, setIsInitialMcpLoaded] = useState(false);

  const [isAddDirModalOpen, setIsAddDirModalOpen] = useState(false);
  const [newDirName, setNewDirName] = useState("");
  const [newDirDesc, setNewDirDesc] = useState("");

  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [targetDirId, setTargetDirId] = useState(null);
  const [targetItemId, setTargetItemId] = useState(null);
  const [newApiName, setNewApiName] = useState("");
  const [newApiUrl, setNewApiUrl] = useState("");
  const [newApiMethod, setNewApiMethod] = useState("GET");
  const [newApiKey, setNewApiKey] = useState("");
  const [newApiParams, setNewApiParams] = useState([{ key: "", type: "String", desc: "" }]);

  // ── 프롬프트 ──
  const [selectedTags, setSelectedTags] = useState(["no_politics", "no_religion", "no_social_controversy", "no_profanity", "polite_tone"]);
  const [promptMode, setPromptMode] = useState("tag");
  const [customTags, setCustomTags] = useState([]);
  const [customTagInput, setCustomTagInput] = useState("");
  const [manualPrompt, setManualPrompt] = useState("");

  // ── 동작 설정 ──
  const [layout, setLayout] = useState("bottom-right");
  const [autoOff, setAutoOff] = useState(15);
  const [autoOffSec, setAutoOffSec] = useState(0);
  const [codeTab, setCodeTab] = useState("vanilla");

  // ── 모달 / 알림 ──
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [isNewKeyModalOpen, setIsNewKeyModalOpen] = useState(false);
  const [newKeyNameInput, setNewKeyNameInput] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [reissueTargetId, setReissueTargetId] = useState(null);

  // ── 데이터 로드 및 동기화 ──
  useEffect(() => {
    loadSavedConfig(setApiKeys, setLayout, setAutoOff, setAutoOffSec, setMcpList);
  }, []);

  // 🚀 [해결] 처음 서버에서 mcpList를 가져왔을 때, 로컬 스토리지의 디렉토리와 합쳐서 복원(Hydration)
  useEffect(() => {
    if (mcpList.length > 0 && !isInitialMcpLoaded) {
      setIsInitialMcpLoaded(true);

      let savedDirs = [];
      try {
        const local = localStorage.getItem("klever_mcp_directories");
        if (local) savedDirs = JSON.parse(local);
      } catch (e) {
        console.error("MCP Directory 파싱 오류:", e);
      }

      // 껍데기 폴더가 하나도 없으면 기본 폴더 생성
      if (savedDirs.length === 0) {
        savedDirs = [{ id: "dir_default", name: "연동된 API", description: "서버에서 불러온 도구들", active: true, isOpen: true, items: [] }];
      }

      // 매핑 (서버의 최신 데이터 기준으로 UI 복원)
      mcpList.forEach((mcp) => {
        const mappedItem = {
          id: mcp.id, name: mcp.name, url: mcp.desc, method: mcp.method || "GET",
          active: mcp.active, apiKey: mcp.apiKey || "", params: mcp.parameters || []
        };

        // 기존에 속해있던 폴더 찾기
        let found = false;
        for (let dir of savedDirs) {
          const existingIdx = dir.items.findIndex(i => i.id === mcp.id);
          if (existingIdx >= 0) {
            dir.items[existingIdx] = mappedItem;
            found = true;
            break;
          }
        }
        // 속해있던 폴더가 없으면 첫번째 폴더에 삽입
        if (!found && savedDirs[0]) {
          savedDirs[0].items.push(mappedItem);
        }
      });

      setMcpDirectories([...savedDirs]);
    }
  }, [mcpList, isInitialMcpLoaded]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsModalOpen(false); setIsExitModalOpen(false); setIsNewKeyModalOpen(false);
        setIsAddDirModalOpen(false); setIsAddItemModalOpen(false); setAlertMessage("");
        setDeleteTargetId(null); setReissueTargetId(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // ── 에이전트 전환 시 분리된 엔진/키 초기화 ──
  useEffect(() => {
    const agent = apiKeys.find((a) => a.id === selectedAgentId);
    if (agent) {
      setUiCharacter(agent.character || "chanu");

      const engines = agent.engines || { analysis: agent.llm || "gpt", rag: agent.llm || "gpt", response: agent.llm || "gpt" };
      const keys = agent.keys || { analysis: "", response: "", rag: { gpt: "", gemini: "", llamon: "" } };

      setStageEngines(prev => ({
        ...prev,
        analysis: getFullEngineName(engines.analysis),
        rag: getFullEngineName(engines.rag),
        response: getFullEngineName(engines.response),
        analysisKey: keys.analysis,
        responseKey: keys.response,
        ragKeys: keys.rag
      }));

      const loadedAssistantId = agent.assistantId || "";
      if (loadedAssistantId) {
        setUiRagType("native");
        setAutoAssistantId(loadedAssistantId);
        setNativeRagId(loadedAssistantId);
      } else {
        setUiRagType("none");
        setAutoAssistantId("");
        setNativeRagId("");
      }
      
      setPromptMode(agent.promptMode || "tag");
      setSelectedTags(agent.promptTags || ["no_politics", "no_religion", "no_social_controversy", "no_profanity", "polite_tone"]);
      setCustomTags(agent.customTags || []);
      setManualPrompt(agent.promptManual || "");

      const isAgentSwitch = prevAgentIdRef.current !== selectedAgentId;
      prevAgentIdRef.current = selectedAgentId;
      
      if (isAgentSwitch) {
        setRagCache({
          gpt: { nativeRagId: engines.rag === "gpt" ? loadedAssistantId : "", autoAssistantId: engines.rag === "gpt" ? loadedAssistantId : "", savedKnowledge: [] },
          gemini: { nativeRagId: engines.rag === "gemini" ? loadedAssistantId : "", autoAssistantId: engines.rag === "gemini" ? loadedAssistantId : "", savedKnowledge: [] },
          llamon: { nativeRagId: "", autoAssistantId: "", savedKnowledge: [] },
        });
        setSavedKnowledge([]); setSelectedKnowledgeIds([]); setRagInput(""); setRagFiles([]); setRagTexts([]);
      }
    }
  }, [selectedAgentId, apiKeys]);

  // ── Vector ID 검증 로직 ──
  const handleVectorIdFinish = async () => {
    setIsUploading(true); 
    const currentLlm = getMappedLlmType(stageEngines.rag);
    const result = await processVectorIdFinish(nativeRagId, currentLlm, "native", lastVerifiedVsId);
    if (!result.skip) {
      if (result.success) { setAutoAssistantId(result.assistantId); setLastVerifiedVsId(result.currentId); } 
      else { setAlertMessage(result.message); }
    }
    setIsUploading(false);
  };

  // ── 파일/텍스트 핸들러 ──
  const handleFileAttach = () => fileInputRef.current?.click();
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const newFiles = files.map((file) => ({ id: Date.now() + Math.random(), name: file.name, fileObject: file }));
      setRagFiles((prev) => [...prev, ...newFiles]);
    }
    e.target.value = null;
  };
  const removeFile = (id) => setRagFiles((prev) => prev.filter((f) => f.id !== id));
  const removeRagText = (id) => setRagTexts((prev) => prev.filter((item) => item.id !== id));

  const handleDragOver = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const newFiles = files.map((file) => ({ id: Date.now() + Math.random(), name: file.name, fileObject: file }));
      setRagFiles((prev) => [...prev, ...newFiles]);
    }
  };
  const handleRagKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (ragInput.trim()) {
        const isUrl = ragInput.startsWith("http://") || ragInput.startsWith("https://");
        setRagTexts((prev) => [...prev, { id: Date.now(), type: isUrl ? "url" : "text", content: ragInput.trim() }]);
        setRagInput("");
      }
    }
  };

  const handleUploadKnowledge = () => {
    if (!ragInput.trim() && ragFiles.length === 0 && ragTexts.length === 0) return;
    setIsUploading(true);
    
    setTimeout(async () => {
      try {
        let combinedFiles = [...ragFiles];
        let textContent = "";

        const fetchTextFromUrl = async (url) => {
          try {
            const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
            const data = await res.json();
            const doc = new DOMParser().parseFromString(data.contents, 'text/html');
            doc.querySelectorAll('script, style, noscript, iframe, nav, footer').forEach(el => el.remove());
            return (doc.body.textContent || "").replace(/\s+/g, ' ').trim(); 
          } catch (e) {
            return `https://blog.naver.com/tvis/220104346957`;
          }
        };

        for (const item of ragTexts) {
          if (item.type === 'url') {
            textContent += `\n\n--- [웹사이트 출처: ${item.content}] ---\n`;
            textContent += await fetchTextFromUrl(item.content); 
          } else {
            textContent += `\n\n--- [사용자 입력 지식] ---\n${item.content}`;
          }
        }
        if (ragInput.trim()) {
          const isUrl = ragInput.startsWith("http://") || ragInput.startsWith("https://");
          if (isUrl) {
            textContent += `\n\n--- [웹사이트 출처: ${ragInput.trim()}] ---\n`;
            textContent += await fetchTextFromUrl(ragInput.trim());
          } else {
            textContent += `\n\n--- [사용자 입력 지식] ---\n${ragInput.trim()}`;
          }
        }

        if (textContent.trim() !== "") {
          const textBlob = new Blob([textContent], { type: 'text/plain' });
          const textFile = new File([textBlob], `scraped_knowledge_${Date.now()}.txt`, { type: 'text/plain' });
          combinedFiles.push({ id: `txt_${Date.now()}`, name: "웹사이트_및_텍스트_학습데이터.txt", fileObject: textFile });
        }

        const currentLlm = getMappedLlmType(stageEngines.rag);
        const assistantIdRes = await processKnowledgeUpload(combinedFiles, currentLlm, "native", nativeRagId);
        if (assistantIdRes) setAutoAssistantId(assistantIdRes);

        const newBundle = createBundle(ragInput, ragTexts, ragFiles);
        setSavedKnowledge([newBundle, ...savedKnowledge]);
        setSelectedKnowledgeIds([...selectedKnowledgeIds, newBundle.id]);
        
        const serverName = currentLlm === "gpt" ? "OpenAI Vector Store" : "Gemini 서버";
        setAlertMessage(`데이터가 성공적으로 ${serverName}에 업로드 되었습니다.\n(URL 스크랩 완료)`);

        setRagInput(""); setRagFiles([]); setRagTexts([]);
        if (!isKnowledgeListOpen) setIsKnowledgeListOpen(true);
      } catch (error) {
        setAlertMessage(error.message || "업로드 중 알 수 없는 오류가 발생했습니다.");
      } finally {
        setIsUploading(false);
      }
    }, 100); 
  };

  const handleToggleKnowledgeSelection = (id) => setSelectedKnowledgeIds((prev) => prev.includes(id) ? prev.filter((k) => k !== id) : [...prev, id]);
  const handleEditKnowledge = (itemToEdit) => {
    setSavedKnowledge((prev) => prev.filter((item) => item.id !== itemToEdit.id));
    setSelectedKnowledgeIds((prev) => prev.filter((id) => id !== itemToEdit.id));
    const newTexts = []; const newFiles = [];
    itemToEdit.items.forEach((subItem) => {
      if (subItem.type === "text" || subItem.type === "url") newTexts.push({ id: subItem.id, type: subItem.type, content: subItem.content });
      else if (subItem.type === "document") newFiles.push({ id: subItem.id, name: subItem.content, fileObject: subItem.fileObject });
    });
    setRagTexts((prev) => [...prev, ...newTexts]);
    setRagFiles((prev) => [...prev, ...newFiles]);
  };

  // ── 🚀 [해결] MCP 중앙 관리 함수 (수정/추가/삭제 시 모두 호출하여 동기화) ──
  const updateMcpData = (newDirs) => {
    setMcpDirectories(newDirs);
    localStorage.setItem("klever_mcp_directories", JSON.stringify(newDirs));

    const flat = [];
    newDirs.forEach(dir => {
       dir.items.forEach(item => {
           flat.push({
               id: item.id, name: item.name, desc: item.url, type: "custom",
               method: item.method, active: item.active, apiKey: item.apiKey, parameters: item.params
           });
       });
    });
    setMcpList(flat);
    syncMcpToStorage(flat, setMcpList);
  };

  const toggleDirectory = (id) => updateMcpData(mcpDirectories.map((dir) => dir.id === id ? { ...dir, isOpen: !dir.isOpen } : dir));
  const toggleDirectoryActive = (id, e) => {
    e.stopPropagation();
    updateMcpData(mcpDirectories.map((dir) => {
      if (dir.id !== id) return dir;
      return { ...dir, active: dir.items.length === 0 ? false : !dir.active };
    }));
  };
  const handleDeleteDirectory = (id, e) => { e.stopPropagation(); updateMcpData(mcpDirectories.filter((dir) => dir.id !== id)); };
  const toggleItemActive = (dirId, itemId, e) => {
    e.stopPropagation();
    updateMcpData(mcpDirectories.map((dir) => dir.id === dirId ? { ...dir, items: dir.items.map((item) => item.id === itemId ? { ...item, active: !item.active } : item) } : dir));
  };
  const handleDeleteApiItem = (dirId, itemId) => {
    updateMcpData(mcpDirectories.map((dir) => {
      if (dir.id !== dirId) return dir;
      const newItems = dir.items.filter((item) => item.id !== itemId);
      return { ...dir, items: newItems, active: newItems.length === 0 ? false : dir.active };
    }));
  };

  const handleAddDirectory = () => {
    const dirName = newDirName.trim() || "새 디렉토리";
    updateMcpData([...mcpDirectories, { id: `dir_${Date.now()}`, name: dirName, description: newDirDesc.trim(), active: false, isOpen: true, items: [] }]);
    setIsAddDirModalOpen(false); setNewDirName(""); setNewDirDesc("");
  };

  const handleAddParam = () => setNewApiParams((prev) => [...prev, { key: "", type: "String", desc: "" }]);
  const updateParam = (index, field, value) => setNewApiParams((prev) => { const updated = [...prev]; updated[index] = { ...updated[index], [field]: value }; return updated; });
  const removeParam = (index) => { if (newApiParams.length > 1) setNewApiParams((prev) => prev.filter((_, i) => i !== index)); };

  const handleAddApiItem = () => {
    if (!targetDirId) return;
    
    let updatedDirs = [...mcpDirectories];
    if (targetItemId) {
      updatedDirs = updatedDirs.map((dir) => {
        if (dir.id !== targetDirId) return dir;
        return {
          ...dir,
          items: dir.items.map((item) => item.id === targetItemId ? { ...item, name: newApiName.trim() || "이름 없음", url: newApiUrl, method: newApiMethod, apiKey: newApiKey, params: newApiParams.filter((p) => p.key.trim() !== "") } : item),
        };
      });
    } else {
      const newItem = { id: `item_${Date.now()}`, name: newApiName.trim() || "새 항목", url: newApiUrl, method: newApiMethod, apiKey: newApiKey, params: newApiParams.filter((p) => p.key.trim() !== ""), active: true };
      updatedDirs = updatedDirs.map((dir) => dir.id === targetDirId ? { ...dir, items: [...dir.items, newItem] } : dir);
    }

    updateMcpData(updatedDirs);
    setIsAddItemModalOpen(false);
    setNewApiName(""); setNewApiUrl(""); setNewApiMethod("GET"); setNewApiKey(""); setNewApiParams([{ key: "", type: "String", desc: "" }]); setTargetDirId(null); setTargetItemId(null);
  };

  // ── 프롬프트 태그 ──
  const promptTagOptions = [
    { id: "no_politics", label: "정치 언급 금지" }, { id: "no_religion", label: "종교 언급 금지" }, { id: "no_social_controversy", label: "사회적 논란 언급 금지" },
    { id: "no_profanity", label: "비속어 및 혐오 표현 금지" }, { id: "no_competitors", label: "경쟁사 언급 금지" }, { id: "no_personal_info", label: "개인정보 요구 금지" },
    { id: "polite_tone", label: "존댓말" }, { id: "require_citation", label: "출처 표기" }, { id: "empathy_first", label: "공감과 위로" },
  ];
  const togglePromptTag = (tagId) => {
    const updated = selectedTags.includes(tagId) ? selectedTags.filter((id) => id !== tagId) : [...selectedTags, tagId];
    setSelectedTags(updated);
    setApiKeys((prev) => prev.map((k) => k.id === selectedAgentId ? { ...k, promptTags: updated } : k));
  };
  const handleAddCustomTag = () => {
    const trimmed = customTagInput.trim();
    if (!trimmed) return;
    const tagId = `custom_${Date.now()}`;
    const updatedCustomTags = [...customTags, { id: tagId, label: trimmed }];
    const updatedSelectedTags = [...selectedTags, tagId];
    setCustomTags(updatedCustomTags); setSelectedTags(updatedSelectedTags); setCustomTagInput("");
    setApiKeys((prev) => prev.map((k) => k.id === selectedAgentId ? { ...k, customTags: updatedCustomTags, promptTags: updatedSelectedTags } : k));
  };
  const handleRemoveCustomTag = (e, tagId) => {
    e.stopPropagation();
    const updatedCustomTags = customTags.filter((tag) => tag.id !== tagId);
    const updatedSelectedTags = selectedTags.filter((id) => id !== tagId);
    setCustomTags(updatedCustomTags); setSelectedTags(updatedSelectedTags);
    setApiKeys((prev) => prev.map((k) => k.id === selectedAgentId ? { ...k, customTags: updatedCustomTags, promptTags: updatedSelectedTags } : k));
  };

  // ── API 키 관리 ──
  const handleCopySpecificKey = (value) => {
    try {
      const ta = document.createElement("textarea"); ta.value = value; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); document.body.removeChild(ta);
      setAlertMessage("API 키가 클립보드에 복사되었습니다!");
    } catch (err) { console.error(err); }
  };
  const handleGenerateNewKey = () => { setNewKeyNameInput(`신규 에이전트 키 #${apiKeys.length + 1}`); setIsNewKeyModalOpen(true); };
  const confirmGenerateNewKey = () => {
    if (!newKeyNameInput.trim()) return;
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789"; let newKey = "sk-live-";
    for (let i = 0; i < 24; i++) newKey += chars.charAt(Math.floor(Math.random() * chars.length));
    const today = new Date(); const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    const newKeyObj = {
      id: Date.now(), name: newKeyNameInput.trim(), value: newKey, date: dateStr,
      character: "chanu", voice: "", language: "ko", assistantId: "", promptMode: "tag",
      promptTags: ["no_politics", "no_religion", "no_social_controversy", "no_profanity", "polite_tone"], customTags: [], promptManual: "",
      engines: { analysis: "gpt", rag: "gpt", response: "gpt" },
      keys: { analysis: "", response: "", rag: { gpt: "", gemini: "", llamon: "" } }
    };
    setApiKeys([newKeyObj, ...apiKeys]); setSelectedAgentId(newKeyObj.id); setIsNewKeyModalOpen(false);
  };
  const handleReissueKey = (id) => setReissueTargetId(id);
  const handleDeleteKey = (id) => { if (apiKeys.length === 1) { setAlertMessage("최소 1개의 API 키는 유지해야 합니다."); return; } setDeleteTargetId(id); };
  const confirmReissueKey = () => {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789"; let newKey = "sk-live-";
    for (let i = 0; i < 24; i++) newKey += chars.charAt(Math.floor(Math.random() * chars.length));
    const today = new Date(); const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    setApiKeys((prev) => prev.map((k) => k.id === reissueTargetId ? { ...k, value: newKey, date: dateStr } : k)); setReissueTargetId(null); setAlertMessage("API 키 재발급 요청이 정상적으로 접수되었습니다.");
  };
  const confirmDeleteKey = () => { setApiKeys((prev) => prev.filter((k) => k.id !== deleteTargetId)); setDeleteTargetId(null); };

  // ── 저장 및 초기화 ──
  const handleSaveClick = () => setIsModalOpen(true);
  const confirmSave = () => {
    setIsModalOpen(false);
    
    const updatedApiKeys = apiKeys.map(k => {
      if (k.id === selectedAgentId) {
        return {
          ...k,
          llm: getMappedLlmType(stageEngines.response),
          engines: {
            analysis: getMappedLlmType(stageEngines.analysis),
            rag: getMappedLlmType(stageEngines.rag),
            response: getMappedLlmType(stageEngines.response)
          },
          keys: {
            analysis: stageEngines.analysisKey,
            response: stageEngines.responseKey,
            rag: stageEngines.ragKeys
          }
        };
      }
      return k;
    });

    setApiKeys(updatedApiKeys);

    saveConfiguration({ 
      apiKeys: updatedApiKeys, selectedAgentId, uiCharacter, 
      uiLlmType: getMappedLlmType(stageEngines.response), 
      uiRagType: stageStatus.rag ? "native" : "none", 
      autoAssistantId, promptMode, selectedTags, customTags, manualPrompt, layout, autoOff, autoOffSec, digitalHumans, 
      mcpList: mcpList, // 중앙 관리되는 리스트 전송
      setApiKeys,
      engines: { analysis: getMappedLlmType(stageEngines.analysis), rag: getMappedLlmType(stageEngines.rag), response: getMappedLlmType(stageEngines.response) },
      keys: { analysis: stageEngines.analysisKey, response: stageEngines.responseKey, rag: stageEngines.ragKeys }
    });
    setAlertMessage("성공적으로 적용되었습니다!");
  };

  const handleReset = () => {
    setApiKeys([{
      id: 1, name: "chilloen", value: "sk-live-a1b2c3d4e5f6g7h8i9j0", date: "2026-04-07",
      character: "chanu", voice: "", language: "ko", assistantId: "", promptMode: "tag", promptTags: ["no_politics", "no_religion", "no_social_controversy", "no_profanity", "polite_tone"], customTags: [], promptManual: "",
      engines: { analysis: "gpt", rag: "gpt", response: "gpt" }, keys: { analysis: "", response: "", rag: { gpt: "", gemini: "", llamon: "" } }
    }]);
    setSelectedAgentId(1); setUiCharacter("chanu"); setLayout("bottom-right"); setAutoOff(15); setAutoOffSec(0);
    setSelectedTags(["no_politics", "no_religion", "no_social_controversy", "no_profanity", "polite_tone"]); setPromptMode("tag"); setCustomTags([]); setCustomTagInput(""); setManualPrompt("");
    setStageEngines({ analysis: "OpenAI GPT-5.3", rag: "OpenAI GPT-5.3", response: "OpenAI GPT-5.3", analysisKey: "", responseKey: "", ragKeys: { gpt: "", gemini: "", llamon: "" }, ragVectorId: "" });
    setStageStatus({ analysis: true, rag: true, mcp: true, prompt: true, response: true });
    updateMcpData([]); // 초기화 시 빈 폴더로 리셋
  };

  // ── 임베드 코드 ──
  const getEmbedCode = () => {
    const totalSeconds = (parseInt(autoOff) || 0) * 60 + (parseInt(autoOffSec) || 0);
    if (codeTab === "react") {
      return `// npm install @klever-one/react\n\nimport { KleverWidget } from '@klever-one/react';\n\nexport default function App() {\n  return (\n    <>\n      {/* 다른 컴포넌트들... */}\n      <KleverWidget \n        clientId="YOUR_CLIENT_ID"\n        layout="${layout}"\n        autoOff={${totalSeconds}}\n      />\n    </>\n  );\n}`;
    }
    return `\n<script>\n  (function(w, d, s, o, f, js, fjs) {\n    w['KleverOneWidget'] = o; w[o] = w[o] || function () { (w[o].q = w[o].q || []).push(arguments) };\n    js = d.createElement(s), fjs = d.getElementsByTagName(s)[0];\n    js.id = o; js.src = f; js.async = 1; fjs.parentNode.insertBefore(js, fjs);\n  }(window, document, 'script', 'kw', 'https://cdn.klever-one.com/widget.js'));\n  \n  kw('init', {\n    clientId: 'YOUR_CLIENT_ID',\n    layout: '${layout}',\n    autoOff: ${totalSeconds}\n  });\n</script>`;
  };
  const handleCopyEmbedCode = () => {
    try { const ta = document.createElement("textarea"); ta.value = getEmbedCode(); document.body.appendChild(ta); ta.select(); document.execCommand("copy"); document.body.removeChild(ta); setAlertMessage("삽입 코드가 클립보드에 복사되었습니다!"); } catch (err) { console.error(err); }
  };

  // ── 기타 데이터 ──
  const digitalHumans = [
    { id: "yuri", name: "유리 (Yuri)", desc: "단정하고 신뢰감 있는 안내원 스타일", bg: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)", num: 2 },
    { id: "chanu", name: "차누 (Chanu)", desc: "전문적이고 논리적인 컨설턴트 스타일", bg: "linear-gradient(135deg, #2b5876 0%, #4e4376 100%)", num: 1 },
    { id: "sujin", name: "마이클 (Michael)", desc: "밝고 캐주얼한 일상 대화 스타일", bg: "linear-gradient(135deg, #3a1c71 0%, #d76d77 50%, #ffaf7b 100%)", num: 4 },
  ];
  const layoutOptions = [
    { id: "bottom-right", label: "우측 하단 (기본)", boxClass: "br" }, { id: "bottom-left", label: "좌측 하단", boxClass: "bl" },
    { id: "center", label: "화면 중앙 팝업", boxClass: "center" }, { id: "top-right", label: "우측 상단", boxClass: "tr" }, { id: "top-left", label: "좌측 상단", boxClass: "tl" },
  ];

  const savedAgent = apiKeys.find((a) => a.id === selectedAgentId) || apiKeys[0];
  const selectedHuman = digitalHumans.find((h) => h.id === uiCharacter);
  const currentAvatarNum = selectedHuman ? selectedHuman.num : 1;
  const resolvedPromptTags = (savedAgent.promptTags || []).map((tagId) => { const customMatch = (savedAgent.customTags || []).find((t) => t.id === tagId); return customMatch ? customMatch.label : tagId; });

  const sidebarStages = [
    { id: "analysis", label: "01 사용자 요청 분석", engine: stageStatus.analysis ? stageEngines.analysis : "OFFLINE" },
    { id: "knowledge_group", label: "02 지식", isGroup: true, subItems: [{ id: "rag", label: "RAG 설정", engine: stageStatus.rag ? stageEngines.rag : "OFFLINE" }, { id: "mcp", label: "MCP 설정", engine: `${mcpDirectories.filter((d) => d.active).reduce((sum, d) => sum + d.items.length, 0)} UNITS ACTIVE` }, { id: "prompt", label: "프롬프팅 설정", engine: "활성화 되었습니다." }] },
    { id: "response", label: "03 디지털 휴먼 응답", engine: stageStatus.response ? stageEngines.response : "OFFLINE" },
  ];

  const stageDescriptions = {
    analysis: { title: "사용자 요청 분석 설정", desc: "사용자 의도를 파악하는 전처리용 LLM 엔진과 키를 선택하세요." },
    rag: { title: "지식저장소(RAG) 설정", desc: "선택한 엔진이 답변 시 참고할 지식 기반(Knowledge Base)를 연결합니다." },
    mcp: { title: "MCP 기반 도구 연동", desc: "기본 제공 기능이나 커스텀 API 엔드 포인트를 연결하여 에이전트의 기능을 확장하세요." },
    prompt: { title: "에이전트 행동 지침", desc: "에이전트가 답변시 지켜야 할 핵심 규칙이나 페르소나를 설정하세요." },
    response: { title: "디지털 휴먼 응답 LLM 설정", desc: "최종 응답을 생성하여 디지털 휴먼에게 전달할 엔진을 선택하세요." },
  };

  const isToggleable = !["analysis", "response"].includes(selectedStage);
  const currentRagEngineType = getMappedLlmType(stageEngines.rag);

  return (
    <div className={`app-root ${!isDarkMode ? "light-mode" : ""}`}>
      <div className="agent-settings-container">

        {/* ── 헤더 ── */}
        <div className="view-header">
          <div className="title-area">
            <h1 className="main-title"><span className="highlight">KLEVER ONE</span></h1>
            <p className="sub-title">{i18n[uiLang]?.subTitle}</p>
          </div>
          <div className="header-buttons">
            <select className="ui-lang-select" value={uiLang} onChange={(e) => setUiLang(e.target.value)} title="Change UI Language">
              <option value="ko">한국어</option>
              <option value="en">English</option>
              <option value="zh">中文</option>
              <option value="vi">Tiếng Việt</option>
              <option value="ja">日本語</option>
            </select>
            <button className="btn-icon-theme" onClick={() => setIsDarkMode(!isDarkMode)} title={isDarkMode ? "라이트 모드" : "다크 모드"}>
              {isDarkMode ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              )}
            </button>
            <button className="btn-outline" onClick={handleReset}>{i18n[uiLang]?.reset}</button>
            <button className="btn-primary" onClick={handleSaveClick}>{i18n[uiLang]?.save}</button>
            <button className="btn-icon-back" onClick={() => setIsExitModalOpen(true)} title="나가기">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </button>
          </div>
        </div>

        {/* ── 탭 ── */}
        <div className="settings-tabs">
          {["agent", "system", "widget"].map((tab, i) => (
            <button key={tab} className={`tab-btn ${activeTab === tab ? "active" : ""}`} onClick={() => setActiveTab(tab)}>
              {[i18n[uiLang]?.tab1, i18n[uiLang]?.tab2, i18n[uiLang]?.tab3][i]}
            </button>
          ))}
        </div>

        <div className="tab-content-area">

          {/* ════════════════════════════════════════
              TAB 1: 에이전트 설정
          ════════════════════════════════════════ */}
          {activeTab === "agent" && (
            <div className="tab-pane fade-in">
              <div className="setting-card">
                <div className="card-header-flex" style={{ marginBottom: "16px" }}>
                  <div>
                    <h3 className="card-title">{i18n[uiLang]?.apiKeyTitle}</h3>
                    <p className="card-desc" style={{ marginBottom: 0 }}>{i18n[uiLang]?.apiKeyDesc}</p>
                  </div>
                  <button className="btn-klever-sync" onClick={handleGenerateNewKey}>{i18n[uiLang]?.newKeyBtn}</button>
                </div>
                <div className="api-key-list">
                  {apiKeys.map((keyObj) => (
                    <div key={keyObj.id} className="api-key-item">
                      <div className="api-key-info">
                        <div className="api-key-name-wrap">
                          <span className="api-key-name">{keyObj.name}</span>
                          <span className="api-key-date">{keyObj.date}</span>
                        </div>
                        <input type="text" className="api-key-value" value={keyObj.value} readOnly />
                      </div>
                      <div className="api-key-actions">
                        <button className="btn-icon" onClick={() => handleCopySpecificKey(keyObj.value)} title="키 복사">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                        </button>
                        <button className="btn-text-reissue" onClick={() => handleReissueKey(keyObj.id)}>재발급</button>
                        <button className="btn-icon danger" onClick={() => handleDeleteKey(keyObj.id)} title="키 삭제">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="setting-card" style={{ padding: "24px 28px 32px" }}>
                <div className="card-header-flex" style={{ marginBottom: "16px" }}>
                  <div>
                    <h3 className="card-title">{i18n[uiLang]?.modelTitle}</h3>
                    <p className="card-desc" style={{ marginBottom: 0 }}>{i18n[uiLang]?.modelDesc}</p>
                  </div>
                  <button className="btn-klever-sync" onClick={() => window.open("https://www.klever-one.com/studio", "_blank")}>{i18n[uiLang]?.studioBtn}</button>
                </div>
                <div className="agent-select-box">
                  <label>{i18n[uiLang]?.agentSelectLabel}</label>
                  <select className="custom-select" value={selectedAgentId} onChange={(e) => setSelectedAgentId(Number(e.target.value))}>
                    {apiKeys.map((k) => (
                      <option key={k.id} value={k.id}>{k.name} ({k.value.substring(0, 16)}...)</option>
                    ))}
                  </select>
                </div>
                <div className="character-grid">
                  {digitalHumans.map((human) => (
                    <div key={human.id} className={`character-card ${uiCharacter === human.id ? "selected" : ""}`} onClick={() => setUiCharacter(human.id)}>
                      <div className="character-bg" style={{ background: human.image ? `url('${human.image}') center top / cover no-repeat` : human.bg }} />
                      <div className="character-overlay">
                        <div className="character-text">
                          <h4>{human.name}</h4>
                          <p>{human.desc}</p>
                        </div>
                        <button className="btn-character">{uiCharacter === human.id ? "선택됨" : "선택하기"}</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════
              TAB 2: AI 연결
          ════════════════════════════════════════ */}
          {activeTab === "system" && (
            <div className="tab-pane fade-in" style={{ padding: "10px" }}>
              <div className="system-pane" style={{ display: "flex", gap: "10px", alignItems: "flex-start", width: "100%", minHeight: "820px" }}>

                {/* ── 좌측: 워크플로우 사이드바 ── */}
                <div style={{ width: "320px", flexShrink: 0, display: "flex", flexDirection: "column", gap: "16px", height: "820px", overflowY: "auto", paddingRight: "12px" }}>
                  <div className="glass-card" style={{ padding: "24px", borderRadius: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
                    {sidebarStages.map((stage) => {
                      if (stage.isGroup) {
                        const isAnySubActive = stage.subItems.some((s) => selectedStage === s.id);
                        return (
                          <div key={stage.id} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                            <div className={`setting-card ${isAnySubActive ? "active-no-glow" : ""}`} style={{ padding: "16px 20px", borderRadius: "16px", border: isAnySubActive ? "1.5px solid var(--accent)" : "1px solid var(--border-glass)", backgroundColor: isAnySubActive ? "rgba(0,198,255,0.08)" : "rgba(255,255,255,0.02)", transition: "all 0.2s ease-out" }}>
                              <h3 style={{ fontSize: "14px", fontWeight: "700", color: isAnySubActive ? "#fff" : "#cbd5e0", margin: 0 }}>{stage.label}</h3>
                            </div>
                            <div style={{ paddingLeft: "12px", display: "flex", flexDirection: "column", gap: "4px", marginTop: "4px", borderLeft: "1px solid rgba(0,198,255,0.2)", marginLeft: "12px" }}>
                              {stage.subItems.map((subItem) => {
                                const isActive = selectedStage === subItem.id;
                                const isOn = stageStatus[subItem.id];
                                return (
                                  <div key={subItem.id} className={`setting-card ${isActive ? "active-no-glow" : ""}`} style={{ padding: "10px 16px", cursor: "pointer", borderRadius: "12px", border: isActive ? "1px solid var(--accent)" : "1px solid transparent", backgroundColor: isActive ? "rgba(0,198,255,0.05)" : "transparent", transition: "all 0.2s ease-out" }} onClick={() => setSelectedStage(subItem.id)}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                                        <h4 style={{ fontSize: "13px", fontWeight: "600", color: isActive ? "#fff" : (isOn ? "#cbd5e0" : "#4a5568"), margin: 0 }}>{subItem.label}</h4>
                                        {isOn && (subItem.id === "rag" || (subItem.id === "mcp" && mcpDirectories.some((d) => d.active))) && (
                                          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "4px" }}>
                                            {subItem.id === "rag" ? (
                                              <span style={{ fontSize: "9px", color: "var(--accent)", backgroundColor: "rgba(0,198,255,0.1)", padding: "2px 5px", borderRadius: "4px", fontFamily: "var(--f-mono)", opacity: 0.8, letterSpacing: "0.01em", textTransform: "uppercase" }}>{stageEngines.rag}</span>
                                            ) : subItem.id === "mcp" ? (
                                              mcpDirectories.filter((d) => d.active).map((d) => (
                                                <span key={d.id} style={{ fontSize: "9px", color: "var(--accent)", backgroundColor: "rgba(0,198,255,0.1)", padding: "2px 5px", borderRadius: "4px", fontFamily: "var(--f-mono)", opacity: 0.8, letterSpacing: "0.01em", textTransform: "uppercase" }}>{d.name}</span>
                                              ))
                                            ) : null}
                                          </div>
                                        )}
                                      </div>
                                      <div style={{ width: "5px", height: "5px", borderRadius: "50%", backgroundColor: isOn ? "var(--accent)" : "#4a5568" }} />
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      }
                      const isActive = selectedStage === stage.id;
                      return (
                        <div key={stage.id} className={`setting-card ${isActive ? "active-no-glow" : ""}`} style={{ padding: "16px 20px", cursor: "pointer", borderRadius: "16px", border: isActive ? "1.5px solid var(--accent)" : "1px solid var(--border-glass)", backgroundColor: isActive ? "rgba(0,198,255,0.08)" : "rgba(255,255,255,0.02)", transition: "all 0.2s ease-out", marginBottom: "4px" }} onClick={() => setSelectedStage(stage.id)}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                              <h3 style={{ fontSize: "14px", fontWeight: "700", color: isActive ? "#fff" : "#cbd5e0", margin: 0 }}>{stage.label}</h3>
                              <div style={{ display: "flex", marginTop: "4px" }}>
                                <span style={{ fontSize: "9px", color: "var(--accent)", backgroundColor: "rgba(0,198,255,0.1)", padding: "2px 5px", borderRadius: "4px", fontFamily: "var(--f-mono)", opacity: 0.8, letterSpacing: "0.01em", textTransform: "uppercase" }}>{stage.engine}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* ── 우측: 상세 설정 패널 ── */}
                <div style={{ flex: 1, minHeight: "820px", overflowY: selectedStage === "mcp" ? "visible" : "auto" }}>
                  <div style={{ minHeight: "100%", backgroundColor: "var(--bg-card)", border: "1px solid var(--border-glass)", borderRadius: "16px", padding: "32px", display: "flex", flexDirection: "column", boxSizing: "border-box", boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#00c6ff", boxShadow: "0 0 10px #00c6ff" }} />
                        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                          <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#fff", margin: 0, letterSpacing: "-0.02em" }}>{stageDescriptions[selectedStage]?.title}</h2>
                          <p style={{ fontSize: "13px", color: "var(--text-muted)", opacity: 0.8, margin: 0, lineHeight: "1.4" }}>{stageDescriptions[selectedStage]?.desc}</p>
                        </div>
                      </div>
                      {isToggleable && (
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{ fontSize: "11px", fontWeight: "700", color: stageStatus[selectedStage] ? "#00c6ff" : "#4a5568", textTransform: "uppercase" }}>
                            {stageStatus[selectedStage] ? "Active" : "Inactive"}
                          </span>
                          <div style={{ width: "46px", height: "22px", backgroundColor: stageStatus[selectedStage] ? "#00c6ff" : "#2d3748", borderRadius: "11px", position: "relative", cursor: "pointer", transition: "all 0.3s ease" }}
                            onClick={() => setStageStatus((prev) => ({ ...prev, [selectedStage]: !prev[selectedStage] }))}>
                            <div style={{ width: "18px", height: "18px", backgroundColor: "#fff", borderRadius: "50%", position: "absolute", left: stageStatus[selectedStage] ? "25px" : "3px", top: "2px", transition: "all 0.25s cubic-bezier(0.16,1,0.3,1)", boxShadow: "0 2px 4px rgba(0,0,0,0.3)" }} />
                          </div>
                        </div>
                      )}
                    </div>

                    <div style={{ borderBottom: "1px solid #2d3748", marginBottom: "24px" }} />

                    <div style={{ flex: 1 }}>

                      {/* ── analysis / response ── */}
                      {(selectedStage === "analysis" || selectedStage === "response") && (
                        <div className="fade-in">
                          <div className="form-group" style={{ marginBottom: "32px" }}>
                            <label style={{ fontSize: "13px", color: "#718096", marginBottom: "12px", display: "block", fontWeight: "600" }}>{selectedStage === "analysis" ? "분석용" : "응답 생성용"} 엔진 선택</label>
                            <select className="custom-select" style={{ height: "52px", borderRadius: "10px", fontSize: "15px" }}
                              value={selectedStage === "analysis" ? stageEngines.analysis : stageEngines.response}
                              onChange={(e) => setStageEngines((prev) => ({ ...prev, [selectedStage]: e.target.value }))}>
                              <option>OpenAI GPT-5.3</option>
                              <option>Google Gemini 3.1 Pro</option>
                              <option disabled>LLaMON</option>
                              <option disabled>직접 연결 (Custom)</option>
                            </select>
                          </div>
                          <div style={{ border: "1px solid #2d3748", borderRadius: "16px", padding: "24px", backgroundColor: "rgba(0,0,0,0.2)" }}>
                            <label style={{ fontSize: "13px", fontWeight: "700", color: "#a0aec0", display: "block", marginBottom: "12px" }}>API KEY 인증 설정</label>
                            <input type="password" className="custom-input" placeholder="인증키를 입력하세요..."
                              style={{ backgroundColor: "rgba(255,255,255,0.02)", border: "1px solid #4a5568", borderRadius: "12px", color: "#cbd5e0", padding: "10px 14px", height: "48px", fontSize: "13px", outline: "none" }}
                              value={selectedStage === "analysis" ? stageEngines.analysisKey : stageEngines.responseKey}
                              onChange={(e) => {
                                const val = e.target.value;
                                setStageEngines((prev) => ({ ...prev, [selectedStage === "analysis" ? "analysisKey" : "responseKey"]: val }));
                              }}
                            />
                            <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "8px" }}>* 저장된 키가 있는 경우 자동으로 표시됩니다.</p>
                          </div>
                        </div>
                      )}

                      {/* ── RAG 설정 ── */}
                      {selectedStage === "rag" && (
                        <div className="fade-in">
                          <div className="form-group" style={{ marginBottom: "20px" }}>
                            <label style={{ fontSize: "13px", color: "#a0aec0", marginBottom: "8px", display: "block", fontWeight: "600" }}>RAG 엔진 선택</label>
                            <select className="custom-select" style={{ height: "48px", fontSize: "14px" }}
                              value={stageEngines.rag}
                              onChange={(e) => setStageEngines((prev) => ({ ...prev, rag: e.target.value }))}>
                              <option>OpenAI GPT-5.3</option>
                              <option>Google Gemini 3.1 Pro</option>
                              <option disabled>LLaMON</option>
                            </select>
                          </div>

                          <div style={{ border: "1px solid #2d3748", borderRadius: "16px", padding: "24px", backgroundColor: "rgba(0,0,0,0.2)" }}>
                            <div className="form-group" style={{ marginBottom: "20px" }}>
                              <label style={{ fontSize: "13px", color: "#a0aec0", marginBottom: "8px", display: "block" }}>
                                {stageEngines.rag.includes("GPT") ? "OpenAI" : "Gemini"} API Key 설정
                              </label>
                              <input type="password" className="custom-input" placeholder="API 키를 입력하세요..."
                                style={{ backgroundColor: "rgba(255,255,255,0.02)", border: "1px solid #4a5568", borderRadius: "12px", color: "#cbd5e0", padding: "10px 14px", fontSize: "13px", outline: "none" }}
                                value={stageEngines.ragKeys[currentRagEngineType] || ""}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setStageEngines((prev) => ({ 
                                    ...prev, 
                                    ragKeys: { ...prev.ragKeys, [currentRagEngineType]: val } 
                                  }));
                                }} />
                            </div>

                            {stageEngines.rag.includes("OpenAI") && (
                              <div className="form-group" style={{ marginBottom: "20px" }}>
                                <label style={{ fontSize: "13px", color: "#a0aec0", marginBottom: "8px", display: "block" }}>Vector Store ID (또는 Assistant ID)</label>
                                <input type="text" className="custom-input" placeholder="vs_abc123def456 (기존 저장소 연결 시)"
                                  style={{ backgroundColor: "rgba(255,255,255,0.02)", border: "1px solid #4a5568", borderRadius: "12px", color: "#cbd5e0", padding: "10px 14px", fontSize: "13px", outline: "none" }}
                                  value={nativeRagId}
                                  onChange={(e) => setNativeRagId(e.target.value)} 
                                  onBlur={handleVectorIdFinish}
                                  onKeyDown={(e) => { if (e.key === 'Enter') handleVectorIdFinish(); }}
                                />
                              </div>
                            )}

                            <div className="form-group" style={{ marginBottom: "24px" }}>
                              <label style={{ fontSize: "13px", color: "#a0aec0", marginBottom: "8px", display: "block" }}>신규 데이터 학습 (텍스트, URL, 파일)</label>
                              <div className={`unified-rag-box ${isDragging ? "drag-active" : ""} ${isUploading ? "uploading" : ""}`}
                                style={{ position: "relative", backgroundColor: "rgba(255,255,255,0.02)", border: isDragging ? "2px solid var(--accent)" : "1px dashed #4a5568", borderRadius: "12px", minHeight: "160px", display: "flex", flexDirection: "column", transition: "all 0.2s" }}
                                onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
                                <textarea className="unified-rag-textarea"
                                  placeholder="학습할 텍스트나 URL을 붙여넣거나, 문서를 드래그 앤 드롭하세요."
                                  value={ragInput} onChange={(e) => setRagInput(e.target.value)} onKeyDown={handleRagKeyDown} />
                                <input type="file" ref={fileInputRef} style={{ display: "none" }} accept=".pdf,.txt,.doc,.docx" multiple onChange={handleFileChange} />

                                {(ragFiles.length > 0 || ragTexts.length > 0) && (
                                  <div className="rag-files-preview" style={{ paddingBottom: "40px" }}>
                                    {ragTexts.map((item) => (
                                      <div key={item.id} className="file-chip">
                                        {item.type === "url" ? (
                                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                                        ) : (
                                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                                        )}
                                        <span title={item.content}>{item.content}</span>
                                        <button type="button" onClick={() => removeRagText(item.id)}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
                                      </div>
                                    ))}
                                    {ragFiles.map((file) => (
                                      <div key={file.id} className="file-chip">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>
                                        <span>{file.name}</span>
                                        <button type="button" onClick={() => removeFile(file.id)}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                <div className="unified-rag-bottom">
                                  <button className="btn-attach-new" onClick={handleFileAttach}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                                    파일 첨부
                                  </button>
                                  <button className="btn-submit-new" onClick={handleUploadKnowledge} disabled={isUploading || (!ragInput.trim() && ragFiles.length === 0 && ragTexts.length === 0)}>
                                    {isUploading ? <svg className="spinner" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg> : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>}
                                  </button>
                                </div>
                              </div>
                            </div>

                            <div>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: isKnowledgeListOpen ? "8px" : "0" }}>
                                <button className="btn-icon" onClick={() => setIsKnowledgeListOpen(!isKnowledgeListOpen)} style={{ padding: "6px", margin: "-6px" }}>
                                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
                                </button>
                                {isKnowledgeListOpen && <label style={{ fontSize: "13px", color: "#e2e8f0", fontWeight: 600, margin: 0, whiteSpace: "nowrap" }}>저장된 지식 목록 ({savedKnowledge.length})</label>}
                              </div>
                              {isKnowledgeListOpen && (
                                savedKnowledge.length === 0 ? (
                                  <div style={{ padding: "32px 20px", textAlign: "center", border: "1px dashed #4a5568", borderRadius: "8px", color: "#718096", fontSize: "13px", backgroundColor: "rgba(0,0,0,0.2)", marginTop: "8px" }}>업로드된 지식 데이터가 없습니다.</div>
                                ) : (
                                  <div className="knowledge-list-wrap">
                                    {savedKnowledge.map((item) => (
                                      <div key={item.id} className={`knowledge-item ${selectedKnowledgeIds.includes(item.id) ? "selected" : ""}`} onClick={() => handleToggleKnowledgeSelection(item.id)}>
                                        <div className="knowledge-info">
                                          <input type="checkbox" className="knowledge-checkbox" checked={selectedKnowledgeIds.includes(item.id)} readOnly />
                                          <div className="knowledge-icon">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                              {item.type === "document" ? <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/> : <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>}
                                            </svg>
                                          </div>
                                          <div className="knowledge-details">
                                            <span className="knowledge-name" title={item.name}>{item.name}</span>
                                            <span className="knowledge-date">{item.date} 업로드됨</span>
                                          </div>
                                        </div>
                                        <div style={{ display: "flex", gap: "4px" }}>
                                          <button className="btn-icon" title="불러오기(수정)" onClick={(e) => { e.stopPropagation(); handleEditKnowledge(item); }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
                                          <button className="btn-icon danger" title="삭제" onClick={(e) => { e.stopPropagation(); setSavedKnowledge((prev) => prev.filter((k) => k.id !== item.id)); setSelectedKnowledgeIds((prev) => prev.filter((id) => id !== item.id)); }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* ── MCP 설정 ── */}
                      {selectedStage === "mcp" && (
                        <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px" }}>
                            <h2 style={{ fontSize: "16px", fontWeight: "800", color: "#fff", margin: 0 }}>디렉토리 목록</h2>
                            <button className="btn-klever-sync" style={{ padding: "10px 24px", borderRadius: "12px", fontSize: "13px" }} onClick={() => setIsAddDirModalOpen(true)}>+ 디렉토리 생성</button>
                          </div>
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "20px" }}>
                            {mcpDirectories.length > 0 ? mcpDirectories.map((dir) => (
                              <div key={dir.id} className="setting-card glass-card" style={{ padding: 0, overflow: "hidden", border: "1px solid var(--border-glass)", transition: "all 0.3s" }}>
                                <div onClick={() => toggleDirectory(dir.id)} style={{ padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", borderBottom: "1px solid var(--border-glass)", background: "rgba(255,255,255,0.02)" }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                    <span style={{ color: "var(--accent)", fontSize: "14px", transform: dir.isOpen ? "rotate(0deg)" : "rotate(-90deg)", transition: "0.3s" }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="6 9 12 15 18 9"/></svg></span>
                                    <div style={{ display: "flex", flexDirection: "column" }}>
                                      <span style={{ color: "#fff", fontSize: "15px", fontWeight: "700" }}>{dir.name}</span>
                                      <span style={{ color: "var(--text-muted)", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.05em" }}>{dir.items.length} Units</span>
                                    </div>
                                  </div>
                                  <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                                    <button onClick={(e) => handleDeleteDirectory(dir.id, e)} style={{ background: "none", border: "none", color: "#718096", cursor: "pointer", padding: "4px", display: "flex", alignItems: "center" }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg></button>
                                    <div onClick={(e) => toggleDirectoryActive(dir.id, e)} style={{ width: "36px", height: "18px", backgroundColor: dir.active ? "var(--accent)" : "#1e293b", borderRadius: "18px", position: "relative", cursor: "pointer" }}><div style={{ width: "12px", height: "12px", backgroundColor: "#fff", borderRadius: "50%", position: "absolute", left: dir.active ? "22px" : "2px", top: "3px", transition: "0.2s" }} /></div>
                                  </div>
                                </div>
                                {dir.isOpen && (
                                  <div style={{ padding: "20px", backgroundColor: "rgba(0,0,0,0.2)" }}>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
                                      {dir.items.map((item) => (
                                        <div key={item.id} className="glass-card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)", backgroundColor: "rgba(255,255,255,0.01)" }}>
                                          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                            <span style={{ color: "#fff", fontSize: "13px", fontWeight: "600" }}>{item.name}</span>
                                            {item.url && <span style={{ color: "var(--text-muted)", fontSize: "10px", fontFamily: "var(--f-mono)", opacity: 0.7 }}>{item.method || "GET"} {item.url.substring(0, 28)}...</span>}
                                          </div>
                                          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                                            <button style={{ padding: "5px 10px", fontSize: "11px", color: "var(--text-secondary)", border: "1px solid var(--border-glass)", borderRadius: "6px", background: "rgba(255,255,255,0.03)", cursor: "pointer" }} onClick={() => { setTargetDirId(dir.id); setTargetItemId(item.id); setNewApiName(item.name); setNewApiUrl(item.url || ""); setNewApiMethod(item.method || "GET"); setNewApiKey(item.apiKey || ""); if (item.params) setNewApiParams(item.params.length > 0 ? item.params : [{ key: "", type: "String", desc: "" }]); setIsAddItemModalOpen(true); }}>수정</button>
                                            <button style={{ padding: "5px 10px", fontSize: "11px", color: "#fca5a5", border: "1px solid rgba(248,113,113,0.2)", borderRadius: "6px", background: "rgba(248,113,113,0.05)", cursor: "pointer" }} onClick={() => handleDeleteApiItem(dir.id, item.id)}>삭제</button>
                                            <div onClick={(e) => toggleItemActive(dir.id, item.id, e)} style={{ width: "32px", height: "16px", backgroundColor: item.active ? "var(--accent)" : "#2d3748", borderRadius: "16px", position: "relative", cursor: "pointer" }}><div style={{ width: "10px", height: "10px", backgroundColor: "#fff", borderRadius: "50%", position: "absolute", left: item.active ? "20px" : "2px", top: "3px", transition: "0.2s" }} /></div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                    <button style={{ padding: "12px", border: "1px solid #4a5568", borderRadius: "10px", fontSize: "12px", color: "#718096", background: "rgba(255,255,255,0.02)", cursor: "pointer", width: "100%", fontWeight: "600" }} onClick={() => { setTargetDirId(dir.id); setTargetItemId(null); setNewApiName(""); setNewApiUrl(""); setNewApiMethod("GET"); setNewApiKey(""); setNewApiParams([{ key: "", type: "String", desc: "" }]); setIsAddItemModalOpen(true); }}>+ 새 항목 추가</button>
                                  </div>
                                )}
                              </div>
                            )) : (
                              <div style={{ gridColumn: "1 / -1", padding: "60px 40px", textAlign: "center", color: "var(--text-muted)", backgroundColor: "rgba(255,255,255,0.01)", borderRadius: "20px", border: "1px solid var(--border-glass)" }}>등록된 디렉토리가 없습니다.</div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* ── 프롬프팅 설정 ── */}
                      {selectedStage === "prompt" && (
                        <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                          <div style={{ display: "flex", justifyContent: "flex-end" }}>
                            <div className="mode-toggle-group">
                              <button className={`mode-toggle-btn ${promptMode === "tag" ? "active" : ""}`} onClick={() => setPromptMode("tag")}>태그 모드</button>
                              <button className={`mode-toggle-btn ${promptMode === "manual" ? "active" : ""}`} onClick={() => setPromptMode("manual")}>직접 입력</button>
                            </div>
                          </div>
                          {promptMode === "tag" && (
                            <div>
                              <h4 style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "12px", fontWeight: "600" }}>태그 설정</h4>
                              <div style={{ border: "1px solid #2d3748", borderRadius: "14px", padding: "12px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                                {promptTagOptions.map((tag) => {
                                  const isActive = selectedTags.includes(tag.id);
                                  return (
                                    <div key={tag.id} onClick={() => togglePromptTag(tag.id)} style={{ padding: "8px 12px", borderRadius: "10px", border: "1px solid " + (isActive ? "var(--accent)" : "#2d3748"), backgroundColor: isActive ? "rgba(0,198,255,0.15)" : "transparent", color: isActive ? "#fff" : "var(--text-muted)", fontSize: "12px", fontWeight: "600", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", cursor: "pointer" }}>
                                      {isActive && <span>✓</span>}{tag.label}
                                    </div>
                                  );
                                })}
                                {customTags.map((tag) => {
                                  const isActive = selectedTags.includes(tag.id);
                                  return (
                                    <div key={tag.id} onClick={() => togglePromptTag(tag.id)} style={{ position: "relative", padding: "8px 12px", borderRadius: "10px", border: "1px solid " + (isActive ? "var(--accent)" : "#2d3748"), backgroundColor: isActive ? "rgba(0,198,255,0.15)" : "transparent", color: isActive ? "#fff" : "var(--text-muted)", fontSize: "12px", fontWeight: "600", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", cursor: "pointer" }}>
                                      {isActive && <span>✓</span>}{tag.label}
                                      <button type="button" className="prompt-tag-remove" onClick={(e) => handleRemoveCustomTag(e, tag.id)} style={{ position: "absolute", right: "8px" }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
                                    </div>
                                  );
                                })}
                                <div style={{ gridColumn: "span 2", padding: "1px", borderRadius: "12px", border: "1px solid #4a5568", background: "rgba(255,255,255,0.02)" }}>
                                  <div style={{ display: "flex", alignItems: "center" }}>
                                    <input type="text" placeholder="+ 태그 직접 입력 후 Enter" style={{ flex: 1, border: "none", background: "none", color: "#718096", fontSize: "12px", fontWeight: "600", padding: "8px 12px", outline: "none" }} value={customTagInput} onChange={(e) => setCustomTagInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddCustomTag(); } }} />
                                    <button className="btn-add-tag" onClick={handleAddCustomTag} style={{ margin: "4px" }}>추가</button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                          {promptMode === "manual" && (
                            <div>
                              <h4 style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "12px", fontWeight: "600" }}>직접 입력</h4>
                              <textarea className="manual-prompt-textarea" placeholder="당신은 KLEVER ONE의 안내 에이전트입니다..." value={manualPrompt} onChange={(e) => setManualPrompt(e.target.value)} style={{ height: "280px" }} />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════
              TAB 3: 동작 설정
          ════════════════════════════════════════ */}
          {activeTab === "widget" && (
            <div className="tab-pane fade-in">
              <div className="setting-card">
                <h3 className="card-title">{i18n[uiLang]?.layoutTitle}</h3>
                <p className="card-desc">{i18n[uiLang]?.layoutDesc}</p>
                <div className="layout-selector">
                  {layoutOptions.map((option) => (
                    <div key={option.id} className={`layout-item ${layout === option.id ? "selected" : ""}`} onClick={() => setLayout(option.id)}>
                      <div className="layout-preview"><div className="browser-mockup"><div className={`widget-box ${option.boxClass}`} /></div></div>
                      <span>{option.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="setting-card">
                <h3 className="card-title">{i18n[uiLang]?.timeTitle}</h3>
                <div className="form-group mt-2" style={{ maxWidth: "350px" }}>
                  <label>{i18n[uiLang]?.timeDesc}</label>
                  <div style={{ display: "flex", gap: "16px", width: "100%" }} className="mt-2">
                    <div className="input-with-unit" style={{ flex: 1 }}><input type="number" className="custom-input" value={autoOff} onChange={(e) => setAutoOff(e.target.value)} min="0" /><span className="unit">분</span></div>
                    <div className="input-with-unit" style={{ flex: 1 }}><input type="number" className="custom-input" value={autoOffSec} onChange={(e) => setAutoOffSec(e.target.value)} min="0" max="59" /><span className="unit">초</span></div>
                  </div>
                </div>
              </div>

              <div className="setting-card">
                <h3 className="card-title">{i18n[uiLang]?.codeTitle}</h3>
                <p className="card-desc">{i18n[uiLang]?.codeDesc}</p>
                <div className="code-tabs">
                  <button className={`code-tab-btn ${codeTab === "vanilla" ? "active" : ""}`} onClick={() => setCodeTab("vanilla")}>HTML (JS/TS)</button>
                  <button className={`code-tab-btn ${codeTab === "react" ? "active" : ""}`} onClick={() => setCodeTab("react")}>React (JSX/TSX)</button>
                </div>
                <div className="code-container" style={{ marginTop: 0 }}>
                  <button className="btn-copy-code" onClick={handleCopyEmbedCode}>복사하기</button>
                  <pre>{getEmbedCode()}</pre>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── 챗봇 / 디지털 휴먼 렌더링 영역 ── */}
      <div id="chatbot-wrapper">
       {chatbotType === "sdk" ? (
        <DigitalHuman apiKey={import.meta.env.VITE_KLEVER_API_KEY} layout={layout} />
      ) : (
        <BasicChatbot 
          unrealurl={import.meta.env.VITE_MATCHMAKER}
          layout={layout}
          autoOff={autoOff * 60 + autoOffSec}
          avatarnum={currentAvatarNum}       
          analysisLlm={savedAgent.engines?.analysis || "gpt"}
          ragLlm={savedAgent.engines?.rag || "gpt"}
          responseLlm={savedAgent.engines?.response || "gpt"}
          assistantId={savedAgent.assistantId || ""} 
          promptMode={savedAgent.promptMode || "tag"}
          promptTags={resolvedPromptTags} 
          promptManual={savedAgent.promptManual || ""}
        />
      )}
      </div>

      {/* ════ 모달 UI (디렉토리 추가) - 디자인 깨짐 수정 ════ */}
      {isAddDirModalOpen && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: "420px", textAlign: "left", padding: "28px" }}>
            <h2 className="modal-title" style={{ marginBottom: "8px", fontSize: "20px" }}>디렉토리 생성</h2>
            <p className="modal-desc" style={{ marginBottom: "24px" }}>MCP 도구들을 분류할 새로운 그룹을 만듭니다.</p>
            <div className="form-group" style={{ marginBottom: "16px" }}>
              <label style={{ fontWeight: "600", marginBottom: "8px", display: "block" }}>디렉토리명</label>
              <input type="text" className="custom-input" value={newDirName} onChange={(e) => setNewDirName(e.target.value)} placeholder="예: 외부 연동 API, 팀 자료 등" autoFocus onKeyDown={(e) => { if (e.key === "Enter") handleAddDirectory(); }} />
            </div>
            <div className="form-group" style={{ marginBottom: "32px" }}>
              <label style={{ fontWeight: "600", marginBottom: "8px", display: "block" }}>설명 (선택)</label>
              <textarea className="custom-input" style={{ height: "80px", resize: "none" }} value={newDirDesc} onChange={(e) => setNewDirDesc(e.target.value)} placeholder="디렉토리에 대한 설명을 입력하세요." />
            </div>
            <div className="modal-buttons" style={{ gap: "12px", display: "flex" }}>
              <button className="btn-outline" style={{ flex: 1 }} onClick={() => { setIsAddDirModalOpen(false); setNewDirName(""); setNewDirDesc(""); }}>취소</button>
              <button className="btn-primary" style={{ flex: 1.5 }} onClick={handleAddDirectory}>추가하기</button>
            </div>
          </div>
        </div>
      )}

      {/* ════ 모달 UI (항목 추가) - 디자인 깨짐 수정 ════ */}
      {isAddItemModalOpen && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: "600px", textAlign: "left", padding: "28px" }}>
            <h2 className="modal-title" style={{ marginBottom: "8px", fontSize: "20px" }}>{targetItemId ? "항목 수정" : "새 항목 추가"}</h2>
            <p className="modal-desc" style={{ marginBottom: "24px" }}>연결할 외부 API 엔드포인트와 파라미터를 상세히 정의하십시오.</p>
            
            <div style={{ display: "flex", gap: "16px", marginBottom: "16px" }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label style={{ fontWeight: "600", marginBottom: "8px", display: "block" }}>API 명칭</label>
                <input type="text" className="custom-input" value={newApiName} onChange={(e) => setNewApiName(e.target.value)} placeholder="예: 날씨 데이터" />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label style={{ fontWeight: "600", marginBottom: "8px", display: "block" }}>Method</label>
                <select className="custom-select" value={newApiMethod} onChange={(e) => setNewApiMethod(e.target.value)}>
                  <option value="GET">GET (데이터 조회)</option>
                  <option value="POST">POST (데이터 생성)</option>
                </select>
              </div>
            </div>
            
            <div className="form-group" style={{ marginBottom: "16px" }}>
              <label style={{ fontWeight: "600", marginBottom: "8px", display: "block" }}>엔드포인트 URL</label>
              <input type="text" className="custom-input" value={newApiUrl} onChange={(e) => setNewApiUrl(e.target.value)} placeholder="https://api.example.com/v1/data" />
            </div>
            
            <div className="form-group" style={{ marginBottom: "24px" }}>
              <label style={{ fontWeight: "600", marginBottom: "8px", display: "block" }}>Auth Token (API 키 - 선택사항)</label>
              <input type="text" className="custom-input" value={newApiKey} onChange={(e) => setNewApiKey(e.target.value)} placeholder="Bearer token..." />
            </div>
            
            <div style={{ border: "1px solid #4a5568", borderRadius: "12px", padding: "16px", backgroundColor: "rgba(0,0,0,0.15)", marginBottom: "32px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <label style={{ fontSize: "13px", color: "#e2e8f0", fontWeight: "700", margin: 0 }}>파라미터 (Parameters)</label>
                <button onClick={handleAddParam} style={{ background: "transparent", color: "#00c6ff", border: "1px solid #00c6ff", padding: "4px 10px", borderRadius: "6px", fontSize: "12px", cursor: "pointer" }}>+ 추가</button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "150px", overflowY: "auto", paddingRight: "4px" }}>
                {newApiParams.map((param, idx) => (
                  <div key={idx} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <input type="text" placeholder="Key (예: city)" className="custom-input" style={{ flex: 1, padding: "8px" }} value={param.key} onChange={(e) => updateParam(idx, "key", e.target.value)} />
                    <select className="custom-select" style={{ width: "90px", padding: "8px", backgroundPosition: "right 5px center" }} value={param.type} onChange={(e) => updateParam(idx, "type", e.target.value)}>
                      <option>String</option><option>Number</option><option>Boolean</option>
                    </select>
                    <input type="text" placeholder="설명 (예: 도시 이름)" className="custom-input" style={{ flex: 1.5, padding: "8px" }} value={param.desc} onChange={(e) => updateParam(idx, "desc", e.target.value)} />
                    {newApiParams.length > 1 && (
                      <button onClick={() => removeParam(idx)} style={{ background: "none", border: "none", color: "#e53e3e", cursor: "pointer", padding: "4px" }}>✕</button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="modal-buttons" style={{ gap: "12px", display: "flex" }}>
              <button className="btn-outline" style={{ flex: 1 }} onClick={() => { setIsAddItemModalOpen(false); setNewApiName(""); setNewApiUrl(""); setNewApiMethod("GET"); setNewApiKey(""); setNewApiParams([{ key: "", type: "String", desc: "" }]); setTargetDirId(null); setTargetItemId(null); }}>취소</button>
              <button className="btn-primary" style={{ flex: 1.5 }} onClick={handleAddApiItem}>{targetItemId ? "수정완료" : "추가하기"}</button>
            </div>
          </div>
        </div>
      )}

      {/* ════ 기타 모달 (저장, 삭제, 재발급 등) ════ */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h2 className="modal-title">저장하시겠습니까?</h2>
            <p className="modal-desc">설정하신 에이전트 정보가<br />라이브 서버에 즉시 적용됩니다.</p>
            <div className="modal-buttons">
              <button className="btn-outline" onClick={() => setIsModalOpen(false)}>취소</button>
              <button className="btn-primary" onClick={confirmSave}>적용</button>
            </div>
          </div>
        </div>
      )}

      {isExitModalOpen && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-logo"><span>KLEVER ONE</span></div>
            <p className="modal-desc">클레버원 홈페이지로 돌아가시겠어요?<br />저장하지 않은 변경사항은 사라질 수 있습니다.</p>
            <div className="modal-buttons">
              <button className="btn-outline" onClick={() => setIsExitModalOpen(false)}>취소</button>
              <button className="btn-danger" onClick={() => { setIsExitModalOpen(false); window.open("https://www.klever-one.com/", "_blank"); }}>나가기</button>
            </div>
          </div>
        </div>
      )}

      {isNewKeyModalOpen && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h2 className="modal-title">신규 키 발급</h2>
            <p className="modal-desc" style={{ marginBottom: "16px" }}>새로 발급할 에이전트 키의 이름을 지정하세요.</p>
            <input type="text" className="custom-input" style={{ marginBottom: "24px", textAlign: "center" }}
              value={newKeyNameInput} onChange={(e) => setNewKeyNameInput(e.target.value)} placeholder="예: 영업용 챗봇 키" autoFocus
              onKeyDown={(e) => { if (e.key === "Enter") confirmGenerateNewKey(); }} />
            <div className="modal-buttons">
              <button className="btn-outline" onClick={() => setIsNewKeyModalOpen(false)}>취소</button>
              <button className="btn-primary" onClick={confirmGenerateNewKey}>발급하기</button>
            </div>
          </div>
        </div>
      )}

      {alertMessage && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h2 className="modal-title">알림</h2>
            <p className="modal-desc" style={{ marginBottom: "24px" }}>{alertMessage}</p>
            <div className="modal-buttons">
              <button className="btn-primary" onClick={() => setAlertMessage("")}>확인</button>
            </div>
          </div>
        </div>
      )}

      {deleteTargetId && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h2 className="modal-title">키 삭제</h2>
            <p className="modal-desc" style={{ marginBottom: "24px" }}>이 API 키를 삭제하시겠습니까?<br />연결된 에이전트가 작동하지 않을 수 있습니다.</p>
            <div className="modal-buttons">
              <button className="btn-outline" onClick={() => setDeleteTargetId(null)}>취소</button>
              <button className="btn-danger" onClick={confirmDeleteKey}>삭제</button>
            </div>
          </div>
        </div>
      )}

      {reissueTargetId && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h2 className="modal-title">키 재발급</h2>
            <p className="modal-desc" style={{ marginBottom: "24px" }}>이 API 키의 재발급을 신청하시겠습니까?<br />새로운 키가 발급되면 기존 키로 연결된 에이전트는 더 이상 작동하지 않습니다.</p>
            <div className="modal-buttons">
              <button className="btn-outline" onClick={() => setReissueTargetId(null)}>취소</button>
              <button className="btn-primary" onClick={confirmReissueKey}>재발급</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}