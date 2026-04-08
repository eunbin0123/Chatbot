import React, { useState, useEffect, useRef } from "react";
import styles from "../css/Admin.module.css"; // 🚀 CSS Module 임포트
import { DigitalHuman } from "./DigitalHuman";

// 🚀 CSS Module 클래스 결합을 위한 헬퍼 함수
// styles 객체에 해당 클래스가 있으면 변환된 이름을, 없으면 전역 클래스(그대로)를 반환합니다.
const cx = (...classes) => 
  classes.filter(Boolean).map(c => styles[c] || c).join(' ');

export default function App() {
  const [activeTab, setActiveTab] = useState("agent");

  // 시스템 & AI
  const [apiKeys, setApiKeys] = useState([
    {
      id: 1,
      name: "klever one",
      value: "sk-live-a1b2c3d4e5f6g7h8i9j0",
      date: "2026-04-07",
      character: "yuri",
      voice: "jennie_basic",
      language: "ko"
    }
  ]);
  const [selectedAgentId, setSelectedAgentId] = useState(1);
  const [llmType, setLlmType] = useState("gpt");

  // 위젯 설정
  const [layout, setLayout] = useState("bottom-right");
  const [autoOff, setAutoOff] = useState(15);
  const [autoOffSec, setAutoOffSec] = useState(0);

  // RAG 학습 데이터 상태
  const [ragInput, setRagInput] = useState("");
  const [ragFiles, setRagFiles] = useState([]);
  const [ragTexts, setRagTexts] = useState([]);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef(null);

  // 태그 프롬프팅 상태
  const [selectedTags, setSelectedTags] = useState(["no_politics", "no_religion", "no_social_controversy", "no_profanity", "polite_tone"]);
  const [promptMode, setPromptMode] = useState("tag");
  const [customTags, setCustomTags] = useState([]);
  const [customTagInput, setCustomTagInput] = useState("");
  const [manualPrompt, setManualPrompt] = useState("");

  // 모달 상태 관리
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [isNewKeyModalOpen, setIsNewKeyModalOpen] = useState(false);
  const [newKeyNameInput, setNewKeyNameInput] = useState("");

  const [isDarkMode, setIsDarkMode] = useState(true);

  // Alert/Confirm 모달 상태
  const [alertMessage, setAlertMessage] = useState("");
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [reissueTargetId, setReissueTargetId] = useState(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsModalOpen(false);
        setIsExitModalOpen(false);
        setIsNewKeyModalOpen(false);
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

  useEffect(() => {
    if (!apiKeys.find(a => a.id === selectedAgentId) && apiKeys.length > 0) {
      setSelectedAgentId(apiKeys[0].id);
    }
  }, [apiKeys, selectedAgentId]);

  const activeAgent = apiKeys.find(a => a.id === selectedAgentId) || apiKeys[0];

  const updateCurrentAgent = (key, value) => {
    setApiKeys(apiKeys.map(agent => 
      agent.id === activeAgent.id ? { ...agent, [key]: value } : agent
    ));
  };

  const handleReset = () => {
    setApiKeys([{
      id: 1, name: "klever one", value: "sk-live-a1b2c3d4e5f6g7h8i9j0", date: "2026-04-07",
      character: "yuri", voice: "jennie_basic", language: "ko"
    }]);
    setSelectedAgentId(1);
    setLlmType("gpt");
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
      id: Date.now(), name: newKeyNameInput.trim(), value: newKey, date: dateStr,
      character: "yuri", voice: "jennie_basic", language: "ko"
    };
    
    setApiKeys([newKeyObj, ...apiKeys]);
    setSelectedAgentId(newKeyObj.id);
    setIsNewKeyModalOpen(false);
  };

  const handleReissueKey = (id) => setReissueTargetId(id);
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

  const handleSaveClick = () => setIsModalOpen(true);
  const confirmSave = () => {
    setIsModalOpen(false);
    setAlertMessage("성공적으로 적용되었습니다!"); 
  };
  const cancelSave = () => setIsModalOpen(false);

  const handleExitClick = () => setIsExitModalOpen(true);
  const confirmExit = () => {
    setIsExitModalOpen(false);
    window.open('https://www.klever-one.com/', '_blank');
  };
  const cancelExit = () => setIsExitModalOpen(false);

  const getEmbedCode = () => {
    const totalSeconds = (parseInt(autoOff) || 0) * 60 + (parseInt(autoOffSec) || 0);
    return `<script 
  src="https://cdn.klever-one.com/widget.js" 
  data-layout="${layout}" 
  data-auto-off="${totalSeconds}"
></script>`;
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

  const handleFileAttach = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const newFiles = files.map((file) => ({
        id: Date.now() + Math.random(),
        name: file.name,
      }));
      setRagFiles([...ragFiles, ...newFiles]);
    }
    e.target.value = null;
  };

  const removeFile = (id) => setRagFiles(ragFiles.filter((f) => f.id !== id));

  const handleDragOver = (e) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(true);
  };
  const handleDragLeave = (e) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(false);
  };
  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const newFiles = files.map((file) => ({
        id: Date.now() + Math.random(), name: file.name,
      }));
      setRagFiles([...ragFiles, ...newFiles]);
    }
  };

  const handleAddRag = () => {
    if (!ragInput.trim()) return;
    const isUrl = ragInput.startsWith("http://") || ragInput.startsWith("https://");
    const newItem = { id: Date.now(), type: isUrl ? 'url' : 'text', content: ragInput.trim() };
    setRagTexts([...ragTexts, newItem]);
    setRagInput("");
  };

  const removeRagText = (id) => setRagTexts(ragTexts.filter((item) => item.id !== id));
  const handleRagKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleAddRag(); }
  };

  const togglePromptTag = (tagId) => {
    if (selectedTags.includes(tagId)) {
      setSelectedTags(selectedTags.filter(id => id !== tagId));
    } else {
      setSelectedTags([...selectedTags, tagId]);
    }
  };

  const handleAddCustomTag = () => {
    const trimmed = customTagInput.trim();
    if (!trimmed) return;
    const tagId = `custom_${Date.now()}`;
    const newTag = { id: tagId, label: trimmed };
    setCustomTags([...customTags, newTag]);
    setSelectedTags([...selectedTags, tagId]);
    setCustomTagInput("");
  };

  const handleCustomTagKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); handleAddCustomTag(); }
  };

  const handleRemoveCustomTag = (e, tagId) => {
    e.stopPropagation();
    setCustomTags(customTags.filter(tag => tag.id !== tagId));
    setSelectedTags(selectedTags.filter(id => id !== tagId));
  };

  const promptTagOptions = [
    { id: "no_politics", label: "정치" }, { id: "no_religion", label: "종교" },
    { id: "no_social_controversy", label: "사회적 논란" }, { id: "no_profanity", label: "비속어 및 혐오 표현" },
    { id: "no_competitors", label: "경쟁사 언급" }, { id: "no_personal_info", label: "개인정보 요구" },
    { id: "polite_tone", label: "존댓말" }, { id: "require_citation", label: "출처 표기" },
    { id: "empathy_first", label: "공감과 위로" },
  ];

  const digitalHumans = [
    { id: "yuri", name: "유리 (Yuri)", desc: "단정하고 신뢰감 있는 안내원 스타일", bg: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)" },
    { id: "chanu", name: "차누 (Chanu)", desc: "전문적이고 논리적인 컨설턴트 스타일", bg: "linear-gradient(135deg, #2b5876 0%, #4e4376 100%)" },
    { id: "sujin", name: "마이클 (Michael)", desc: "밝고 캐주얼한 일상 대화 스타일", bg: "linear-gradient(135deg, #3a1c71 0%, #d76d77 50%, #ffaf7b 100%)" },
    { id: "kris", name: "크리스 (Kris)", desc: "글로벌 서비스에 적합한 외국인 모델", bg: "linear-gradient(135deg, #141e30 0%, #243b55 100%)" },
    { id: "custom1", name: "나의 커스텀 1", desc: "KLEVER 스튜디오에서 연동된 모델", bg: "linear-gradient(135deg, #4b6cb7 0%, #182848 100%)" },
    { id: "custom2", name: "나의 커스텀 2", desc: "KLEVER 스튜디오에서 연동된 모델", bg: "linear-gradient(135deg, #614385 0%, #516395 100%)" },
  ];

  const layoutOptions = [
    { id: "bottom-right", label: "우측 하단 (기본)", boxClass: "br" },
    { id: "bottom-left", label: "좌측 하단", boxClass: "bl" },
    { id: "center", label: "화면 중앙 팝업", boxClass: "center" },
    { id: "top-right", label: "우측 상단", boxClass: "tr" },
    { id: "top-left", label: "좌측 상단", boxClass: "tl" },
  ];

  return (
    <div className={cx("app-root", !isDarkMode && "light-mode")}>
      <div className={cx("agent-settings-container")}>
        <div className={cx("view-header")}>
          <div className={cx("title-area")}>
            <h1 className={cx("main-title")}>
              <span className={cx("highlight")}>KLEVER ONE</span>
            </h1>
            <p className={cx("sub-title")}>디지털휴먼 및 AI 에이전트 통합 제어 환경</p>
          </div>
          <div className={cx("header-buttons")}>
            <button 
              className={cx("btn-icon-theme")} 
              onClick={() => setIsDarkMode(!isDarkMode)}
              title={isDarkMode ? "라이트 모드로 전환" : "다크 모드로 전환"}
            >
              {isDarkMode ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
              )}
            </button>
            <button className={cx("btn-outline")} onClick={handleReset}>초기화</button>
            <button className={cx("btn-primary")} onClick={handleSaveClick}>변경사항 저장</button>
            <button 
              className={cx("btn-icon-back")} 
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

        <div className={cx("settings-tabs")}>
          <button
            className={cx("tab-btn", activeTab === "system" && "active")}
            onClick={() => setActiveTab("system")}
          >
            ⚙️ 시스템 및 AI 연결
          </button>
          <button
            className={cx("tab-btn", activeTab === "agent" && "active")}
            onClick={() => setActiveTab("agent")}
          >
            🤖 에이전트 (캐릭터/음성)
          </button>
          <button
            className={cx("tab-btn", activeTab === "widget" && "active")}
            onClick={() => setActiveTab("widget")}
          >
            🖥️ 챗봇 UI 및 동작
          </button>
        </div>

        <div className={cx("tab-content-area")}>
          {activeTab === "system" && (
            <div className={cx("tab-pane", "fade-in")}>
              <div className={cx("setting-card")}>
                <div className={cx("card-header-flex")} style={{ marginBottom: "16px" }}>
                  <div>
                    <h3 className={cx("card-title")}>API 키 관리</h3>
                    <p className={cx("card-desc")} style={{ marginBottom: 0 }}>
                      여러 에이전트 연동을 위한 인증 키를 발급하고 관리하세요.
                    </p>
                  </div>
                  <button className={cx("btn-klever-sync")} onClick={handleGenerateNewKey}>
                    + 신규 키 발급
                  </button>
                </div>
                
                <div className={cx("api-key-list")}>
                  {apiKeys.map((keyObj) => (
                    <div key={keyObj.id} className={cx("api-key-item")}>
                      <div className={cx("api-key-info")}>
                        <div className={cx("api-key-name-wrap")}>
                          <span className={cx("api-key-name")}>{keyObj.name}</span>
                          <span className={cx("api-key-date")}>{keyObj.date}</span>
                        </div>
                        <input
                          type="text"
                          className={cx("api-key-value")}
                          value={keyObj.value}
                          readOnly
                        />
                      </div>
                      <div className={cx("api-key-actions")}>
                        <button 
                          className={cx("btn-icon")} 
                          onClick={() => handleCopySpecificKey(keyObj.value)} 
                          title="키 복사"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                          </svg>
                        </button>
                        <button 
                          className={cx("btn-text-reissue")} 
                          onClick={() => handleReissueKey(keyObj.id)} 
                        >
                          재발급
                        </button>
                        <button 
                          className={cx("btn-icon", "danger")} 
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

              <div className={cx("setting-card")}>
                <h3 className={cx("card-title")}>인공지능(LLM) 엔진 연결</h3>
                <div className={cx("radio-group")} style={{ marginTop: "16px" }}>
                  <label className={cx("radio-card", llmType === "gpt" && "active")}>
                    <input type="radio" value="gpt" checked={llmType === "gpt"} onChange={(e) => setLlmType(e.target.value)} />
                    <span className={cx("radio-label")}>OpenAI GPT-4o</span>
                  </label>
                  <label className={cx("radio-card", llmType === "gemini" && "active")}>
                    <input type="radio" value="gemini" checked={llmType === "gemini"} onChange={(e) => setLlmType(e.target.value)} />
                    <span className={cx("radio-label")}>Google Gemini 1.5 Pro</span>
                  </label>
                  <label className={cx("radio-card", llmType === "custom" && "active")}>
                    <input type="radio" value="custom" checked={llmType === "custom"} onChange={(e) => setLlmType(e.target.value)} />
                    <span className={cx("radio-label")}>직접 연결 (Custom)</span>
                  </label>
                  <label className={cx("radio-card", llmType === "llamon" && "active")}>
                    <input type="radio" value="llamon" checked={llmType === "llamon"} onChange={(e) => setLlmType(e.target.value)} />
                    <span className={cx("radio-label")}>LLaMON RAG</span>
                  </label>
                </div>
                
                {llmType === "custom" && (
                  <div className={cx("custom-endpoint-box")}>
                    <label>API 엔드포인트 URL (Webhook)</label>
                    <input type="text" className={cx("custom-input", "mt-2")} placeholder="https://your-server.com/api/chat" />
                  </div>
                )}

                {llmType === "llamon" && (
                  <div className={cx("custom-endpoint-box")}>
                    <label style={{ display: "block", marginBottom: "4px" }}>텍스트, URL, 파일</label>
                    <div 
                      className={cx("unified-rag-box", isDragging && "drag-active")}
                      onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
                    >
                      <textarea
                        className={cx("unified-rag-textarea")}
                        placeholder="에이전트가 학습할 텍스트나 URL을 붙여넣거나, 파일을 이곳으로 드래그 앤 드롭하세요."
                        value={ragInput} onChange={(e) => setRagInput(e.target.value)} onKeyDown={handleRagKeyDown}
                      ></textarea>
                      
                      <input 
                        type="file" ref={fileInputRef} style={{ display: "none" }}
                        accept=".pdf,.txt,.doc,.docx" multiple onChange={handleFileChange}
                      />

                      {(ragFiles.length > 0 || ragTexts.length > 0) && (
                        <div className={cx("rag-files-preview")}>
                          {ragTexts.map((item) => (
                            <div key={item.id} className={cx("file-chip")}>
                              {item.type === 'url' ? (
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                              ) : (
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                              )}
                              <span title={item.content}>{item.content}</span>
                              <button type="button" onClick={() => removeRagText(item.id)} title="삭제">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                              </button>
                            </div>
                          ))}

                          {ragFiles.map((file) => (
                            <div key={file.id} className={cx("file-chip")}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>
                              <span>{file.name}</span>
                              <button type="button" onClick={() => removeFile(file.id)} title="삭제">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className={cx("unified-rag-actions")}>
                        <button className={cx("btn-attach")} onClick={handleFileAttach}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg> 파일 첨부
                        </button>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <button className={cx("btn-add-rag")} onClick={handleAddRag}>적용</button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className={cx("setting-card")}>
                <div className={cx("card-header-flex")} style={{ marginBottom: '24px' }}>
                  <div>
                    <h3 className={cx("card-title")}>에이전트 행동 지침 (프롬프팅)</h3>
                    <p className={cx("card-desc")} style={{ marginBottom: '8px' }}>
                      에이전트가 답변 시 지켜야 할 핵심 규칙이나 페르소나를 설정하세요.
                    </p>
                  </div>
                  <div className={cx("mode-toggle-group")}>
                    <button className={cx("mode-toggle-btn", promptMode === 'tag' && "active")} onClick={() => setPromptMode('tag')}>태그 모드</button>
                    <button className={cx("mode-toggle-btn", promptMode === 'manual' && "active")} onClick={() => setPromptMode('manual')}>직접 입력</button>
                  </div>
                </div>
                
                {promptMode === 'tag' && (
                  <div className={cx("prompt-tags-wrap")}>
                    {promptTagOptions.map((tag) => {
                      const isActive = selectedTags.includes(tag.id);
                      return (
                        <div key={tag.id} className={cx("prompt-tag", isActive && "active")} onClick={() => togglePromptTag(tag.id)}>
                          {isActive ? (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                          ) : (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                          )}
                          {tag.label}
                        </div>
                      );
                    })}

                    {customTags.map((tag) => {
                      const isActive = selectedTags.includes(tag.id);
                      return (
                        <div key={tag.id} className={cx("prompt-tag", isActive && "active")} onClick={() => togglePromptTag(tag.id)}>
                          {isActive ? (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                          ) : (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                          )}
                          {tag.label}
                          <button type="button" className={cx("prompt-tag-remove")} onClick={(e) => handleRemoveCustomTag(e, tag.id)} title="태그 삭제">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                          </button>
                        </div>
                      );
                    })}

                    <div className={cx("custom-tag-input-wrap")}>
                      <span style={{color: '#718096', fontSize: '13px'}}>+</span>
                      <input 
                        type="text" className={cx("custom-tag-input")} placeholder="태그 직접 입력" 
                        value={customTagInput} onChange={(e) => setCustomTagInput(e.target.value)} onKeyDown={handleCustomTagKeyDown}
                      />
                      <button className={cx("btn-add-tag")} onClick={handleAddCustomTag}>추가</button>
                    </div>
                  </div>
                )}

                {promptMode === 'manual' && (
                  <textarea
                    className={cx("manual-prompt-textarea")}
                    placeholder="당신은 KLEVER ONE의 안내 에이전트입니다..."
                    value={manualPrompt} onChange={(e) => setManualPrompt(e.target.value)}
                  />
                )}
              </div>
            </div>
          )}

          {activeTab === "agent" && (
            <div className={cx("tab-pane", "fade-in")}>
              <div className={cx("setting-card")} style={{ padding: "24px 28px 32px" }}>
                <div className={cx("card-header-flex")}>
                  <div>
                    <h3 className={cx("card-title")}>디지털휴먼 모델 선택</h3>
                    <p className={cx("card-desc")}>위젯에 표시될 KLEVER ONE 디지털휴먼의 외형을 선택하세요.</p>
                  </div>
                  <button className={cx("btn-klever-sync")}>⟳ 클라우드 동기화</button>
                </div>

                <div style={{ marginBottom: "24px", padding: "16px", backgroundColor: "#0b0d10", border: "1px solid #4a5568", borderRadius: "8px" }}>
                  <label style={{ fontSize: "13px", color: "#cbd5e0", display: "block", marginBottom: "8px", fontWeight: "600" }}>
                    설정할 에이전트(API 키) 선택
                  </label>
                  <select
                    className={cx("custom-select")}
                    value={activeAgent.id} onChange={(e) => setSelectedAgentId(Number(e.target.value))}
                  >
                    {apiKeys.map(key => (
                      <option key={key.id} value={key.id}>{key.name} ({key.value.substring(0, 16)}...)</option>
                    ))}
                  </select>
                </div>

                <div className={cx("character-grid")}>
                  {digitalHumans.map((human) => (
                    <div
                      key={human.id}
                      className={cx("character-card", activeAgent.character === human.id && "selected")}
                      onClick={() => updateCurrentAgent("character", human.id)}
                    >
                      <div
                        className={cx("character-bg")}
                        style={{
                          background: human.image ? `url('${human.image}') center top / cover no-repeat` : human.bg,
                        }}
                      ></div>
                      <div className={cx("character-overlay")}>
                        <div className={cx("character-text")}>
                          <h4>{human.name}</h4>
                          <p>{human.desc}</p>
                        </div>
                        <button className={cx("btn-character")}>
                          {activeAgent.character === human.id ? "선택됨" : "선택하기"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "widget" && (
            <div className={cx("tab-pane", "fade-in")}>
              <div className={cx("setting-card")}>
                <h3 className={cx("card-title")}>챗봇 화면 배치</h3>
                <p className={cx("card-desc")}>사용자 웹사이트에서 위젯이 표시될 위치를 선택하세요.</p>

                <div className={cx("layout-selector")}>
                  {layoutOptions.map((option) => (
                    <div
                      key={option.id}
                      className={cx("layout-item", layout === option.id && "selected")}
                      onClick={() => setLayout(option.id)}
                    >
                      <div className={cx("layout-preview")}>
                        <div className={cx("browser-mockup")}>
                          <div className={cx("widget-box", option.boxClass)}></div>
                        </div>
                      </div>
                      <span>{option.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={cx("setting-card")}>
                <h3 className={cx("card-title")}>동작 설정</h3>
                <div className={cx("form-group", "mt-2")} style={{ maxWidth: "350px" }}>
                  <label>자동 꺼짐 시간 (미사용 시)</label>
                  <div style={{ display: "flex", gap: "16px", width: "100%" }} className="mt-2">
                    <div className={cx("input-with-unit")} style={{ flex: 1 }}>
                      <input type="number" className={cx("custom-input")} value={autoOff} onChange={(e) => setAutoOff(e.target.value)} min="0" />
                      <span className={cx("unit")} style={{ whiteSpace: "nowrap" }}>분</span>
                    </div>
                    <div className={cx("input-with-unit")} style={{ flex: 1 }}>
                      <input type="number" className={cx("custom-input")} value={autoOffSec} onChange={(e) => setAutoOffSec(e.target.value)} min="0" max="59" />
                      <span className={cx("unit")} style={{ whiteSpace: "nowrap" }}>초</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className={cx("setting-card")}>
                <h3 className={cx("card-title")}>웹사이트 삽입 코드</h3>
                <p className={cx("card-desc")}>
                  아래 코드를 복사하여 웹사이트의 <code>&lt;head&gt;</code> 또는 <code>&lt;body&gt;</code> 태그 내에 붙여넣으세요. 설정하신 값들이 적용된 위젯이 즉시 표시됩니다.
                </p>
                <div className={cx("code-container")}>
                  <button className={cx("btn-copy-code")} onClick={handleCopyEmbedCode}>복사하기</button>
                  <pre>{getEmbedCode()}</pre>
                </div>
              </div>
            </div>
          )}
        </div>

        {/****************수정***************/}
        <div>{<DigitalHuman apiKey={import.meta.env.VITE_KLEVER_API_KEY} />}</div>

      </div>

      {/* 모달 파트 */}
      {isModalOpen && (
        <div className={cx("modal-overlay")}>
          <div className={cx("modal-box")}>
            <h2 className={cx("modal-title")}>저장하시겠습니까?</h2>
            <p className={cx("modal-desc")}>설정하신 에이전트 및 위젯 정보가<br/>라이브 서버에 즉시 적용됩니다.</p>
            <div className={cx("modal-buttons")}>
              <button className={cx("btn-outline")} onClick={cancelSave}>취소</button>
              <button className={cx("btn-primary")} onClick={confirmSave}>적용</button>
            </div>
          </div>
        </div>
      )}

      {isExitModalOpen && (
        <div className={cx("modal-overlay")}>
          <div className={cx("modal-box")}>
            <div className={cx("modal-logo")}><span>KLEVER ONE</span></div>
            <p className={cx("modal-desc")}>클레버원 홈페이지로 돌아가시겠어요?<br/>저장하지 않은 변경사항은 사라질 수 있습니다.</p>
            <div className={cx("modal-buttons")}>
              <button className={cx("btn-outline")} onClick={cancelExit}>취소</button>
              <button className={cx("btn-danger")} onClick={confirmExit}>나가기</button>
            </div>
          </div>
        </div>
      )}

      {isNewKeyModalOpen && (
        <div className={cx("modal-overlay")}>
          <div className={cx("modal-box")}>
            <h2 className={cx("modal-title")}>신규 키 발급</h2>
            <p className={cx("modal-desc")} style={{ marginBottom: "16px" }}>새로 발급할 에이전트 키의 이름을 지정하세요.</p>
            <input
              type="text" className={cx("custom-input")} style={{ marginBottom: "24px", textAlign: "center" }}
              value={newKeyNameInput} onChange={(e) => setNewKeyNameInput(e.target.value)} placeholder="예: 영업용 챗봇 키" autoFocus
              onKeyDown={(e) => { if (e.key === "Enter") confirmGenerateNewKey(); }}
            />
            <div className={cx("modal-buttons")}>
              <button className={cx("btn-outline")} onClick={() => setIsNewKeyModalOpen(false)}>취소</button>
              <button className={cx("btn-primary")} onClick={confirmGenerateNewKey}>발급하기</button>
            </div>
          </div>
        </div>
      )}

      {alertMessage && (
        <div className={cx("modal-overlay")}>
          <div className={cx("modal-box")}>
            <h2 className={cx("modal-title")}>알림</h2>
            <p className={cx("modal-desc")} style={{ marginBottom: "24px" }}>{alertMessage}</p>
            <div className={cx("modal-buttons")}>
              <button className={cx("btn-primary")} onClick={() => setAlertMessage("")}>확인</button>
            </div>
          </div>
        </div>
      )}

      {deleteTargetId && (
        <div className={cx("modal-overlay")}>
          <div className={cx("modal-box")}>
            <h2 className={cx("modal-title")}>키 삭제</h2>
            <p className={cx("modal-desc")} style={{ marginBottom: "24px" }}>이 API 키를 삭제하시겠습니까?<br/>연결된 에이전트가 작동하지 않을 수 있습니다.</p>
            <div className={cx("modal-buttons")}>
              <button className={cx("btn-outline")} onClick={() => setDeleteTargetId(null)}>취소</button>
              <button className={cx("btn-danger")} onClick={confirmDeleteKey}>삭제</button>
            </div>
          </div>
        </div>
      )}

      {reissueTargetId && (
        <div className={cx("modal-overlay")}>
          <div className={cx("modal-box")}>
            <h2 className={cx("modal-title")}>키 재발급</h2>
            <p className={cx("modal-desc")} style={{ marginBottom: "24px" }}>이 API 키의 재발급을 신청하시겠습니까?<br/>새로운 키가 발급되면 기존 키로 연결된 에이전트는 더 이상 작동하지 않습니다.</p>
            <div className={cx("modal-buttons")}>
              <button className={cx("btn-outline")} onClick={() => setReissueTargetId(null)}>취소</button>
              <button className={cx("btn-primary")} onClick={confirmReissueKey}>재발급</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}