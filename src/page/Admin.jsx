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
    codeDesc: "사용하시는 환경에 맞는 코드를 복사하여 웹사이트에 붙여넣으세요. 설정하신 값들이 적용된 에이전트가 즉시 표시됩니다."
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
    codeDesc: "Copy and paste the appropriate code for your environment into your website. The agent will be displayed immediately."
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
    codeDesc: "将适合您环境的代码复制并粘贴到您的网站中。设置将立即生效。"
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
    llmDesc: "Chọn mô hình ngôn ngữ cơ sở làm bộ脑 của đại lý.",
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
    codeDesc: "Sao chép và dán mã thích hợp cho môi trường của bạn vào trang web. Đại lý sẽ hiển thị ngay lập tức."
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
    codeDesc: "環境に適したコードをコピーしてウェブサイトに貼り付けます。エージェントはすぐに表示されます。"
  }
};

export default function Admin({chatbotType}) {
  const [uiLang, setUiLang] = useState("ko");
  const [activeTab, setActiveTab] = useState("agent");

  const [apiKeys, setApiKeys] = useState([
    {
      id: 1,
      name: "chilloen",
      value: "sk-live-a1b2c3d4e5f6g7h8i9j0",
      date: "2026-04-07",
      character: "chanu", 
      voice: "",     
      language: "ko",
      llm: "gpt",
      assistantId: "",
      promptMode: "tag",
      promptTags: ["no_politics", "no_religion", "no_social_controversy", "no_profanity", "polite_tone"],
      customTags: [],
      promptManual: ""
    }
  ]);
  const [selectedAgentId, setSelectedAgentId] = useState(1); 
  
  const [uiCharacter, setUiCharacter] = useState("chanu");
  const [uiLlmType, setUiLlmType] = useState("gpt"); 
  const [uiRagType, setUiRagType] = useState("none"); 

  const [customLlmUrl, setCustomLlmUrl] = useState("");
  const [nativeRagId, setNativeRagId] = useState("");
  const [externalRagUrl, setExternalRagUrl] = useState("");

  const [layout, setLayout] = useState("bottom-right");
  const [autoOff, setAutoOff] = useState(15);
  const [autoOffSec, setAutoOffSec] = useState(0);

  const [ragInput, setRagInput] = useState("");
  const [ragFiles, setRagFiles] = useState([]);
  const [ragTexts, setRagTexts] = useState([]);
  const [isDragging, setIsDragging] = useState(false); 
  const [isUploading, setIsUploading] = useState(false);
  const [isKnowledgeListOpen, setIsKnowledgeListOpen] = useState(false);
  
  const [autoAssistantId, setAutoAssistantId] = useState("");
  const [lastVerifiedVsId, setLastVerifiedVsId] = useState("");

  const [savedKnowledge, setSavedKnowledge] = useState([]);
  const [selectedKnowledgeIds, setSelectedKnowledgeIds] = useState([]);

  const [ragCache, setRagCache] = useState({
    gpt: { nativeRagId: "", autoAssistantId: "", savedKnowledge: [] },
    gemini: { nativeRagId: "", autoAssistantId: "", savedKnowledge: [] },
    llamon: { nativeRagId: "", autoAssistantId: "", savedKnowledge: [] }
  });

  const fileInputRef = useRef(null);
  
  // 🚨 [핵심 방어 코드] 이전 선택된 에이전트 ID를 기억
  const prevAgentIdRef = useRef(null);

  const [mcpList, setMcpList] = useState([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const toggleButton = document.querySelector(".fw-toggle");
      if (toggleButton) {
        toggleButton.click();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const agent = apiKeys.find(a => a.id === selectedAgentId);
    if (agent) {
       const currentLlm = agent.llm || "gpt";
       setUiCharacter(agent.character || "chanu");
       setUiLlmType(currentLlm);
       
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

       // 💡 [핵심 로직] 에이전트가 진짜로 교체된 경우에만 폼을 비움
       const isAgentSwitch = prevAgentIdRef.current !== selectedAgentId;
       prevAgentIdRef.current = selectedAgentId;

       if (isAgentSwitch) {
         setRagCache({
           gpt: { nativeRagId: currentLlm === 'gpt' ? loadedAssistantId : "", autoAssistantId: currentLlm === 'gpt' ? loadedAssistantId : "", savedKnowledge: [] },
           gemini: { nativeRagId: currentLlm === 'gemini' ? loadedAssistantId : "", autoAssistantId: currentLlm === 'gemini' ? loadedAssistantId : "", savedKnowledge: [] },
           llamon: { nativeRagId: "", autoAssistantId: "", savedKnowledge: [] }
         });

         setSavedKnowledge([]);
         setSelectedKnowledgeIds([]);
         setRagInput("");
         setRagFiles([]);
         setRagTexts([]);
       }
    }
  }, [selectedAgentId, apiKeys]); 

  const handleLlmChange = (e) => {
    const newLlm = e.target.value;
    if (newLlm !== uiLlmType) {
      setRagCache(prev => ({
        ...prev,
        [uiLlmType]: { nativeRagId, autoAssistantId, savedKnowledge }
      }));

      const nextCache = ragCache[newLlm] || { nativeRagId: "", autoAssistantId: "", savedKnowledge: [] };
      setNativeRagId(nextCache.nativeRagId || "");
      setAutoAssistantId(nextCache.autoAssistantId || "");
      setSavedKnowledge(nextCache.savedKnowledge || []);
      
      setUiLlmType(newLlm);
      
      setSelectedKnowledgeIds([]);
      setRagInput("");
      setRagFiles([]);
      setRagTexts([]);
    }
  };

  const handleVectorIdFinish = async () => {
    setIsUploading(true); 
    const result = await processVectorIdFinish(nativeRagId, uiLlmType, uiRagType, lastVerifiedVsId);
    if (!result.skip) {
      if (result.success) {
        setAutoAssistantId(result.assistantId);
        setLastVerifiedVsId(result.currentId);
      } else {
        setAlertMessage(result.message);
      }
    }
    setIsUploading(false);
  };

  const handleFileAttach = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const newFiles = files.map((file) => ({
        id: Date.now() + Math.random(),
        name: file.name,
        fileObject: file,
      }));
      setRagFiles([...ragFiles, ...newFiles]);
    }
    e.target.value = null;
  };

  const removeFile = (id) => {
    setRagFiles(ragFiles.filter((f) => f.id !== id));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const newFiles = files.map((file) => ({
        id: Date.now() + Math.random(),
        name: file.name,
        fileObject: file, 
      }));
      setRagFiles([...ragFiles, ...newFiles]);
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
            const pureText = doc.body.textContent || "";
            return pureText.replace(/\s+/g, ' ').trim(); 
          } catch (e) {
            console.warn("URL 크롤링 실패:", e);
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
          
          combinedFiles.push({
            id: `txt_${Date.now()}`,
            name: "웹사이트_및_텍스트_학습데이터.txt", 
            fileObject: textFile 
          });
        }

        const geminiAssistantId = await processKnowledgeUpload(combinedFiles, uiLlmType, uiRagType, nativeRagId);
        if (geminiAssistantId) {
          setAutoAssistantId(geminiAssistantId);
        }

        const newBundle = createBundle(ragInput, ragTexts, ragFiles);
        setSavedKnowledge([newBundle, ...savedKnowledge]);
        setSelectedKnowledgeIds([...selectedKnowledgeIds, newBundle.id]);
        
        const serverName = uiLlmType === "gpt" ? "OpenAI Vector Store" : "Gemini 서버";
        setAlertMessage(`데이터가 성공적으로 ${serverName}에 업로드 되었습니다.\n(URL 스크랩 완료)`);

        setRagInput("");
        setRagFiles([]);
        setRagTexts([]);
        
        if (!isKnowledgeListOpen) {
            setIsKnowledgeListOpen(true);
        }

      } catch (error) {
        console.error("RAG Upload Error:", error);
        setAlertMessage(error.message || "업로드 중 알 수 없는 오류가 발생했습니다.");
      } finally {
        setIsUploading(false);
      }
    }, 100); 
  };

  const handleToggleKnowledgeSelection = (id) => {
    if (selectedKnowledgeIds.includes(id)) {
      setSelectedKnowledgeIds(selectedKnowledgeIds.filter(kId => kId !== id));
    } else {
      setSelectedKnowledgeIds([...selectedKnowledgeIds, id]);
    }
  };

  const handleEditKnowledge = (itemToEdit) => {
    setSavedKnowledge(savedKnowledge.filter(item => item.id !== itemToEdit.id));
    setSelectedKnowledgeIds(selectedKnowledgeIds.filter(id => id !== itemToEdit.id));

    const newTexts = [];
    const newFiles = [];

    itemToEdit.items.forEach(subItem => {
      if (subItem.type === 'text' || subItem.type === 'url') {
        newTexts.push({ id: subItem.id, type: subItem.type, content: subItem.content });
      } else if (subItem.type === 'document') {
        newFiles.push({ id: subItem.id, name: subItem.content, fileObject: subItem.fileObject });
      }
    });

    setRagTexts([...ragTexts, ...newTexts]);
    setRagFiles([...ragFiles, ...newFiles]);
  };

  const removeRagText = (id) => {
    setRagTexts(ragTexts.filter((item) => item.id !== id));
  };

  const handleRagKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (ragInput.trim()) {
        const isUrl = ragInput.startsWith("http://") || ragInput.startsWith("https://");
        setRagTexts([
          ...ragTexts, 
          { id: Date.now(), type: isUrl ? 'url' : 'text', content: ragInput.trim() }
        ]);
        setRagInput("");
      }
    }
  };

  const [selectedTags, setSelectedTags] = useState(["no_politics", "no_religion", "no_social_controversy", "no_profanity", "polite_tone"]);
  const [promptMode, setPromptMode] = useState("tag");
  const [customTags, setCustomTags] = useState([]);
  const [customTagInput, setCustomTagInput] = useState("");
  const [manualPrompt, setManualPrompt] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [isNewKeyModalOpen, setIsNewKeyModalOpen] = useState(false);
  const [newKeyNameInput, setNewKeyNameInput] = useState("");

  const [isMcpModalOpen, setIsMcpModalOpen] = useState(false);
  const [newMcpName, setNewMcpName] = useState("");
  const [newMcpUrl, setNewMcpUrl] = useState("");
  const [newMcpMethod, setNewMcpMethod] = useState("GET"); // 🚀 추가됨: Method 속성
  const [newMcpApiKey, setNewMcpApiKey] = useState("");
  const [newMcpParams, setNewMcpParams] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [codeTab, setCodeTab] = useState("vanilla");

  const [alertMessage, setAlertMessage] = useState("");
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [reissueTargetId, setReissueTargetId] = useState(null);
  const [selectedMcpDetail, setSelectedMcpDetail] = useState(null);

  useEffect(() => {
    loadSavedConfig(setApiKeys, setLayout, setAutoOff, setAutoOffSec, setMcpList);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsModalOpen(false);
        setIsExitModalOpen(false);
        setIsNewKeyModalOpen(false);
        setIsMcpModalOpen(false);
        setAlertMessage("");
        setDeleteTargetId(null);
        setReissueTargetId(null);
        setSelectedMcpDetail(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (uiRagType === "native" && uiLlmType === "custom") {
      setUiRagType("none");
    }
  }, [uiLlmType, uiRagType]);

  const isFormValid = 
    apiKeys.length > 0 &&
    uiLlmType !== "" &&
    (uiLlmType !== "custom" || customLlmUrl.trim() !== "") &&
    (uiRagType !== "external" || externalRagUrl.trim() !== "") &&
    uiCharacter;

  const handleReset = () => {
    setApiKeys([
      {
        id: 1,
        name: "chilloen",
        value: "sk-live-a1b2c3d4e5f6g7h8i9j0",
        date: "2026-04-07",
        character: "chanu",
        voice: "",
        language: "ko",
        llm: "gpt",
        assistantId: "",
        promptMode: "tag", 
        promptTags: ["no_politics", "no_religion", "no_social_controversy", "no_profanity", "polite_tone"], 
        customTags: [],
        promptManual: "" 
      }
    ]);
    setSelectedAgentId(1);
    setUiCharacter("chanu");
    setUiLlmType("gpt");
    setUiRagType("none");
    setLayout("bottom-right");
    setAutoOff(15);
    setAutoOffSec(0);
    setSelectedTags(["no_politics", "no_religion", "no_social_controversy", "no_profanity", "polite_tone"]);
    setPromptMode("tag");
    setCustomTags([]);
    setCustomTagInput("");
    setManualPrompt("");
  };

  const handleCopySpecificKey = (value) => {
    try {
      const textArea = document.createElement("textarea");
      textArea.value = value;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setAlertMessage("API 키가 클립보드에 복사되었습니다!");
    } catch (err) {
      console.error("복사 실패", err);
    }
  };

  const handleGenerateNewKey = () => {
    setNewKeyNameInput(`신규 에이전트 키 #${apiKeys.length + 1}`);
    setIsNewKeyModalOpen(true);
  };

  const confirmGenerateNewKey = () => {
    if (!newKeyNameInput.trim()) return;

    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let newKey = "sk-live-";
    for (let i = 0; i < 24; i++) {
      newKey += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    const newKeyObj = {
      id: Date.now(),
      name: newKeyNameInput.trim(),
      value: newKey,
      date: dateStr,
      character: "chanu",
      voice: "",
      language: "ko",
      llm: "gpt",
      assistantId: "",
      promptMode: "tag", 
      promptTags: ["no_politics", "no_religion", "no_social_controversy", "no_profanity", "polite_tone"], 
      customTags: [],
      promptManual: "" 
    };
    
    setApiKeys([newKeyObj, ...apiKeys]);
    setSelectedAgentId(newKeyObj.id);
    setIsNewKeyModalOpen(false);
  };

  const handleReissueKey = (id) => {
    setReissueTargetId(id);
  };

  const handleDeleteKey = (id) => {
    if (apiKeys.length === 1) {
      setAlertMessage("최소 1개의 API 키는 유지해야 합니다.");
      return;
    }
    setDeleteTargetId(id);
  };

  const confirmReissueKey = () => {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let newKey = "sk-live-";
    for (let i = 0; i < 24; i++) {
      newKey += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    setApiKeys(apiKeys.map(keyObj => 
      keyObj.id === reissueTargetId ? { ...keyObj, value: newKey, date: dateStr } : keyObj
    ));
    
    setReissueTargetId(null);
    setAlertMessage("API 키 재발급 요청이 정상적으로 접수되었습니다.");
  };

  const confirmDeleteKey = () => {
    setApiKeys(apiKeys.filter(k => k.id !== deleteTargetId));
    setDeleteTargetId(null);
  };

  const confirmAddMcp = () => {
    if (!newMcpName.trim() || !newMcpUrl.trim()) {
      setAlertMessage("API 이름과 엔드포인트 URL을 모두 입력해주세요. (API 키는 선택)");
      return;
    }

    const invalidParams = newMcpParams.filter(p => !p.key.trim());
    if (invalidParams.length > 0) {
      setAlertMessage("추가한 모든 파라미터의 '키(Key)'를 입력해주세요.");
      return;
    }

    const newMcp = {
      id: `custom_mcp_${Date.now()}`,
      name: newMcpName.trim(),
      desc: newMcpUrl.trim(),
      type: "custom",
      method: newMcpMethod, // 🚀 추가된 Method 전달
      active: true,
      apiKey: newMcpApiKey.trim(),
      parameters: newMcpParams.map(p => ({
        key: p.key.trim(),
        type: p.type,
        desc: p.desc.trim()
      }))
    };

    const updatedMcpList = [...mcpList, newMcp];
    syncMcpToStorage(updatedMcpList, setMcpList);
    
    setIsMcpModalOpen(false);
    setNewMcpName("");
    setNewMcpUrl("");
    setNewMcpMethod("GET"); // 초기화
    setNewMcpApiKey("");
    setNewMcpParams([]);
  };

  const handleSaveClick = () => {
    setIsModalOpen(true);
  };

  const confirmSave = () => { 
    setIsModalOpen(false); 
    
    saveConfiguration({
      apiKeys, selectedAgentId, uiCharacter, uiLlmType, uiRagType,
      autoAssistantId, promptMode, selectedTags, customTags, manualPrompt,
      layout, autoOff, autoOffSec, digitalHumans, mcpList, setApiKeys
    });
    
    setAlertMessage("성공적으로 적용되었습니다!"); 
  };

  const cancelSave = () => {
    setIsModalOpen(false);
  };

  const handleExitClick = () => {
    setIsExitModalOpen(true);
  };

  const confirmExit = () => {
    setIsExitModalOpen(false);
    window.open('https://www.klever-one.com/', '_blank');
  };

  const cancelExit = () => {
    setIsExitModalOpen(false);
  };

  const getEmbedCode = () => {
    const totalSeconds = (parseInt(autoOff) || 0) * 60 + (parseInt(autoOffSec) || 0);
    
    if (codeTab === "react") {
      return `// npm install @klever-one/react\n\nimport { KleverWidget } from '@klever-one/react';\n\nexport default function App() {\n  return (\n    <>\n      {/* 다른 컴포넌트들... */}\n      <KleverWidget \n        clientId="YOUR_CLIENT_ID" // 발급받은 클라이언트 API 키\n        layout="${layout}"\n        autoOff={${totalSeconds}}\n      />\n    </>\n  );\n}`;
    }

    return `\n<script>\n  (function(w, d, s, o, f, js, fjs) {\n    w['KleverOneWidget'] = o; w[o] = w[o] || function () { (w[o].q = w[o].q || []).push(arguments) };\n    js = d.createElement(s), fjs = d.getElementsByTagName(s)[0];\n    js.id = o; js.src = f; js.async = 1; fjs.parentNode.insertBefore(js, fjs);\n  }(window, document, 'script', 'kw', 'https://cdn.klever-one.com/widget.js'));\n  \n  // 위젯 초기화 및 설정 적용\n  kw('init', {\n    clientId: 'YOUR_CLIENT_ID', // 발급받은 클라이언트 API 키\n    layout: '${layout}',\n    autoOff: ${totalSeconds}\n  });\n</script>`;
  };

  const handleCopyEmbedCode = () => {
    try {
      const textArea = document.createElement("textarea");
      textArea.value = getEmbedCode();
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setAlertMessage("삽입 코드가 클립보드에 복사되었습니다!");
    } catch (err) {
      console.error("복사 실패", err);
    }
  };

  const getRagOptions = () => {
    const options = [{ value: "none", label: "사용 안 함" }];
    
    if (uiLlmType === "gpt") {
      options.push({ value: "native", label: "OpenAI Vector Store" });
    } else if (uiLlmType === "gemini") {
      options.push({ value: "native", label: "Google AI Studio RAG" });
    } else if (uiLlmType === "llamon") {
      options.push({ value: "native", label: "LLaMON RAG AI" });
    }
    
    return options;
  };

  const togglePromptTag = (tagId) => {
    let updatedSelectedTags;
    if (selectedTags.includes(tagId)) {
      updatedSelectedTags = selectedTags.filter(id => id !== tagId);
    } else {
      updatedSelectedTags = [...selectedTags, tagId];
    }
    setSelectedTags(updatedSelectedTags);
    syncTagsToStorage(apiKeys, selectedAgentId, customTags, updatedSelectedTags, setApiKeys);
  };

  const handleAddCustomTag = () => {
    const trimmed = customTagInput.trim();
    if (!trimmed) return;
    
    const tagId = `custom_${Date.now()}`;
    const newTag = { id: tagId, label: trimmed };
    
    const updatedCustomTags = [...customTags, newTag];
    const updatedSelectedTags = [...selectedTags, tagId];

    setCustomTags(updatedCustomTags);
    setSelectedTags(updatedSelectedTags);
    setCustomTagInput("");

    syncTagsToStorage(apiKeys, selectedAgentId, updatedCustomTags, updatedSelectedTags, setApiKeys);
  };

  const handleCustomTagKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddCustomTag();
    }
  };

  const handleRemoveCustomTag = (e, tagId) => {
    e.stopPropagation();
    
    const updatedCustomTags = customTags.filter(tag => tag.id !== tagId);
    const updatedSelectedTags = selectedTags.filter(id => id !== tagId);

    setCustomTags(updatedCustomTags);
    setSelectedTags(updatedSelectedTags);

    syncTagsToStorage(apiKeys, selectedAgentId, updatedCustomTags, updatedSelectedTags, setApiKeys);
  };

  const promptTagOptions = [
    { id: "no_politics", label: "정치 언급 금지" },
    { id: "no_religion", label: "종교 언급 금지" },
    { id: "no_social_controversy", label: "사회적 논란 언급 금지" },
    { id: "no_profanity", label: "비속어 및 혐오 표현 금지" },
    { id: "no_competitors", label: "경쟁사 언급 금지" },
    { id: "no_personal_info", label: "개인정보 요구 금지" },
    { id: "polite_tone", label: "존댓말" },
    { id: "require_citation", label: "출처 표기" },
    { id: "empathy_first", label: "공감과 위로" },
  ];

  const digitalHumans = [
    {
      id: "yuri",
      name: "유리 (Yuri)",
      desc: "단정하고 신뢰감 있는 안내원 스타일",
      bg: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
      num: 2
    },
    {
      id: "chanu",
      name: "차누 (Chanu)",
      desc: "전문적이고 논리적인 컨설턴트 스타일",
      bg: "linear-gradient(135deg, #2b5876 0%, #4e4376 100%)",
      num: 1
    },
    {
      id: "sujin",
      name: "마이클 (Michael)",
      desc: "밝고 캐주얼한 일상 대화 스타일",
      bg: "linear-gradient(135deg, #3a1c71 0%, #d76d77 50%, #ffaf7b 100%)",
      num: 4
    }
  ];

  const layoutOptions = [
    { id: "bottom-right", label: "우측 하단 (기본)", boxClass: "br" },
    { id: "bottom-left", label: "좌측 하단", boxClass: "bl" },
    { id: "center", label: "화면 중앙 팝업", boxClass: "center" },
    { id: "top-right", label: "우측 상단", boxClass: "tr" },
    { id: "top-left", label: "좌측 상단", boxClass: "tl" },
  ];

  const savedAgent = apiKeys.find(a => a.id === selectedAgentId) || apiKeys[0];
  const selectedHuman = digitalHumans.find(human => human.id === uiCharacter);

  const currentAvatarNum = selectedHuman ? selectedHuman.num : 1; 

  const resolvedPromptTags = (savedAgent.promptTags || []).map(tagId => {
    const customMatch = (savedAgent.customTags || []).find(t => t.id === tagId);
    if (customMatch) return customMatch.label;
    return tagId;
  });

  return (
    <div className={`app-root ${!isDarkMode ? "light-mode" : ""}`}>
      
      <div className="agent-settings-container">
        <div className="view-header">
          <div className="title-area">
            <h1 className="main-title">
              <span className="highlight">KLEVER ONE</span>
            </h1>
            <p className="sub-title">{i18n[uiLang].subTitle}</p>
          </div>
          <div className="header-buttons">
            <select 
              className="ui-lang-select" 
              value={uiLang} 
              onChange={(e) => setUiLang(e.target.value)}
              title="Change UI Language"
            >
              <option value="ko">한국어</option>
              <option value="en">English</option>
              <option value="zh">中文</option>
              <option value="vi">Tiếng Việt</option>
              <option value="ja">日本語</option>
            </select>

            <button 
              className="btn-icon-theme" 
              onClick={() => setIsDarkMode(!isDarkMode)}
              title={isDarkMode ? "라이트 모드로 전환" : "다크 모드로 전환"}
            >
              {isDarkMode ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
              )}
            </button>
            <button className="btn-outline" onClick={handleReset}>{i18n[uiLang].reset}</button>
            <button 
              className="btn-primary" 
              onClick={handleSaveClick}
              disabled={!isFormValid}
            >
              {i18n[uiLang].save}
            </button>
            <button 
              className="btn-icon-back" 
              onClick={handleExitClick}
              title="나가기"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
            </button>
          </div>
        </div>

        <div className="settings-tabs">
          <button
            className={`tab-btn ${activeTab === "agent" ? "active" : ""}`}
            onClick={() => setActiveTab("agent")}
          >
            {i18n[uiLang].tab1}
          </button>
          <button
            className={`tab-btn ${activeTab === "system" ? "active" : ""}`}
            onClick={() => setActiveTab("system")}
          >
            {i18n[uiLang].tab2}
          </button>
          <button
            className={`tab-btn ${activeTab === "widget" ? "active" : ""}`}
            onClick={() => setActiveTab("widget")}
          >
            {i18n[uiLang].tab3}
          </button>
        </div>

        <div className="tab-content-area">
          {activeTab === "agent" && (
            <div className="tab-pane fade-in">
              <div className="setting-card">
                <div className="card-header-flex" style={{ marginBottom: "16px" }}>
                  <div>
                    <h3 className="card-title">{i18n[uiLang].apiKeyTitle}</h3>
                    <p className="card-desc" style={{ marginBottom: 0 }}>
                      {i18n[uiLang].apiKeyDesc}
                    </p>
                  </div>
                  <button className="btn-klever-sync" onClick={handleGenerateNewKey}>
                    {i18n[uiLang].newKeyBtn}
                  </button>
                </div>
                
                <div className="api-key-list">
                  {apiKeys.map((keyObj) => (
                    <div key={keyObj.id} className="api-key-item">
                      <div className="api-key-info">
                        <div className="api-key-name-wrap">
                          <span className="api-key-name">{keyObj.name}</span>
                          <span className="api-key-date">{keyObj.date}</span>
                        </div>
                        <input
                          type="text"
                          className="api-key-value"
                          value={keyObj.value}
                          readOnly
                        />
                      </div>
                      <div className="api-key-actions">
                        <button 
                          className="btn-icon" 
                          onClick={() => handleCopySpecificKey(keyObj.value)} 
                          title="키 복사"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                          </svg>
                        </button>
                        <button 
                          className="btn-text-reissue" 
                          onClick={() => handleReissueKey(keyObj.id)} 
                        >
                          재발급
                        </button>
                        <button 
                          className="btn-icon danger" 
                          onClick={() => handleDeleteKey(keyObj.id)} 
                          title="키 삭제"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="setting-card" style={{ padding: "24px 28px 32px" }}>
                <div className="card-header-flex" style={{ marginBottom: "16px" }}>
                  <div>
                    <h3 className="card-title">{i18n[uiLang].modelTitle}</h3>
                    <p className="card-desc" style={{ marginBottom: 0 }}>
                      {i18n[uiLang].modelDesc}
                    </p>
                  </div>
                  <button className="btn-klever-sync" onClick={() => window.open('https://www.klever-one.com/studio', '_blank')}>
                    {i18n[uiLang].studioBtn}
                  </button>
                </div>

                <div className="agent-select-box">
                  <label>
                    {i18n[uiLang].agentSelectLabel}
                  </label>
                  <select
                    className="custom-select"
                    value={selectedAgentId}
                    onChange={(e) => setSelectedAgentId(Number(e.target.value))}
                  >
                    {apiKeys.map(key => (
                      <option key={key.id} value={key.id}>
                        {key.name} ({key.value.substring(0, 16)}...)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="character-grid">
                  {digitalHumans.map((human) => (
                    <div
                      key={human.id}
                      className={`character-card ${
                        uiCharacter === human.id ? "selected" : ""
                      }`}
                      onClick={() => setUiCharacter(human.id)}
                    >
                      <div
                        className="character-bg"
                        style={{
                          background: human.image
                            ? `url('${human.image}') center top / cover no-repeat`
                            : human.bg,
                        }}
                      ></div>
                      <div className="character-overlay">
                        <div className="character-text">
                          <h4>{human.name}</h4>
                          <p>{human.desc}</p>
                        </div>
                        <button className="btn-character">
                          {uiCharacter === human.id ? "선택됨" : "선택하기"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "system" && (
            <div className="tab-pane fade-in">
              <div className="setting-card">
                <h3 className="card-title">{i18n[uiLang].llmTitle}</h3>
                <p className="card-desc" style={{ marginBottom: "16px" }}>
                  {i18n[uiLang].llmDesc}
                </p>
                <div className="radio-group">
                  <label
                    className={`radio-card ${uiLlmType === "gpt" ? "active" : ""}`}
                  >
                    <input
                      type="radio"
                      value="gpt"
                      checked={uiLlmType === "gpt"}
                      onChange={handleLlmChange}
                    />
                    <span className="radio-label">OpenAI GPT-5.3</span>
                  </label>
                  <label
                    className={`radio-card ${
                      uiLlmType === "gemini" ? "active" : ""
                    }`}
                  >
                    <input
                      type="radio"
                      value="gemini"
                      checked={uiLlmType === "gemini"}
                      onChange={handleLlmChange}
                    />
                    <span className="radio-label">Google Gemini 3.1 Pro</span>
                  </label>
                  <label
                    className={`radio-card disabled ${
                      uiLlmType === "llamon" ? "active" : ""
                    }`}
                  >
                    <input
                      type="radio"
                      value="llamon"
                      checked={uiLlmType === "llamon"}
                      onChange={handleLlmChange}
                      disabled
                    />
                    <span className="radio-label">LLaMON</span>
                  </label>
                  <label
                    className={`radio-card disabled ${
                      uiLlmType === "custom" ? "active" : ""
                    }`}
                  >
                    <input
                      type="radio"
                      value="custom"
                      checked={uiLlmType === "custom"}
                      onChange={handleLlmChange}
                      disabled
                    />
                    <span className="radio-label">직접 연결 (Custom)</span>
                  </label>
                </div>

                {uiLlmType === "custom" && (
                  <div className="custom-endpoint-box">
                    <label>API 엔드포인트 URL (Webhook)</label>
                    <input
                      type="text"
                      className="custom-input mt-2"
                      placeholder="https://your-server.com/api/chat"
                      value={customLlmUrl}
                      onChange={(e) => setCustomLlmUrl(e.target.value)}
                    />
                  </div>
                )}

                <hr className="card-divider" />

                <h3 className="card-title">{i18n[uiLang].ragTitle}</h3>
                <p className="card-desc" style={{ marginBottom: "16px" }}>
                  {i18n[uiLang].ragDesc}
                </p>
                
                <div className="radio-group" style={{ gridTemplateColumns: `repeat(${getRagOptions().length}, 1fr)` }}>
                  {getRagOptions().map((option) => (
                        <label
                          key={option.value}
                          className={`radio-card ${uiRagType === option.value ? "active" : ""}`}
                        >
                          <input
                            type="radio"
                            value={option.value}
                            checked={uiRagType === option.value}
                            onChange={(e) => setUiRagType(e.target.value)}
                          />
                          <span className="radio-label">{option.label}</span>
                        </label>
                      ))}
                    </div>

                    {uiRagType === "native" && (uiLlmType === "gpt" || uiLlmType === "gemini" || uiLlmType === "llamon") && (
                      <div className="custom-endpoint-box">
                        {uiLlmType === "gpt" && (
                          <div style={{ marginBottom: "16px" }}>
                            <label>
                              Vector Store ID (또는 Assistant ID)
                            </label>
                            <input
                              type="text"
                              className="custom-input mt-2"
                              placeholder="예: vs_abc123def456 (기존 저장소 연결 시)"
                              value={nativeRagId}
                              onChange={(e) => setNativeRagId(e.target.value)}
                              onBlur={handleVectorIdFinish} 
                              onKeyDown={(e) => { if (e.key === 'Enter') handleVectorIdFinish(); }} 
                            />
                          </div>
                        )}

                        <div className="rag-layout-container">
                          <div className={`rag-sidebar ${!isKnowledgeListOpen ? 'collapsed' : ''}`}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: isKnowledgeListOpen ? '8px' : '0' }}>
                              <button 
                                className="btn-icon" 
                                onClick={() => setIsKnowledgeListOpen(!isKnowledgeListOpen)}
                                title={isKnowledgeListOpen ? "목록 접기" : "목록 펼치기"}
                                style={{ padding: '6px', margin: '-6px' }}
                              >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <line x1="3" y1="12" x2="21" y2="12"></line>
                                  <line x1="3" y1="6" x2="21" y2="6"></line>
                                  <line x1="3" y1="18" x2="21" y2="18"></line>
                                </svg>
                              </button>
                              {isKnowledgeListOpen && (
                                <label style={{ fontSize: "13px", color: "#e2e8f0", fontWeight: 600, margin: 0, whiteSpace: "nowrap" }}>
                                  저장된 지식 목록 ({savedKnowledge.length})
                                </label>
                              )}
                            </div>
                            
                            {isKnowledgeListOpen && (
                              savedKnowledge.length === 0 ? (
                                <div style={{ padding: "32px 20px", textAlign: "center", border: "1px dashed #4a5568", borderRadius: "8px", color: "#718096", fontSize: "13px", backgroundColor: "rgba(0,0,0,0.2)", marginTop: "8px" }}>
                                  업로드된 지식 데이터가 없습니다.
                                </div>
                              ) : (
                                <div className="knowledge-list-wrap">
                                  {savedKnowledge.map(item => (
                                    <div 
                                      key={item.id} 
                                      className={`knowledge-item ${selectedKnowledgeIds.includes(item.id) ? 'selected' : ''}`}
                                      onClick={() => handleToggleKnowledgeSelection(item.id)}
                                    >
                                      <div className="knowledge-info">
                                        <input 
                                          type="checkbox" 
                                          className="knowledge-checkbox" 
                                          checked={selectedKnowledgeIds.includes(item.id)}
                                          readOnly
                                        />
                                        <div className="knowledge-icon">
                                          {item.type === 'document' && (
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                                            </svg>
                                          )}
                                          {item.type === 'collection' && (
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                                            </svg>
                                          )}
                                        </div>
                                        <div className="knowledge-details">
                                          <span className="knowledge-name" title={item.name}>{item.name}</span>
                                          <span className="knowledge-date">{item.date} 업로드됨</span>
                                        </div>
                                      </div>
                                      <div style={{ display: 'flex', gap: '4px' }}>
                                        <button 
                                          className="btn-icon" 
                                          title="불러오기(수정)"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleEditKnowledge(item);
                                          }}
                                        >
                                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                          </svg>
                                        </button>
                                        <button 
                                          className="btn-icon danger" 
                                          title="삭제"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setSavedKnowledge(savedKnowledge.filter(k => k.id !== item.id));
                                            setSelectedKnowledgeIds(selectedKnowledgeIds.filter(kId => kId !== item.id));
                                          }}
                                        >
                                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="3 6 5 6 21 6"></polyline>
                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                          </svg>
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )
                            )}
                          </div>

                          <div className="rag-main-content">
                            <label style={{ display: "block", marginBottom: "8px" }}>
                              신규 데이터 학습 (텍스트, URL, 파일)
                            </label>
                            <div 
                              className={`unified-rag-box ${isDragging ? "drag-active" : ""} ${isUploading ? "uploading" : ""}`}
                              onDragOver={handleDragOver}
                              onDragLeave={handleDragLeave}
                              onDrop={handleDrop}
                            >
                              <textarea
                                className="unified-rag-textarea"
                                placeholder="학습할 텍스트나 URL을 붙여넣거나, 문서를 드래그 앤 드롭하세요. 해당 저장소로 바로 전송됩니다."
                                value={ragInput}
                                onChange={(e) => setRagInput(e.target.value)}
                                onKeyDown={handleRagKeyDown}
                              ></textarea>
                              
                              <input 
                                type="file" 
                                ref={fileInputRef}
                                style={{ display: "none" }}
                                accept=".pdf,.txt,.doc,.docx" 
                                multiple
                                onChange={handleFileChange}
                              />

                              {(ragFiles.length > 0 || ragTexts.length > 0) && (
                                <div className="rag-files-preview" style={{ paddingBottom: '40px' }}>
                                  {ragTexts.map((item) => (
                                    <div key={item.id} className="file-chip">
                                      {item.type === 'url' ? (
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                                          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                                        </svg>
                                      ) : (
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                                        </svg>
                                      )}
                                      <span title={item.content}>{item.content}</span>
                                      <button type="button" onClick={() => removeRagText(item.id)} title="삭제">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                          <line x1="18" y1="6" x2="6" y2="18"></line>
                                          <line x1="6" y1="6" x2="18" y2="18"></line>
                                        </svg>
                                      </button>
                                    </div>
                                  ))}

                                  {ragFiles.map((file) => (
                                    <div key={file.id} className="file-chip">
                                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                                        <polyline points="13 2 13 9 20 9"></polyline>
                                      </svg>
                                      <span>{file.name}</span>
                                      <button type="button" onClick={() => removeFile(file.id)} title="삭제">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                          <line x1="18" y1="6" x2="6" y2="18"></line>
                                          <line x1="6" y1="6" x2="18" y2="18"></line>
                                        </svg>
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}

                              <div className="unified-rag-bottom">
                                <button className="btn-attach-new" onClick={handleFileAttach}>
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
                                  </svg>
                                  파일 첨부
                                </button>
                                
                                <button 
                                  className="btn-submit-new" 
                                  onClick={handleUploadKnowledge} 
                                  title="리스트에 업로드"
                                  disabled={isUploading || (!ragInput.trim() && ragFiles.length === 0 && ragTexts.length === 0)}
                                >
                                  {isUploading ? (
                                    <svg className="spinner" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <line x1="12" y1="2" x2="12" y2="6"></line>
                                      <line x1="12" y1="18" x2="12" y2="22"></line>
                                      <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
                                      <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
                                      <line x1="2" y1="12" x2="6" y2="12"></line>
                                      <line x1="18" y1="12" x2="22" y2="12"></line>
                                      <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
                                      <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
                                    </svg>
                                  ) : (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                      <line x1="12" y1="19" x2="12" y2="5"></line>
                                      <polyline points="5 12 12 5 19 12"></polyline>
                                    </svg>
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
              </div>

              <div className="setting-card fade-in">
                <div className="card-header-flex" style={{ marginBottom: "16px" }}>
                  <div>
                    <h3 className="card-title">{i18n[uiLang].mcpTitle}</h3>
                      <p className="card-desc" style={{ marginBottom: 0 }}>
                        {i18n[uiLang].mcpDesc}
                      </p>
                    </div>
                    <button 
                      className="btn-klever-sync" 
                      onClick={() => setIsMcpModalOpen(true)}
                    >
                      + API 추가
                    </button>
                  </div>

                  <div className="mcp-list-wrap">
                    {mcpList.map(mcp => (
                      <div key={mcp.id} className="mcp-item">
                        <div className="mcp-info">
                          <div className="mcp-name">
                            {mcp.name}
                            <span className={`mcp-badge ${mcp.type === 'built-in' ? 'built-in' : ''}`}>
                              {mcp.type === 'built-in' ? '기본 제공' : (mcp.method || 'GET')}
                            </span>
                          </div>
                          <div className="mcp-desc">{mcp.desc}</div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <button 
                            className="btn-icon" 
                            title="상세 내용 보기" 
                            onClick={() => setSelectedMcpDetail(mcp)}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="10"></circle>
                              <line x1="12" y1="8" x2="12" y2="12"></line>
                              <line x1="12" y1="16" x2="12.01" y2="16"></line>
                            </svg>
                          </button>
                          <button 
                            className="btn-icon danger" 
                            title="엔드포인트 삭제" 
                            onClick={() => {
                              const updatedMcpList = mcpList.filter(m => m.id !== mcp.id);
                              syncMcpToStorage(updatedMcpList, setMcpList);
                            }}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6"></polyline>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                          </button>
                          <input
                            type="checkbox"
                            className="toggle-switch"
                            checked={mcp.active}
                            onChange={() => {
                              const updatedMcpList = mcpList.map(m => m.id === mcp.id ? { ...m, active: !m.active } : m);
                              syncMcpToStorage(updatedMcpList, setMcpList);
                            }}
                            title={mcp.active ? "비활성화" : "활성화"}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
              </div>

              <div className="setting-card fade-in">
                <div className="card-header-flex" style={{ marginBottom: '24px' }}>
                  <div>
                    <h3 className="card-title">{i18n[uiLang].promptTitle}</h3>
                      <p className="card-desc" style={{ marginBottom: '8px' }}>
                        {i18n[uiLang].promptDesc}
                      </p>
                    </div>
                    <div className="mode-toggle-group">
                      <button
                        className={`mode-toggle-btn ${promptMode === 'tag' ? 'active' : ''}`}
                        onClick={() => setPromptMode('tag')}
                      >
                        태그 모드
                      </button>
                      <button
                        className={`mode-toggle-btn ${promptMode === 'manual' ? 'active' : ''}`}
                        onClick={() => setPromptMode('manual')}
                      >
                        직접 입력
                      </button>
                    </div>
                  </div>
                  
                  {promptMode === 'tag' && (
                    <div className="prompt-tags-wrap">
                      {promptTagOptions.map((tag) => {
                        const isActive = selectedTags.includes(tag.id);
                        return (
                          <div
                            key={tag.id}
                            className={`prompt-tag ${isActive ? "active" : ""}`}
                            onClick={() => togglePromptTag(tag.id)}
                          >
                            {isActive ? (
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12"></polyline>
                              </svg>
                            ) : (
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                              </svg>
                            )}
                            {tag.label}
                          </div>
                        );
                      })}

                      {customTags.map((tag) => {
                        const isActive = selectedTags.includes(tag.id);
                        return (
                          <div
                            key={tag.id}
                            className={`prompt-tag ${isActive ? "active" : ""}`}
                            onClick={() => togglePromptTag(tag.id)}
                          >
                            {isActive ? (
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12"></polyline>
                              </svg>
                            ) : (
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                              </svg>
                            )}
                            {tag.label}
                            <button 
                              type="button" 
                              className="prompt-tag-remove" 
                              onClick={(e) => handleRemoveCustomTag(e, tag.id)}
                              title="태그 삭제"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                              </svg>
                            </button>
                          </div>
                        );
                      })}

                      <div className="custom-tag-input-wrap">
                        <span style={{color: '#718096', fontSize: '13px'}}>+</span>
                        <input 
                          type="text" 
                          className="custom-tag-input" 
                          placeholder="태그 직접 입력" 
                          value={customTagInput}
                          onChange={(e) => setCustomTagInput(e.target.value)}
                          onKeyDown={handleCustomTagKeyDown}
                        />
                        <button className="btn-add-tag" onClick={handleAddCustomTag}>추가</button>
                      </div>
                    </div>
                  )}

                  {promptMode === 'manual' && (
                    <textarea
                      className="manual-prompt-textarea"
                      placeholder="당신은 KLEVER ONE의 안내 에이전트입니다..."
                      value={manualPrompt}
                      onChange={(e) => setManualPrompt(e.target.value)}
                    />
                  )}
              </div>
            </div>
          )}

          {activeTab === "widget" && (
            <div className="tab-pane fade-in">
              <div className="setting-card">
                <h3 className="card-title">{i18n[uiLang].layoutTitle}</h3>
                <p className="card-desc">
                  {i18n[uiLang].layoutDesc}
                </p>

                <div className="layout-selector">
                  {layoutOptions.map((option) => (
                    <div
                      key={option.id}
                      className={`layout-item ${
                        layout === option.id ? "selected" : ""
                      }`}
                      onClick={() => setLayout(option.id)}
                    >
                      <div className="layout-preview">
                        <div className="browser-mockup">
                          <div className={`widget-box ${option.boxClass}`}></div>
                        </div>
                      </div>
                      <span>{option.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="setting-card">
                <h3 className="card-title">{i18n[uiLang].timeTitle}</h3>
                <div className="form-group mt-2" style={{ maxWidth: "350px" }}>
                  <label>{i18n[uiLang].timeDesc}</label>
                  <div style={{ display: "flex", gap: "16px", width: "100%" }} className="mt-2">
                    <div className="input-with-unit" style={{ flex: 1 }}>
                      <input
                        type="number"
                        className="custom-input"
                        value={autoOff}
                        onChange={(e) => setAutoOff(e.target.value)}
                        min="0"
                      />
                      <span className="unit" style={{ whiteSpace: "nowrap" }}>분</span>
                    </div>
                    <div className="input-with-unit" style={{ flex: 1 }}>
                      <input
                        type="number"
                        className="custom-input"
                        value={autoOffSec}
                        onChange={(e) => setAutoOffSec(e.target.value)}
                        min="0"
                        max="59"
                      />
                      <span className="unit" style={{ whiteSpace: "nowrap" }}>초</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="setting-card">
                <h3 className="card-title">{i18n[uiLang].codeTitle}</h3>
                <p className="card-desc">
                  {i18n[uiLang].codeDesc}
                </p>

                <div className="code-tabs">
                  <button 
                    className={`code-tab-btn ${codeTab === "vanilla" ? "active" : ""}`}
                    onClick={() => setCodeTab("vanilla")}
                  >
                    HTML (JS/TS)
                  </button>
                  <button 
                    className={`code-tab-btn ${codeTab === "react" ? "active" : ""}`}
                    onClick={() => setCodeTab("react")}
                  >
                    React (JSX/TSX)
                  </button>
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

      <div id="chatbot-wrapper">
       {chatbotType === "sdk" ? (
        <DigitalHuman 
          apiKey={import.meta.env.VITE_KLEVER_API_KEY} 
          layout={layout} 
        />
      ) : (
        <BasicChatbot 
          unrealurl={import.meta.env.VITE_MATCHMAKER}
          layout={layout}
          autoOff={autoOff * 60 + autoOffSec}
          avatarnum={currentAvatarNum}       
          llm={savedAgent.llm || "gpt"}                
          assistantId={savedAgent.assistantId || ""} 
          promptMode={savedAgent.promptMode || "tag"}
          promptTags={resolvedPromptTags} 
          promptManual={savedAgent.promptManual || ""}
        />
      )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h2 className="modal-title">저장하시겠습니까?</h2>
            <p className="modal-desc">
              설정하신 에이전트 정보가<br/>라이브 서버에 즉시 적용됩니다.
            </p>
            <div className="modal-buttons">
              <button className="btn-outline" onClick={cancelSave}>취소</button>
              <button className="btn-primary" onClick={confirmSave}>적용</button>
            </div>
          </div>
        </div>
      )}

      {isExitModalOpen && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-logo">
              <span>KLEVER ONE</span>
            </div>
            <p className="modal-desc">
              클레버원 홈페이지로 돌아가시겠어요?<br/>저장하지 않은 변경사항은 사라질 수 있습니다.
            </p>
            <div className="modal-buttons">
              <button className="btn-outline" onClick={cancelExit}>취소</button>
              <button className="btn-danger" onClick={confirmExit}>나가기</button>
            </div>
          </div>
        </div>
      )}

      {isNewKeyModalOpen && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h2 className="modal-title">신규 키 발급</h2>
            <p className="modal-desc" style={{ marginBottom: "16px" }}>
              새로 발급할 에이전트 키의 이름을 지정하세요.
            </p>
            <input
              type="text"
              className="custom-input"
              style={{ marginBottom: "24px", textAlign: "center" }}
              value={newKeyNameInput}
              onChange={(e) => setNewKeyNameInput(e.target.value)}
              placeholder="예: 영업용 챗봇 키"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") confirmGenerateNewKey();
              }}
            />
            <div className="modal-buttons">
              <button className="btn-outline" onClick={() => setIsNewKeyModalOpen(false)}>취소</button>
              <button className="btn-primary" onClick={confirmGenerateNewKey}>발급하기</button>
            </div>
          </div>
        </div>
      )}

      {isMcpModalOpen && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: "500px" }}>
            <h2 className="modal-title">외부 API 추가</h2>
            <p className="modal-desc" style={{ marginBottom: "16px" }}>
              연동할 커스텀 API 엔드포인트와 파라미터 정보를 입력하세요.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px", textAlign: "left" }}>
              <div>
                <label style={{ fontSize: "12px", color: "#a0aec0", marginBottom: "4px", display: "block" }}>API 이름</label>
                <input
                  type="text"
                  className="custom-input"
                  value={newMcpName}
                  onChange={(e) => setNewMcpName(e.target.value)}
                  placeholder="예: 실시간 코인 시세"
                  autoFocus
                />
              </div>
              
              {/* 🚀 추가된 Method 선택 폼 */}
              <div>
                <label style={{ fontSize: "12px", color: "#a0aec0", marginBottom: "4px", display: "block" }}>Method (GET/POST)</label>
                <select className="custom-select" value={newMcpMethod} onChange={(e) => setNewMcpMethod(e.target.value)}>
                  <option value="GET">GET (데이터 조회)</option>
                  <option value="POST">POST (데이터 생성 및 전송)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: "12px", color: "#a0aec0", marginBottom: "4px", display: "block" }}>엔드포인트 URL</label>
                <input
                  type="text"
                  className="custom-input"
                  value={newMcpUrl}
                  onChange={(e) => setNewMcpUrl(e.target.value)}
                  placeholder="https://api.coingecko.com/api/v3/simple/price"
                />
              </div>
              <div>
                <label style={{ fontSize: "12px", color: "#a0aec0", marginBottom: "4px", display: "block" }}>API 키 (선택사항)</label>
                <input
                  type="text"
                  className="custom-input"
                  value={newMcpApiKey}
                  onChange={(e) => setNewMcpApiKey(e.target.value)}
                  placeholder="예: Bearer sk-..."
                />
              </div>

              {/* 🚀 파라미터 동적 추가 영역 시작 */}
              <div style={{ marginTop: '8px', padding: '12px', background: '#0b0d10', borderRadius: '8px', border: '1px solid #2d3748' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <label style={{ fontSize: "12px", color: "#00c6ff", fontWeight: 600, margin: 0 }}>파라미터 설정</label>
                  <button
                    type="button"
                    style={{ fontSize: '11px', padding: '4px 8px', background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    onClick={() => setNewMcpParams([...newMcpParams, { key: '', type: 'string', desc: '' }])}
                  >
                    + 파라미터 추가
                  </button>
                </div>

                {newMcpParams.length === 0 ? (
                  <div style={{ fontSize: '12px', color: '#718096', textAlign: 'center', padding: '8px 0' }}>
                    추가된 파라미터가 없습니다.
                  </div>
                ) : (
                  newMcpParams.map((param, index) => (
                    <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: index === newMcpParams.length - 1 ? 0 : '8px', alignItems: 'flex-start' }}>
                      <input
                        type="text"
                        className="custom-input"
                        style={{ flex: 1, padding: '6px 10px', fontSize: '12px' }}
                        placeholder="키 (예: symbol)"
                        value={param.key}
                        onChange={(e) => {
                          const updated = [...newMcpParams];
                          updated[index].key = e.target.value;
                          setNewMcpParams(updated);
                        }}
                      />
                      <select
                        className="custom-select"
                        style={{ width: '85px', padding: '6px', fontSize: '12px', height: 'auto', backgroundColor: '#1a202c' }}
                        value={param.type}
                        onChange={(e) => {
                          const updated = [...newMcpParams];
                          updated[index].type = e.target.value;
                          setNewMcpParams(updated);
                        }}
                      >
                        <option value="string">String</option>
                        <option value="number">Number</option>
                      </select>
                      <input
                        type="text"
                        className="custom-input"
                        style={{ flex: 2, padding: '6px 10px', fontSize: '12px' }}
                        placeholder="설명 (예: 코인 심볼 BTCUSDT, ETHUSDT)"
                        value={param.desc}
                        onChange={(e) => {
                          const updated = [...newMcpParams];
                          updated[index].desc = e.target.value;
                          setNewMcpParams(updated);
                        }}
                      />
                      <button
                        className="btn-icon danger"
                        style={{ padding: '6px' }}
                        onClick={() => {
                          setNewMcpParams(newMcpParams.filter((_, i) => i !== index));
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                      </button>
                    </div>
                  ))
                )}
              </div>
              {/* 🚀 파라미터 영역 끝 */}

            </div>
            <div className="modal-buttons">
              <button className="btn-outline" onClick={() => {
                setIsMcpModalOpen(false);
                setNewMcpMethod("GET");
                setNewMcpParams([]); 
              }}>취소</button>
              <button className="btn-primary" onClick={confirmAddMcp}>추가하기</button>
            </div>
          </div>
        </div>
      )}

      {alertMessage && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h2 className="modal-title">알림</h2>
            <p className="modal-desc" style={{ marginBottom: "24px" }}>
              {alertMessage}
            </p>
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
            <p className="modal-desc" style={{ marginBottom: "24px" }}>
              이 API 키를 삭제하시겠습니까?<br/>연결된 에이전트가 작동하지 않을 수 있습니다.
            </p>
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
            <p className="modal-desc" style={{ marginBottom: "24px" }}>
              이 API 키의 재발급을 신청하시겠습니까?<br/>새로운 키가 발급되면 기존 키로 연결된 에이전트는 더 이상 작동하지 않습니다.
            </p>
            <div className="modal-buttons">
              <button className="btn-outline" onClick={() => setReissueTargetId(null)}>취소</button>
              <button className="btn-primary" onClick={confirmReissueKey}>재발급</button>
            </div>
          </div>
        </div>
      )}

      {selectedMcpDetail && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: "800px" }}>
            <h2 className="modal-title">API 상세정보</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px", textAlign: "left", maxHeight: "60vh", overflowY: "auto", paddingRight: "4px" }}>
              <div>
                <label style={{ fontSize: "12px", color: "#a0aec0", marginBottom: "4px", display: "block" }}>API 이름</label>
                <input type="text" className="custom-input" value={selectedMcpDetail.name} readOnly />
              </div>
              <div>
                <label style={{ fontSize: "12px", color: "#a0aec0", marginBottom: "4px", display: "block" }}>엔드포인트 URL</label>
                <input type="text" className="custom-input" value={selectedMcpDetail.desc} readOnly />
              </div>

              <div>
                <label style={{ fontSize: "12px", color: "#a0aec0", marginBottom: "4px", display: "block" }}>인증 API 키 (Authentication)</label>
                <input 
                  type="text" 
                  className="custom-input" 
                  value={selectedMcpDetail.apiKey || "필요 없음 (None)"} 
                  readOnly 
                  style={{ 
                    fontFamily: selectedMcpDetail.apiKey ? '"Consolas", "Monaco", monospace' : 'inherit',
                    color: selectedMcpDetail.apiKey ? '#a0aec0' : '#718096'
                  }}
                />
              </div>
              
              <div>
                <label style={{ fontSize: "12px", color: "#a0aec0", marginBottom: "4px", display: "block" }}>파라미터 (Parameters)</label>
                {selectedMcpDetail.parameters && selectedMcpDetail.parameters.length > 0 ? (
                  <div style={{ backgroundColor: "#0b0d10", border: "1px solid #4a5568", borderRadius: "8px", padding: "12px" }}>
                    {selectedMcpDetail.parameters.map((param, idx) => (
                      <div key={idx} style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: idx === selectedMcpDetail.parameters.length - 1 ? 0 : "12px", fontSize: "13px" }}>
                        <div style={{ display: "flex", gap: "8px", width: "100%" }}>
                          <span style={{ color: "#00c6ff", fontWeight: "600" }}>{param.key}</span>
                          <span style={{ color: "#718096" }}>[{param.type}]</span>
                        </div>
                        <span style={{ color: "#e2e8f0", fontSize: "12px", paddingLeft: "8px", borderLeft: "2px solid #2d3748" }}>{param.desc}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <input type="text" className="custom-input" value="설정된 파라미터가 없습니다." readOnly />
                )}
              </div>

              <div>
                <label style={{ fontSize: "12px", color: "#a0aec0", marginBottom: "4px", display: "block" }}>현재 상태</label>
                <input type="text" className="custom-input" value={selectedMcpDetail.active ? "활성화됨" : "비활성화됨"} readOnly style={{ color: selectedMcpDetail.active ? "#00c6ff" : "inherit", fontWeight: selectedMcpDetail.active ? "600" : "normal" }} />
              </div>
            </div>
            <div className="modal-buttons">
              <button className="btn-primary" onClick={() => setSelectedMcpDetail(null)}>닫기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}