import { useState, useEffect, useRef } from "react";

const DEFAULT_AGENT = {
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
  keys: { analysis: "", response: "", rag: { gpt: "", gemini: "", llamon: "" } },
};

export function useAgentState() {
  const [apiKeys, setApiKeys] = useState([DEFAULT_AGENT]);
  const [selectedAgentId, setSelectedAgentId] = useState(1);
  const [uiCharacter, setUiCharacter] = useState("chanu");

  // ── 알림 / 모달 상태 ──
  const [alertMessage, setAlertMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [isNewKeyModalOpen, setIsNewKeyModalOpen] = useState(false);
  const [newKeyNameInput, setNewKeyNameInput] = useState("");
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [reissueTargetId, setReissueTargetId] = useState(null);

  const prevAgentIdRef = useRef(null);

  const selectedAgent = apiKeys.find((a) => a.id === selectedAgentId) || apiKeys[0];
  const isAgentSwitch = (newId) => prevAgentIdRef.current !== newId;

  const markAgentSwitched = (id) => {
    prevAgentIdRef.current = id;
  };

  // ── 키 복사 ──
  const handleCopySpecificKey = (value) => {
    try {
      const ta = document.createElement("textarea");
      ta.value = value;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setAlertMessage("API 키가 클립보드에 복사되었습니다!");
    } catch (err) {
      console.error(err);
    }
  };

  // ── 신규 키 발급 ──
  const handleGenerateNewKey = (defaultName) => {
    setNewKeyNameInput(defaultName || `신규 에이전트 키 #${apiKeys.length + 1}`);
    setIsNewKeyModalOpen(true);
  };

  const confirmGenerateNewKey = () => {
    if (!newKeyNameInput.trim()) return;
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let newKey = "sk-live-";
    for (let i = 0; i < 24; i++) newKey += chars.charAt(Math.floor(Math.random() * chars.length));
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    const newKeyObj = {
      id: Date.now(),
      name: newKeyNameInput.trim(),
      value: newKey,
      date: dateStr,
      character: "chanu",
      voice: "",
      language: "ko",
      assistantId: "",
      promptMode: "tag",
      promptTags: ["no_politics", "no_religion", "no_social_controversy", "no_profanity", "polite_tone"],
      customTags: [],
      promptManual: "",
      engines: { analysis: "gpt", rag: "gpt", response: "gpt" },
      keys: { analysis: "", response: "", rag: { gpt: "", gemini: "", llamon: "" } },
    };
    setApiKeys([newKeyObj, ...apiKeys]);
    setSelectedAgentId(newKeyObj.id);
    setIsNewKeyModalOpen(false);
  };

  // ── 키 재발급 ──
  const handleReissueKey = (id) => setReissueTargetId(id);

  const confirmReissueKey = () => {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let newKey = "sk-live-";
    for (let i = 0; i < 24; i++) newKey += chars.charAt(Math.floor(Math.random() * chars.length));
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    setApiKeys((prev) =>
        prev.map((k) => k.id === reissueTargetId ? { ...k, value: newKey, date: dateStr } : k)
    );
    setReissueTargetId(null);
    setAlertMessage("API 키 재발급 요청이 정상적으로 접수되었습니다.");
  };

  // ── 키 삭제 ──
  const handleDeleteKey = (id) => {
    if (apiKeys.length === 1) {
      setAlertMessage("최소 1개의 API 키는 유지해야 합니다.");
      return;
    }
    setDeleteTargetId(id);
  };

  const confirmDeleteKey = () => {
    setApiKeys((prev) => prev.filter((k) => k.id !== deleteTargetId));
    setDeleteTargetId(null);
  };

  // ── 초기화 ──
  const resetAgentState = () => {
    setApiKeys([DEFAULT_AGENT]);
    setSelectedAgentId(1);
    setUiCharacter("chanu");
  };

  return {
    // state
    apiKeys, setApiKeys,
    selectedAgentId, setSelectedAgentId,
    uiCharacter, setUiCharacter,
    selectedAgent,
    alertMessage, setAlertMessage,
    isModalOpen, setIsModalOpen,
    isExitModalOpen, setIsExitModalOpen,
    isNewKeyModalOpen, setIsNewKeyModalOpen,
    newKeyNameInput, setNewKeyNameInput,
    deleteTargetId, setDeleteTargetId,
    reissueTargetId, setReissueTargetId,
    // refs
    prevAgentIdRef,
    isAgentSwitch,
    markAgentSwitched,
    // handlers
    handleCopySpecificKey,
    handleGenerateNewKey,
    confirmGenerateNewKey,
    handleReissueKey,
    confirmReissueKey,
    handleDeleteKey,
    confirmDeleteKey,
    resetAgentState,
  };
}