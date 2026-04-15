import React, { useState, useEffect, useRef } from "react";
import { BasicChatbot } from "./BasicChatBot";
import { DigitalHuman } from "./DigitalHuman";
import  "../css/Admin.css";


import { 
  uploadFilesToVectorStore, 
  linkVectorStoreToAssistant, 
  uploadFilesToGemini 
} from "../services/ragService";export default function App({chatbotType}) {
  const [activeTab, setActiveTab] = useState("agent"); // 에이전트 탭 기본 표시

  // 시스템 & AI
  const [apiKeys, setApiKeys] = useState([
    {
      id: 1,
      name: "klever one",
      value: "sk-live-a1b2c3d4e5f6g7h8i9j0",
      date: "2026-04-07",
      character: "", // 🚀 기본 선택 해제
      voice: "",     // 🚀 기본 목소리 선택 해제
      language: "ko"
    }
  ]);
  const [selectedAgentId, setSelectedAgentId] = useState(1); // 🚀 현재 설정 중인 에이전트 ID
  const [llmType, setLlmType] = useState(""); // 🚀 기본 상태를 아무것도 선택되지 않음으로 변경
  const [ragType, setRagType] = useState("none"); // 🚀 RAG 설정 상태 (none, native, external)

  // 🚀 입력값 상태 추가 (유효성 검사용)
  const [customLlmUrl, setCustomLlmUrl] = useState("");
  const [nativeRagId, setNativeRagId] = useState("");
  const [externalRagUrl, setExternalRagUrl] = useState("");

  // !!수정!! 중복 호출을 막기 위한 상태 추가
  const [autoAssistantId, setAutoAssistantId] = useState("");
  const [lastVerifiedVsId, setLastVerifiedVsId] = useState("");

  // 위젯 설정
  const [layout, setLayout] = useState("bottom-right");
  const [autoOff, setAutoOff] = useState(15);
  const [autoOffSec, setAutoOffSec] = useState(0);

  // RAG 학습 데이터 상태
  const [ragInput, setRagInput] = useState("");
  const [ragFiles, setRagFiles] = useState([]);
  const [ragTexts, setRagTexts] = useState([]);
  const [isDragging, setIsDragging] = useState(false); // 🚀 드래그 상태 추가
  const [isUploading, setIsUploading] = useState(false); // 🚀 업로드 진행 상태 추가

  // 🚀 파일 입력을 위한 참조 추가
  const fileInputRef = useRef(null);

  // 🚀 MCP 리스트 상태 관리
  const [mcpList, setMcpList] = useState([
    { id: "web_search", name: "웹 검색 (Web Search)", desc: "실시간 웹 검색 결과를 기반으로 최신 정보를 반영합니다.", type: "built-in", active: true },
    { id: "calculator", name: "수학 및 코드 실행기", desc: "복잡한 수식이나 코드를 실행하여 정확한 결과값을 도출합니다.", type: "built-in", active: false },
    { id: "custom_1", name: "사내 예약 시스템 연동", desc: "https://api.company.com/mcp/booking", type: "custom", active: true }
  ]);

  // =========================================================
  // !!수정!! Vector Store ID 입력 완료 시 Assistant 연동 로직
  // =========================================================
  const handleVectorIdFinish = async () => {
    const currentId = nativeRagId.trim();
    
    // 입력값이 없거나 GPT 네이티브 RAG가 아니거나 이미 확인된 ID면 중복 실행 방지
    if (!currentId || llmType !== "gpt" || ragType !== "native") return;
    if (currentId === lastVerifiedVsId) return; 

    setIsUploading(true); // 로딩 UI 활성화
    
    const openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY || "YOUR_OPENAI_API_KEY";
    
    // Service 파일에서 통신 및 메시지 결과 받아오기
    const result = await linkVectorStoreToAssistant(openaiApiKey, currentId);
    
    if (result.success) {
      setAutoAssistantId(result.assistantId);
      setLastVerifiedVsId(currentId);
      setAlertMessage(result.message);
      console.log(result.isNew ? "신규 Assistant 연동:" : "기존 Assistant 연동:", result.assistantId);
    } else {
      setAlertMessage(result.message);
    }
    
    setIsUploading(false); // 로딩 UI 종료
  };

  // =========================================================
  // 🚀 누락되었던 드래그 앤 드롭 및 파일 업로드 핸들러 복구
  // =========================================================
  
  // 파일 첨부 버튼 클릭 시 (숨겨진 input 실행)
  const handleFileAttach = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // 실제 파일이 선택되었을 때 실행되는 함수
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const newFiles = files.map((file) => ({
        id: Date.now() + Math.random(), // 고유 ID 생성
        name: file.name,
        fileObject: file // 🚀 API 전송을 위해 실제 파일 객체 보관
      }));
      setRagFiles([...ragFiles, ...newFiles]);
    }
    // 동일한 파일을 연속으로 선택할 수 있도록 value 초기화
    e.target.value = null;
  };

  // 첨부된 파일 삭제
  const removeFile = (id) => {
    setRagFiles(ragFiles.filter((f) => f.id !== id));
  };

  // 드래그 앤 드롭 이벤트 핸들러
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
        fileObject: file // 🚀 API 전송을 위해 실제 파일 객체 보관
      }));
      setRagFiles([...ragFiles, ...newFiles]);
    }
  };

  // 🚀 RAG 텍스트/URL 추가 및 OpenAI Vector Store 업로드 로직 통합
  const handleAddRag = async () => {
    // 1. 단순 텍스트/URL 입력 처리 (유지)
    if (ragInput.trim()) {
      const isUrl = ragInput.startsWith("http://") || ragInput.startsWith("https://");
      setRagTexts([...ragTexts, { id: Date.now(), type: isUrl ? 'url' : 'text', content: ragInput.trim() }]);
      setRagInput(""); 
    }

    // 2. 파일 업로드 로직 (GPT vs Gemini 분기 처리)
    if (ragFiles.length > 0 && ragType === "native") {
      setIsUploading(true);
      
      try {
        if (llmType === "gpt") {
          // [GPT 로직]
          if (!nativeRagId.trim()) {
            setAlertMessage("파일을 Vector Store에 연동하려면 Vector Store ID를 먼저 입력해주세요.");
            setIsUploading(false); return;
          }
          const openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY;
          await uploadFilesToVectorStore(openaiApiKey, nativeRagId, ragFiles);
          
          setAlertMessage("파일이 성공적으로 OpenAI Vector Store에 업로드 되었습니다."); 
          setRagFiles([]); 

        } else if (llmType === "gemini") {
          // !!수정!! [Gemini 로직 추가]
          const geminiApiKey = import.meta.env.VITE_GEMINAI_API_KEY;
          
          // 위에서 만든 함수로 Gemini 서버에 파일들 업로드
          const uploadedGeminiFiles = await uploadFilesToGemini(geminiApiKey, ragFiles);
          
          // 업로드된 파일 정보 배열을 문자열(JSON)로 바꿔서 assistantId 프롭으로 넘김
          setAutoAssistantId(JSON.stringify(uploadedGeminiFiles));
          setAlertMessage("파일이 성공적으로 Gemini 서버에 업로드 되었습니다.\n이제 대화를 시작해 보세요!"); 
          setRagFiles([]); 
        }
      } catch (error) {
        console.error("RAG Error:", error);
        setAlertMessage("업로드 중 오류가 발생했습니다: " + error.message);
      } finally {
        setIsUploading(false);
      }
    } else if (ragFiles.length > 0 && ragType !== "native") {
       setAlertMessage("현재 파일 업로드는 Native 연동일 때만 작동합니다.");
    }
  };

  // 추가된 텍스트/URL 삭제 로직
  const removeRagText = (id) => {
    setRagTexts(ragTexts.filter((item) => item.id !== id));
  };

  // 엔터키 입력 감지
  const handleRagKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // 기본 엔터(줄바꿈) 방지
      handleAddRag();
    }
  };
  // =========================================================

  // 태그 프롬프팅 상태 (분리된 태그들 기본 활성화)
  const [selectedTags, setSelectedTags] = useState(["no_politics", "no_religion", "no_social_controversy", "no_profanity", "polite_tone"]);
  const [promptMode, setPromptMode] = useState("tag"); // 🚀 "tag" | "manual"
  const [customTags, setCustomTags] = useState([]); // 🚀 직접 추가한 태그 목록
  const [customTagInput, setCustomTagInput] = useState(""); // 🚀 입력 중인 태그 텍스트
  const [manualPrompt, setManualPrompt] = useState(""); // 🚀 직접 입력 프롬프트

  // 🚀 모달 상태 관리
  const [isModalOpen, setIsModalOpen] = useState(false); // 저장 모달
  const [isExitModalOpen, setIsExitModalOpen] = useState(false); // 나가기 모달
  const [isNewKeyModalOpen, setIsNewKeyModalOpen] = useState(false); // 🚀 신규 키 발급 모달
  const [newKeyNameInput, setNewKeyNameInput] = useState(""); // 🚀 신규 키 이름 입력

  // 🚀 신규 MCP 추가 팝업 상태
  const [isMcpModalOpen, setIsMcpModalOpen] = useState(false);
  const [newMcpName, setNewMcpName] = useState("");
  const [newMcpUrl, setNewMcpUrl] = useState("");

  const [isDarkMode, setIsDarkMode] = useState(true); // 🚀 다크/라이트 모드 상태 관리
  const [codeTab, setCodeTab] = useState("vanilla"); // 🚀 삽입 코드 탭 상태 (vanilla / react)

  // 🚀 브라우저 기본 Alert/Confirm 대체용 모달 상태
  const [alertMessage, setAlertMessage] = useState("");
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [reissueTargetId, setReissueTargetId] = useState(null);

  // 🚀 ESC 키를 눌렀을 때 모달 닫기
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
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // 🚀 LLM 엔진이 변경될 때 RAG 옵션이 호환되지 않으면 초기화
  useEffect(() => {
    if (ragType === "native" && llmType === "custom") {
      setRagType("none");
    }
  }, [llmType, ragType]);

  // 🚀 선택된 에이전트가 삭제되었을 때 기본값으로 폴백
  useEffect(() => {
    if (!apiKeys.find(a => a.id === selectedAgentId) && apiKeys.length > 0) {
      setSelectedAgentId(apiKeys[0].id);
    }
  }, [apiKeys, selectedAgentId]);

  // 🚀 현재 설정 중인 에이전트 객체 가져오기
  const activeAgent = apiKeys.find(a => a.id === selectedAgentId) || apiKeys[0];

  // 🚀 폼 유효성 검사 로직 (필수 설정이 모두 되었는지 확인)
  const isFormValid = 
    apiKeys.length > 0 && // 에이전트 키가 최소 1개 이상 존재해야 함
    llmType !== "" && // 🚀 인공지능 엔진이 선택되어야 함
    (llmType !== "custom" || customLlmUrl.trim() !== "") && // 커스텀 LLM 선택 시 URL 필수
    (ragType !== "external" || externalRagUrl.trim() !== "") && // 외부 RAG 선택 시 URL 필수
    (ragType !== "native" || nativeRagId.trim() !== "" || ragFiles.length > 0 || ragTexts.length > 0) && // 네이티브 RAG 선택 시 ID 또는 파일/텍스트 업로드 필수
    activeAgent?.character && activeAgent?.language && activeAgent?.voice; // 에이전트 설정값이 있어야 함

  // 🚀 현재 에이전트의 속성(캐릭터, 언어 등) 업데이트 함수
  const updateCurrentAgent = (key, value) => {
    setApiKeys(apiKeys.map(agent => 
      agent.id === activeAgent.id ? { ...agent, [key]: value } : agent
    ));
  };

  // 🚀 초기화 버튼 클릭 시 실행되는 함수
  const handleReset = () => {
    setApiKeys([
      {
        id: 1,
        name: "klever one",
        value: "sk-live-a1b2c3d4e5f6g7h8i9j0",
        date: "2026-04-07",
        character: "", // 🚀 기본 선택 해제
        voice: "",     // 🚀 기본 목소리 선택 해제
        language: "ko"
      }
    ]);
    setSelectedAgentId(1);
    setLlmType(""); // 🚀 초기화 시에도 아무것도 선택되지 않은 상태로 변경
    setRagType("none");
    setLayout("bottom-right");
    setAutoOff(15);
    setAutoOffSec(0);
    setSelectedTags(["no_politics", "no_religion", "no_social_controversy", "no_profanity", "polite_tone"]);
    setPromptMode("tag");
    setCustomTags([]);
    setCustomTagInput("");
    setManualPrompt("");
    
    // !!수정!! 상태 초기화
    setAutoAssistantId("");
    setLastVerifiedVsId(""); 
  };

  // 🚀 특정 API 키 복사
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

  // 🚀 신규 API 키 발급 모달 열기
  const handleGenerateNewKey = () => {
    setNewKeyNameInput(`신규 에이전트 키 #${apiKeys.length + 1}`);
    setIsNewKeyModalOpen(true);
  };

  // 🚀 이름 입력 후 실제 키 발급 실행
  const confirmGenerateNewKey = () => {
    if (!newKeyNameInput.trim()) {
      return; // 이름이 비어있으면 실행하지 않음
    }

    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let newKey = "sk-live-";
    for (let i = 0; i < 24; i++) {
      newKey += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    // 현재 날짜 구하기 (YYYY-MM-DD)
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    const newKeyObj = {
      id: Date.now(),
      name: newKeyNameInput.trim(),
      value: newKey,
      date: dateStr,
      character: "",           // 🚀 신규 발급 시에도 기본 선택 해제
      voice: "",               // 🚀 신규 발급 시에도 기본 목소리 선택 해제
      language: "ko"           // 기본 언어 할당
    };
    
    // 새 키를 리스트 맨 앞에 추가하고, 바로 해당 에이전트를 선택 상태로 변경
    setApiKeys([newKeyObj, ...apiKeys]);
    setSelectedAgentId(newKeyObj.id);
    setIsNewKeyModalOpen(false);
  };

  // 🚀 특정 API 키 재발급 신청 (모달 열기)
  const handleReissueKey = (id) => {
    setReissueTargetId(id);
  };

  // 🚀 특정 API 키 삭제 (모달 열기)
  const handleDeleteKey = (id) => {
    if (apiKeys.length === 1) {
      setAlertMessage("최소 1개의 API 키는 유지해야 합니다.");
      return;
    }
    setDeleteTargetId(id);
  };

  // 🚀 실제 재발급 실행
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

  // 🚀 실제 삭제 실행
  const confirmDeleteKey = () => {
    setApiKeys(apiKeys.filter(k => k.id !== deleteTargetId));
    setDeleteTargetId(null);
  };

  // 🚀 MCP 서버 추가 실행
  const confirmAddMcp = () => {
    if (!newMcpName.trim() || !newMcpUrl.trim()) {
      setAlertMessage("서버 이름과 URL을 모두 입력해주세요.");
      return;
    }
    const newMcp = {
      id: `custom_mcp_${Date.now()}`,
      name: newMcpName.trim(),
      desc: newMcpUrl.trim(),
      type: "custom",
      active: true
    };
    setMcpList([...mcpList, newMcp]);
    setIsMcpModalOpen(false);
    setNewMcpName("");
    setNewMcpUrl("");
  };

  // 🚀 변경사항 저장 클릭 -> 모달 열기
  const handleSaveClick = () => {
    setIsModalOpen(true);
  };

  // 🚀 모달에서 적용 클릭
  const confirmSave = () => {
    setIsModalOpen(false);
    setAlertMessage("성공적으로 적용되었습니다!"); 
  };

  // 🚀 모달에서 취소 클릭
  const cancelSave = () => {
    setIsModalOpen(false);
  };

  // 🚀 나가기 클릭 -> 모달 열기
  const handleExitClick = () => {
    setIsExitModalOpen(true);
  };

  // 🚀 나가기 모달 - 나가기 클릭
  const confirmExit = () => {
    setIsExitModalOpen(false);
    window.open('https://www.klever-one.com/', '_blank'); // 보안 환경을 우회하여 새 창으로 클레버원 웹사이트 열기
  };

  // 🚀 나가기 모달 - 취소 클릭
  const cancelExit = () => {
    setIsExitModalOpen(false);
  };

  // 🚀 위젯 삽입 코드 생성 (실제 동작 가능한 비동기 로딩 및 리액트 컴포넌트 구조)
  const getEmbedCode = () => {
    const totalSeconds = (parseInt(autoOff) || 0) * 60 + (parseInt(autoOffSec) || 0);
    
    if (codeTab === "react") {
      return `// npm install @klever-one/react

import { KleverWidget } from '@klever-one/react';

export default function App() {
  return (
    <>
      {/* 다른 컴포넌트들... */}
      <KleverWidget 
        clientId="YOUR_CLIENT_ID" // 발급받은 클라이언트 API 키
        layout="${layout}"
        autoOff={${totalSeconds}}
      />
    </>
  );
}`;
    }

    return `<script>
  (function(w, d, s, o, f, js, fjs) {
    w['KleverOneWidget'] = o; w[o] = w[o] || function () { (w[o].q = w[o].q || []).push(arguments) };
    js = d.createElement(s), fjs = d.getElementsByTagName(s)[0];
    js.id = o; js.src = f; js.async = 1; fjs.parentNode.insertBefore(js, fjs);
  }(window, document, 'script', 'kw', 'https://cdn.klever-one.com/widget.js'));
  
  // 위젯 초기화 및 설정 적용
  kw('init', {
    clientId: 'YOUR_CLIENT_ID', // 발급받은 클라이언트 API 키
    layout: '${layout}',
    autoOff: ${totalSeconds}
  });
</script>`;
  };

  // 🚀 삽입 코드 복사 로직
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

  // 🚀 LLM 엔진에 따른 동적 RAG 옵션 생성
  const getRagOptions = () => {
    const options = [{ value: "none", label: "사용 안 함" }];
    
    if (llmType === "gpt") {
      options.push({ value: "native", label: "OpenAI Vector Store" });
    } else if (llmType === "gemini") {
      options.push({ value: "native", label: "Google AI Studio RAG" });
    } else if (llmType === "llamon") {
      options.push({ value: "native", label: "LLaMON RAG AI" });
    }
    
    options.push({ value: "external", label: "외부 연동 API" });
    return options;
  };

  // 🚀 태그 프롬프팅 토글 함수
  const togglePromptTag = (tagId) => {
    if (selectedTags.includes(tagId)) {
      setSelectedTags(selectedTags.filter(id => id !== tagId));
    } else {
      setSelectedTags([...selectedTags, tagId]);
    }
  };

  // 🚀 커스텀 태그 추가 함수
  const handleAddCustomTag = () => {
    const trimmed = customTagInput.trim();
    if (!trimmed) return;
    
    // 고유 ID 생성
    const tagId = `custom_${Date.now()}`;
    const newTag = { id: tagId, label: trimmed };
    
    setCustomTags([...customTags, newTag]);
    setSelectedTags([...selectedTags, tagId]); // 추가 시 바로 활성화 상태로 만듦
    setCustomTagInput(""); // 입력창 초기화
  };

  const handleCustomTagKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddCustomTag();
    }
  };

  // 🚀 커스텀 태그 삭제 함수
  const handleRemoveCustomTag = (e, tagId) => {
    e.stopPropagation(); // 클릭 시 태그 선택 토글이 작동하지 않도록 방지
    setCustomTags(customTags.filter(tag => tag.id !== tagId));
    setSelectedTags(selectedTags.filter(id => id !== tagId));
  };

  const promptTagOptions = [
    { id: "no_politics", label: "정치" },
    { id: "no_religion", label: "종교" },
    { id: "no_social_controversy", label: "사회적 논란" },
    { id: "no_profanity", label: "비속어 및 혐오 표현" },
    { id: "no_competitors", label: "경쟁사 언급" },
    { id: "no_personal_info", label: "개인정보 요구" },
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
    },
    {
      id: "kris",
      name: "크리스 (Kris)",
      desc: "글로벌 서비스에 적합한 외국인 모델",
      bg: "linear-gradient(135deg, #141e30 0%, #243b55 100%)",
      num: 3 
    },
    {
      id: "custom1",
      name: "나의 커스텀 1",
      desc: "KLEVER 스튜디오에서 연동된 모델",
      bg: "linear-gradient(135deg, #4b6cb7 0%, #182848 100%)",
      num: 0 
    },
    {
      id: "custom2",
      name: "나의 커스텀 2",
      desc: "KLEVER 스튜디오에서 연동된 모델",
      bg: "linear-gradient(135deg, #614385 0%, #516395 100%)",
      num: 0 
    },
  ];

  // 5가지 위젯 레이아웃
  const layoutOptions = [
    { id: "bottom-right", label: "우측 하단 (기본)", boxClass: "br" },
    { id: "bottom-left", label: "좌측 하단", boxClass: "bl" },
    { id: "center", label: "화면 중앙 팝업", boxClass: "center" },
    { id: "top-right", label: "우측 상단", boxClass: "tr" },
    { id: "top-left", label: "좌측 상단", boxClass: "tl" },
  ];
  const selectedHuman = digitalHumans.find(human => human.id === activeAgent.character);
  const currentAvatarNum = selectedHuman ? selectedHuman.num : 0;

  return (
    <div className={`app-root ${!isDarkMode ? "light-mode" : ""}`}>

      <div className="agent-settings-container">
        {/* 상단 헤더 */}
        <div className="view-header">
          <div className="title-area">
            <h1 className="main-title">
              <span className="highlight">KLEVER ONE</span>
            </h1>
            <p className="sub-title">디지털휴먼 및 AI 에이전트 통합 제어 환경</p>
          </div>
          <div className="header-buttons">
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
            <button className="btn-outline" onClick={handleReset}>초기화</button>
            <button 
              className="btn-primary" 
              onClick={handleSaveClick}
              disabled={!isFormValid}
              title={!isFormValid ? "모든 필수 설정을 완료해야 저장할 수 있습니다." : ""}
            >
              변경사항 저장
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

        {/* 탭 네비게이션 */}
        <div className="settings-tabs">
          <button
            className={`tab-btn ${activeTab === "system" ? "active" : ""}`}
            onClick={() => setActiveTab("system")}
          >
            ⚙️ 시스템 및 AI 연결
          </button>
          <button
            className={`tab-btn ${activeTab === "agent" ? "active" : ""}`}
            onClick={() => setActiveTab("agent")}
          >
            🤖 에이전트 (캐릭터/음성)
          </button>
          <button
            className={`tab-btn ${activeTab === "widget" ? "active" : ""}`}
            onClick={() => setActiveTab("widget")}
          >
            🖥️ 챗봇 UI 및 동작
          </button>
        </div>

        <div className="tab-content-area">
          {/* =========================================
              탭 1: 시스템 및 AI 연결
          ========================================= */}
          {activeTab === "system" && (
            <div className="tab-pane fade-in">
              <div className="setting-card">
                <div className="card-header-flex" style={{ marginBottom: "16px" }}>
                  <div>
                    <h3 className="card-title">API 키 관리</h3>
                    <p className="card-desc" style={{ marginBottom: 0 }}>
                      여러 에이전트 연동을 위한 인증 키를 발급하고 관리하세요.
                    </p>
                  </div>
                  <button className="btn-klever-sync" onClick={handleGenerateNewKey}>
                    + 신규 키 발급
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

              <div className="setting-card">
                <h3 className="card-title">인공지능(LLM) 엔진 연결</h3>
                <p className="card-desc" style={{ marginBottom: "16px" }}>
                  에이전트의 두뇌 역할을 할 기본 언어 모델을 선택하세요.
                </p>
                <div className="radio-group">
                  <label
                    className={`radio-card ${llmType === "gpt" ? "active" : ""}`}
                  >
                    <input
                      type="radio"
                      value="gpt"
                      checked={llmType === "gpt"}
                      onChange={(e) => setLlmType(e.target.value)}
                    />
                    <span className="radio-label">OpenAI GPT-4o</span>
                  </label>
                  <label
                    className={`radio-card ${
                      llmType === "gemini" ? "active" : ""
                    }`}
                  >
                    <input
                      type="radio"
                      value="gemini"
                      checked={llmType === "gemini"}
                      onChange={(e) => setLlmType(e.target.value)}
                    />  
                    <span className="radio-label">Google Gemini 1.5 Pro</span>
                  </label>
                  <label
                    className={`radio-card ${
                      llmType === "llamon" ? "active" : ""
                    }`}
                  >
                    <input
                      type="radio"
                      value="llamon"
                      checked={llmType === "llamon"}
                      onChange={(e) => setLlmType(e.target.value)}
                    />
                    <span className="radio-label">LLaMON</span>
                  </label>
                  <label
                    className={`radio-card ${
                      llmType === "custom" ? "active" : ""
                    }`}
                  >
                    <input
                      type="radio"
                      value="custom"
                      checked={llmType === "custom"}
                      onChange={(e) => setLlmType(e.target.value)}
                    />
                    <span className="radio-label">직접 연결 (Custom)</span>
                  </label>
                </div>
                
                {llmType === "custom" && (
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

                <h3 className="card-title">해당 엔진의 지식저장소 (RAG) 설정</h3>
                <p className="card-desc" style={{ marginBottom: "16px" }}>
                  선택한 엔진이 답변 시 참고할 지식 기반(Knowledge Base)을 연결합니다.
                </p>
                
                <div className="radio-group" style={{ gridTemplateColumns: `repeat(${getRagOptions().length}, 1fr)` }}>
                  {getRagOptions().map((option) => (
                        <label
                          key={option.value}
                          className={`radio-card ${ragType === option.value ? "active" : ""}`}
                        >
                          <input
                            type="radio"
                            value={option.value}
                            checked={ragType === option.value}
                            onChange={(e) => setRagType(e.target.value)}
                          />
                          <span className="radio-label">{option.label}</span>
                        </label>
                      ))}
                    </div>

                    {ragType === "native" && (llmType === "gpt" || llmType === "gemini" || llmType === "llamon") && (
                      <div className="custom-endpoint-box" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                        {(llmType === "gpt" || llmType === "gemini") && (
                          <div>
                            <label>
                              {llmType === "gpt" ? "Vector Store ID (또는 Assistant ID)" : 
                               llmType === "gemini" ? "Corpus Name 또는 문서 연동 ID" : 
                               "저장소 (Knowledge Base) ID"}
                            </label>
                            <input
                              type="text"
                              className="custom-input mt-2"
                              placeholder={llmType === "gpt" ? "예: vs_abc123def456 (기존 저장소 연결 시)" : 
                                           llmType === "gemini" ? "예: corpora/abc-123 (기존 저장소 연결 시)" : 
                                           "예: kb_789xyz (기존 저장소 연결 시)"}
                              value={nativeRagId}
                              onChange={(e) => setNativeRagId(e.target.value)}
                              // !!수정!! 인풋태그 함수 연결 부분
                              onBlur={handleVectorIdFinish} 
                              onKeyDown={(e) => { if (e.key === 'Enter') handleVectorIdFinish(); }} 
                            />
                          </div>
                        )}

                        <div>
                          <label style={{ display: "block", marginBottom: "8px" }}>
                            신규 데이터 학습 (텍스트, URL, 파일)
                          </label>
                          <div 
                            className={`unified-rag-box ${isDragging ? "drag-active" : ""}`}
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
                              disabled={isUploading}
                            ></textarea>
                            
                            <input 
                              type="file" 
                              ref={fileInputRef}
                              style={{ display: "none" }}
                              accept=".pdf,.txt,.doc,.docx" 
                              multiple
                              onChange={handleFileChange}
                              disabled={isUploading}
                            />

                            {(ragFiles.length > 0 || ragTexts.length > 0) && (
                              <div className="rag-files-preview">
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
                                    <button type="button" onClick={() => removeRagText(item.id)} title="삭제" disabled={isUploading}>
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
                                    <button type="button" onClick={() => removeFile(file.id)} title="삭제" disabled={isUploading}>
                                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="18" y1="6" x2="6" y2="18"></line>
                                        <line x1="6" y1="6" x2="18" y2="18"></line>
                                      </svg>
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}

                            <div className="unified-rag-actions">
                              <button className="btn-attach" onClick={handleFileAttach} disabled={isUploading}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
                                </svg>
                                파일 첨부
                              </button>
                              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <button className="btn-add-rag" onClick={handleAddRag} disabled={isUploading}>
                                  {isUploading ? "업로드 중..." : "업로드"}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {ragType === "external" && (
                      <div className="custom-endpoint-box">
                        <label>외부 RAG API 엔드포인트 URL</label>
                        <input
                          type="text"
                          className="custom-input mt-2"
                          placeholder="https://your-rag-server.com/api/retrieve"
                          value={externalRagUrl}
                          onChange={(e) => setExternalRagUrl(e.target.value)}
                        />
                      </div>
                    )}
              </div>

              {/* 🚀 외부 도구 연동 (MCP) 카드 */}
              <div className="setting-card fade-in">
                <div className="card-header-flex" style={{ marginBottom: "16px" }}>
                  <div>
                    <h3 className="card-title">외부 도구 연동 (MCP)</h3>
                      <p className="card-desc" style={{ marginBottom: 0 }}>
                        기본 도구나 커스텀 API(Model Context Protocol)를 연결하여 에이전트의 기능을 확장하세요.
                      </p>
                    </div>
                    <button 
                      className="btn-klever-sync" 
                      onClick={() => setIsMcpModalOpen(true)}
                    >
                      + MCP 서버 추가
                    </button>
                  </div>

                  <div className="mcp-list-wrap">
                    {mcpList.map(mcp => (
                      <div key={mcp.id} className="mcp-item">
                        <div className="mcp-info">
                          <div className="mcp-name">
                            {mcp.name}
                            <span className={`mcp-badge ${mcp.type === 'built-in' ? 'built-in' : ''}`}>
                              {mcp.type === 'built-in' ? '기본 제공' : 'Custom URL'}
                            </span>
                          </div>
                          <div className="mcp-desc">{mcp.desc}</div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          {mcp.type === 'custom' && (
                            <button 
                              className="btn-icon danger" 
                              title="서버 삭제" 
                              onClick={() => setMcpList(mcpList.filter(m => m.id !== mcp.id))}
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                              </svg>
                            </button>
                          )}
                          <input
                            type="checkbox"
                            className="toggle-switch"
                            checked={mcp.active}
                            onChange={() => {
                              setMcpList(mcpList.map(m => m.id === mcp.id ? { ...m, active: !m.active } : m));
                            }}
                            title={mcp.active ? "비활성화" : "활성화"}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
              </div>

              {/* 🚀 에이전트 행동 지침 (태그/직접 프롬프팅) 카드 */}
              <div className="setting-card fade-in">
                <div className="card-header-flex" style={{ marginBottom: '24px' }}>
                  <div>
                    <h3 className="card-title">에이전트 행동 지침 (프롬프팅)</h3>
                      <p className="card-desc" style={{ marginBottom: '8px' }}>
                        에이전트가 답변 시 지켜야 할 핵심 규칙이나 페르소나를 설정하세요.
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
                      {/* 기본 제공 태그 렌더링 */}
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

                      {/* 커스텀 추가된 태그 렌더링 */}
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

                      {/* 직접 태그 추가 인풋 */}
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

          {/* =========================================
              탭 2: 에이전트 설정
          ========================================= */}
          {activeTab === "agent" && (
            <div className="tab-pane fade-in">
              <div className="setting-card" style={{ padding: "24px 28px 32px" }}>
                <div className="card-header-flex" style={{ marginBottom: "16px" }}>
                  <div>
                    <h3 className="card-title">디지털휴먼 모델 선택</h3>
                    <p className="card-desc" style={{ marginBottom: 0 }}>
                      위젯에 표시될 KLEVER ONE 디지털휴먼의 외형을 선택하세요.
                    </p>
                  </div>
                  <button className="btn-klever-sync" onClick={() => window.open('https://www.klever-one.com/studio', '_blank')}>휴먼 생성 및 수정</button>
                </div>

                {/* 🚀 에이전트(API 키) 선택 UI 추가 */}
                <div className="agent-select-box">
                  <label>
                    설정할 에이전트(API 키) 선택
                  </label>
                  <select
                    className="custom-select"
                    value={activeAgent.id}
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
                        activeAgent.character === human.id ? "selected" : ""
                      }`}
                      onClick={() => updateCurrentAgent("character", human.id)}
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
                          {activeAgent.character === human.id ? "선택됨" : "선택하기"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 🚀 언어 및 목소리 설정 카드 추가 */}
              <div className="setting-card">
                <h3 className="card-title">언어 및 목소리 설정</h3>
                <p className="card-desc" style={{ marginBottom: 0 }}>
                  해당 에이전트가 주로 구사할 언어와 음성(TTS) 톤을 선택하세요.
                </p>

                <div className="form-group-row" style={{ marginTop: "16px", flexWrap: "wrap" }}>
                  <div className="form-group" style={{ minWidth: "200px" }}>
                    <label>언어 설정</label>
                    <select
                      className="custom-select mt-2"
                      value={activeAgent.language || "ko"}
                      onChange={(e) => updateCurrentAgent("language", e.target.value)}
                    >
                      <option value="ko">한국어 (Korean)</option>
                      <option value="en">영어 (English)</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ minWidth: "200px" }}>
                    <label>에이전트 목소리 (Klever TTS)</label>
                    <select
                      className="custom-select mt-2"
                      value={activeAgent.voice || ""}
                      onChange={(e) => updateCurrentAgent("voice", e.target.value)}
                      disabled={!activeAgent.character}
                    >
                      <option value="" disabled>
                        {!activeAgent.character ? "디지털 휴먼을 먼저 선택해주세요" : "목소리를 선택해주세요"}
                      </option>
                      <option value="michael_basic">마이클(기본)</option>
                      <option value="michael_bright">마이클(밝은 목소리)</option>
                      <option value="michael_soft">마이클(부드러운 목소리)</option>
                      <option value="yuri_basic">유리(기본)</option>
                      <option value="yuri_bright">유리(밝은 목소리)</option>
                      <option value="yuri_soft">유리(부드러운 목소리)</option>
                      <option value="jennie_basic">제니 (기본)</option>
                      <option value="jennie_bright">제니 (밝은 목소리)</option>
                      <option value="jennie_soft">제니 (부드러운 목소리)</option>
                      <option value="chanu_basic">차누 (기본)</option>
                      <option value="chanu_bright">차누 (밝은 목소리)</option>
                      <option value="chanu_passionate">차누 (열정적인 목소리)</option>
                      <option value="kris_basic">크리스(기본)</option>
                      <option value="kris_bright">크리스(밝은 목소리)</option>
                      <option value="kris_soft">크리스(부드러운 목소리)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =========================================
              탭 3: 챗봇 화면 배치
          ========================================= */}
          {activeTab === "widget" && (
            <div className="tab-pane fade-in">
              <div className="setting-card">
                <h3 className="card-title">챗봇 화면 배치</h3>
                <p className="card-desc">
                  사용자 웹사이트에서 위젯이 표시될 위치를 선택하세요.
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
                <h3 className="card-title">동작 설정</h3>
                <div className="form-group mt-2" style={{ maxWidth: "350px" }}>
                  <label>자동 꺼짐 시간 (미사용 시)</label>
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
                <h3 className="card-title">웹사이트 삽입 코드</h3>
                <p className="card-desc">
                  사용하시는 환경에 맞는 코드를 복사하여 웹사이트에 붙여넣으세요. 설정하신 값들이 적용된 위젯이 즉시 표시됩니다.
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
          llm={llmType}
          assistantId={ragType === "native" ? autoAssistantId : ""} 
        />
      )}
      {/* 🚀 저장 확인 커스텀 모달 */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h2 className="modal-title">저장하시겠습니까?</h2>
            <p className="modal-desc">
              설정하신 에이전트 및 위젯 정보가<br/>라이브 서버에 즉시 적용됩니다.
            </p>
            <div className="modal-buttons">
              <button className="btn-outline" onClick={cancelSave}>취소</button>
              <button className="btn-primary" onClick={confirmSave}>적용</button>
            </div>
          </div>
        </div>
      )}

      {/* 🚀 나가기 확인 커스텀 모달 */}
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

      {/* 🚀 신규 키 발급 확인 모달 */}
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

      {/* 🚀 신규 MCP 서버 추가 모달 */}
      {isMcpModalOpen && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h2 className="modal-title">MCP 서버 추가</h2>
            <p className="modal-desc" style={{ marginBottom: "16px" }}>
              연동할 외부 커스텀 서버의 정보를 입력하세요.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px", textAlign: "left" }}>
              <div>
                <label style={{ fontSize: "12px", color: "#a0aec0", marginBottom: "4px", display: "block" }}>서버 이름</label>
                <input
                  type="text"
                  className="custom-input"
                  value={newMcpName}
                  onChange={(e) => setNewMcpName(e.target.value)}
                  placeholder="예: 사내 예약 시스템"
                  autoFocus
                />
              </div>
              <div>
                <label style={{ fontSize: "12px", color: "#a0aec0", marginBottom: "4px", display: "block" }}>서버 URL</label>
                <input
                  type="text"
                  className="custom-input"
                  value={newMcpUrl}
                  onChange={(e) => setNewMcpUrl(e.target.value)}
                  placeholder="https://api.company.com/mcp"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") confirmAddMcp();
                  }}
                />
              </div>
            </div>
            <div className="modal-buttons">
              <button className="btn-outline" onClick={() => setIsMcpModalOpen(false)}>취소</button>
              <button className="btn-primary" onClick={confirmAddMcp}>추가하기</button>
            </div>
          </div>
        </div>
      )}

      {/* 🚀 공통 Alert 모달 */}
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

      {/* 🚀 삭제 확인 모달 */}
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

      {/* 🚀 재발급 확인 모달 */}
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
    </div>
  );
}