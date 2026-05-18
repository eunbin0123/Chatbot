import { useState } from "react";

export function usePromptState({ selectedAgentId, setApiKeys }) {
  const [selectedTags, setSelectedTags] = useState([
    "no_politics", "no_religion", "no_social_controversy", "no_profanity", "polite_tone",
  ]);
  const [promptMode, setPromptMode] = useState("tag");
  const [customTags, setCustomTags] = useState([]);
  const [customTagInput, setCustomTagInput] = useState("");
  const [manualPrompt, setManualPrompt] = useState("");

  // ── 기본 태그 목록 ──
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

  // ── 태그 토글 ──
  const togglePromptTag = (tagId) => {
    const updated = selectedTags.includes(tagId)
      ? selectedTags.filter((id) => id !== tagId)
      : [...selectedTags, tagId];
    setSelectedTags(updated);
    setApiKeys((prev) =>
      prev.map((k) => k.id === selectedAgentId ? { ...k, promptTags: updated } : k)
    );
  };

  // ── 커스텀 태그 추가 ──
  const handleAddCustomTag = () => {
    const trimmed = customTagInput.trim();
    if (!trimmed) return;
    const tagId = `custom_${Date.now()}`;
    const updatedCustomTags = [...customTags, { id: tagId, label: trimmed }];
    const updatedSelectedTags = [...selectedTags, tagId];
    setCustomTags(updatedCustomTags);
    setSelectedTags(updatedSelectedTags);
    setCustomTagInput("");
    setApiKeys((prev) =>
      prev.map((k) =>
        k.id === selectedAgentId
          ? { ...k, customTags: updatedCustomTags, promptTags: updatedSelectedTags }
          : k
      )
    );
  };

  // ── 커스텀 태그 삭제 ──
  const handleRemoveCustomTag = (e, tagId) => {
    e.stopPropagation();
    const updatedCustomTags = customTags.filter((tag) => tag.id !== tagId);
    const updatedSelectedTags = selectedTags.filter((id) => id !== tagId);
    setCustomTags(updatedCustomTags);
    setSelectedTags(updatedSelectedTags);
    setApiKeys((prev) =>
      prev.map((k) =>
        k.id === selectedAgentId
          ? { ...k, customTags: updatedCustomTags, promptTags: updatedSelectedTags }
          : k
      )
    );
  };

  // ── 에이전트 전환 시 프롬프트 상태 복원 ──
  const restorePromptFromAgent = (agent) => {
    setPromptMode(agent.promptMode || "tag");
    setSelectedTags(agent.promptTags || ["no_politics", "no_religion", "no_social_controversy", "no_profanity", "polite_tone"]);
    setCustomTags(agent.customTags || []);
    setManualPrompt(agent.promptManual || "");
  };

  // ── 초기화 ──
  const resetPromptState = () => {
    setSelectedTags(["no_politics", "no_religion", "no_social_controversy", "no_profanity", "polite_tone"]);
    setPromptMode("tag");
    setCustomTags([]);
    setCustomTagInput("");
    setManualPrompt("");
  };

  return {
    // state
    selectedTags, setSelectedTags,
    promptMode, setPromptMode,
    customTags, setCustomTags,
    customTagInput, setCustomTagInput,
    manualPrompt, setManualPrompt,
    // data
    promptTagOptions,
    // handlers
    togglePromptTag,
    handleAddCustomTag,
    handleRemoveCustomTag,
    restorePromptFromAgent,
    resetPromptState,
  };
}
