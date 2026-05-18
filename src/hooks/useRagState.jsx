import { useState, useRef } from "react";
import { processVectorIdFinish, processKnowledgeUpload, createBundle } from "../utils/adminUtils";

export function useRagState({ stageEngines, getMappedLlmType }) {
  const [uiRagType, setUiRagType] = useState("none");
  const [nativeRagId, setNativeRagId] = useState("");
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
  const [ragCache, setRagCache] = useState({
    gpt: { nativeRagId: "", autoAssistantId: "", savedKnowledge: [] },
    gemini: { nativeRagId: "", autoAssistantId: "", savedKnowledge: [] },
    llamon: { nativeRagId: "", autoAssistantId: "", savedKnowledge: [] },
  });

  const fileInputRef = useRef(null);

  // ── 에이전트 전환 시 RAG 상태 초기화 ──
  const resetRagForAgentSwitch = ({ engines, loadedAssistantId }) => {
    setRagCache({
      gpt: { nativeRagId: engines.rag === "gpt" ? loadedAssistantId : "", autoAssistantId: engines.rag === "gpt" ? loadedAssistantId : "", savedKnowledge: [] },
      gemini: { nativeRagId: engines.rag === "gemini" ? loadedAssistantId : "", autoAssistantId: engines.rag === "gemini" ? loadedAssistantId : "", savedKnowledge: [] },
      llamon: { nativeRagId: "", autoAssistantId: "", savedKnowledge: [] },
    });
    setSavedKnowledge([]);
    setSelectedKnowledgeIds([]);
    setRagInput("");
    setRagFiles([]);
    setRagTexts([]);
  };

  // ── Vector ID 확정 ──
  const handleVectorIdFinish = async (setAlertMessage) => {
    setIsUploading(true);
    const currentLlm = getMappedLlmType(stageEngines.rag);
    if (currentLlm !== "gpt") { setIsUploading(false); return; }
    const result = await processVectorIdFinish(nativeRagId, currentLlm, "native", lastVerifiedVsId);
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

  // ── 파일 첨부 ──
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

  // ── 드래그 앤 드롭 ──
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

  // ── 텍스트/URL 입력 ──
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

  // ── 지식 업로드 ──
  const handleUploadKnowledge = (setAlertMessage) => {
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
            const doc = new DOMParser().parseFromString(data.contents, "text/html");
            doc.querySelectorAll("script, style, noscript, iframe, nav, footer").forEach((el) => el.remove());
            return (doc.body.textContent || "").replace(/\s+/g, " ").trim();
          } catch {
            return `[URL 스크랩 실패: ${url}]`;
          }
        };

        for (const item of ragTexts) {
          if (item.type === "url") {
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
          const textBlob = new Blob([textContent], { type: "text/plain" });
          const textFile = new File([textBlob], `scraped_knowledge_${Date.now()}.txt`, { type: "text/plain" });
          combinedFiles.push({ id: `txt_${Date.now()}`, name: "웹사이트_및_텍스트_학습데이터.txt", fileObject: textFile });
        }

        const currentLlm = getMappedLlmType(stageEngines.rag);
        const safeRagId = currentLlm === "gpt" ? nativeRagId : "gemini_bypass_id";
        const assistantIdRes = await processKnowledgeUpload(combinedFiles, currentLlm, "native", safeRagId);
        if (assistantIdRes && currentLlm === "gpt") setAutoAssistantId(assistantIdRes);

        const newBundle = createBundle(ragInput, ragTexts, ragFiles);
        setSavedKnowledge((prev) => [newBundle, ...prev]);
        setSelectedKnowledgeIds((prev) => [...prev, newBundle.id]);

        const serverName = currentLlm === "gpt" ? "OpenAI Vector Store" : "Gemini 서버";
        setAlertMessage(`데이터가 성공적으로 ${serverName}에 업로드 되었습니다.\n(URL 스크랩 완료)`);
        setRagInput("");
        setRagFiles([]);
        setRagTexts([]);
        if (!isKnowledgeListOpen) setIsKnowledgeListOpen(true);
      } catch (error) {
        setAlertMessage(error.message || "업로드 중 알 수 없는 오류가 발생했습니다.");
      } finally {
        setIsUploading(false);
      }
    }, 100);
  };

  // ── 지식 선택/수정/삭제 ──
  const handleToggleKnowledgeSelection = (id) =>
    setSelectedKnowledgeIds((prev) =>
      prev.includes(id) ? prev.filter((k) => k !== id) : [...prev, id]
    );

  const handleEditKnowledge = (itemToEdit) => {
    setSavedKnowledge((prev) => prev.filter((item) => item.id !== itemToEdit.id));
    setSelectedKnowledgeIds((prev) => prev.filter((id) => id !== itemToEdit.id));
    const newTexts = [];
    const newFiles = [];
    itemToEdit.items.forEach((subItem) => {
      if (subItem.type === "text" || subItem.type === "url")
        newTexts.push({ id: subItem.id, type: subItem.type, content: subItem.content });
      else if (subItem.type === "document")
        newFiles.push({ id: subItem.id, name: subItem.content, fileObject: subItem.fileObject });
    });
    setRagTexts((prev) => [...prev, ...newTexts]);
    setRagFiles((prev) => [...prev, ...newFiles]);
  };

  const handleDeleteKnowledge = (id) => {
    setSavedKnowledge((prev) => prev.filter((k) => k.id !== id));
    setSelectedKnowledgeIds((prev) => prev.filter((kid) => kid !== id));
  };

  // ── 초기화 ──
  const resetRagState = () => {
    setUiRagType("none");
    setNativeRagId("");
    setRagInput("");
    setRagFiles([]);
    setRagTexts([]);
    setSavedKnowledge([]);
    setSelectedKnowledgeIds([]);
    setAutoAssistantId("");
    setLastVerifiedVsId("");
  };

  return {
    // state
    uiRagType, setUiRagType,
    nativeRagId, setNativeRagId,
    ragInput, setRagInput,
    ragFiles, setRagFiles,
    ragTexts, setRagTexts,
    isDragging,
    isUploading,
    savedKnowledge, setSavedKnowledge,
    selectedKnowledgeIds, setSelectedKnowledgeIds,
    isKnowledgeListOpen, setIsKnowledgeListOpen,
    autoAssistantId, setAutoAssistantId,
    lastVerifiedVsId, setLastVerifiedVsId,
    ragCache, setRagCache,
    // refs
    fileInputRef,
    // handlers
    resetRagForAgentSwitch,
    handleVectorIdFinish,
    handleFileAttach,
    handleFileChange,
    removeFile,
    removeRagText,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleRagKeyDown,
    handleUploadKnowledge,
    handleToggleKnowledgeSelection,
    handleEditKnowledge,
    handleDeleteKnowledge,
    resetRagState,
  };
}
