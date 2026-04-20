import { 
  uploadFilesToVectorStore, 
  linkVectorStoreToAssistant, 
  uploadFilesToGemini 
} from "../services/ragService";

// 1. 초기 렌더링 시 스토리지에서 설정 불러오기
export const loadSavedConfig = (setApiKeys, setLayout, setAutoOff, setAutoOffSec) => {
  const savedAdminConfig = localStorage.getItem("klever_admin_config");
  if (savedAdminConfig) {
    const parsedConfig = JSON.parse(savedAdminConfig);
    
    if (parsedConfig.apiKeys) setApiKeys(parsedConfig.apiKeys);
    if (parsedConfig.layout) setLayout(parsedConfig.layout);
    if (parsedConfig.autoOff !== undefined) setAutoOff(parsedConfig.autoOff);
    if (parsedConfig.autoOffSec !== undefined) setAutoOffSec(parsedConfig.autoOffSec);
  }
};

// 2. 태그 변경 시 스토리지에 즉시 동기화
export const syncTagsToStorage = (apiKeys, selectedAgentId, newCustomTags, newSelectedTags, setApiKeys) => {
  const updatedApiKeys = apiKeys.map(agent => 
    agent.id === selectedAgentId ? { 
      ...agent, 
      promptTags: newSelectedTags,
      customTags: newCustomTags 
    } : agent
  );
  setApiKeys(updatedApiKeys);

  const adminConfig = JSON.parse(localStorage.getItem("klever_admin_config") || "{}");
  adminConfig.apiKeys = updatedApiKeys;
  localStorage.setItem("klever_admin_config", JSON.stringify(adminConfig));

  const widgetConfig = JSON.parse(localStorage.getItem("klever_widget_config") || "{}");
  widgetConfig.promptTags = newSelectedTags;
  widgetConfig.customTags = newCustomTags;
  localStorage.setItem("klever_widget_config", JSON.stringify(widgetConfig));
};

// 3. 설정 완료 및 저장
export const saveConfiguration = ({
  apiKeys, selectedAgentId, uiCharacter, uiLlmType, uiRagType,
  autoAssistantId, promptMode, selectedTags, customTags, manualPrompt,
  layout, autoOff, autoOffSec, digitalHumans, setApiKeys
}) => {
  const updatedApiKeys = apiKeys.map(agent => 
    agent.id === selectedAgentId ? { 
      ...agent, 
      character: uiCharacter,
      llm: uiLlmType,
      assistantId: uiRagType === "native" ? autoAssistantId : "",
      promptMode: promptMode,
      promptTags: selectedTags,
      customTags: customTags, 
      promptManual: manualPrompt 
    } : agent
  );

  setApiKeys(updatedApiKeys);

  const savedAgent = updatedApiKeys.find(a => a.id === selectedAgentId);
  const selectedHuman = digitalHumans.find(human => human.id === savedAgent.character);
  const currentAvatarNum = selectedHuman ? selectedHuman.num : 1;

  const widgetConfig = {
    layout: layout,
    avatarnum: currentAvatarNum,
    llm: savedAgent.llm || "gpt",
    assistantId: savedAgent.assistantId || "",
    promptMode: savedAgent.promptMode, 
    promptTags: savedAgent.promptTags, 
    customTags: savedAgent.customTags,
    promptManual: savedAgent.promptManual 
  };
  localStorage.setItem("klever_widget_config", JSON.stringify(widgetConfig));

  const adminConfig = {
    apiKeys: updatedApiKeys,
    layout: layout,
    autoOff: autoOff,
    autoOffSec: autoOffSec
  };
  localStorage.setItem("klever_admin_config", JSON.stringify(adminConfig));
};

// 4. Vector Store ID 검증 및 연결
export const processVectorIdFinish = async (nativeRagId, uiLlmType, uiRagType, lastVerifiedVsId) => {
  const currentId = nativeRagId.trim();
  if (!currentId || uiLlmType !== "gpt" || uiRagType !== "native") return { skip: true };
  if (currentId === lastVerifiedVsId) return { skip: true }; 

  const openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY || "YOUR_OPENAI_API_KEY";
  const result = await linkVectorStoreToAssistant(openaiApiKey, currentId);
  
  return {
    skip: false,
    success: result.success,
    assistantId: result.assistantId,
    message: result.message,
    currentId
  };
};

// 5. 서버로 RAG 파일 업로드 처리
export const processKnowledgeUpload = async (ragFiles, uiLlmType, uiRagType, nativeRagId) => {
  if (ragFiles.length === 0) return null;

  for (const f of ragFiles) {
    const actualFile = f.fileObject || f.file;
    if (!actualFile || !(actualFile instanceof Blob)) {
      throw new Error(`[데이터 유실] '${f.name}'의 실제 파일 데이터가 없습니다. 첨부파일(x) 버튼을 눌러 지우고, 다시 첨부해주세요.`);
    }
  }

  if (uiRagType !== "native") {
    throw new Error("현재 파일 업로드는 Native 연동일 때만 작동합니다.");
  }

  if (uiLlmType === "gpt") {
    if (!nativeRagId.trim()) {
      throw new Error("파일을 Vector Store에 연동하려면 Vector Store ID를 먼저 입력해주세요.");
    }
    const openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY;
    await uploadFilesToVectorStore(openaiApiKey, nativeRagId, ragFiles);
    return null;

  } else if (uiLlmType === "gemini") {
    const geminiApiKey = import.meta.env.VITE_GEMINAI_API_KEY;
    const uploadedGeminiFiles = await uploadFilesToGemini(geminiApiKey, ragFiles);
    return JSON.stringify(uploadedGeminiFiles);
  }
  
  return null;
};

// 6. UI 리스트 렌더링용 데이터 묶음(Bundle) 생성
export const createBundle = (ragInput, ragTexts, ragFiles) => {
  const bundleItems = [];
  const today = new Date().toISOString().split('T')[0];
  
  if (ragInput.trim()) {
    const isUrl = ragInput.startsWith("http://") || ragInput.startsWith("https://");
    bundleItems.push({
      id: `k_${Date.now()}_1`,
      type: isUrl ? 'url' : 'text',
      content: ragInput.trim()
    });
  }

  ragTexts.forEach((item, index) => {
    bundleItems.push({
      id: `k_${Date.now()}_2_${index}`,
      type: item.type,
      content: item.content
    });
  });
  
  ragFiles.forEach(file => {
    bundleItems.push({
      id: file.id,
      type: 'document',
      content: file.name,
      fileObject: file.fileObject || file.file 
    });
  });
  
  let repName = "새 지식 데이터";
  let mainType = "document";
  
  if (bundleItems.length > 0) {
    repName = bundleItems[0].content;
    mainType = bundleItems[0].type;
    
    if (bundleItems.length > 1) {
      const shortName = repName.length > 12 ? repName.substring(0, 12) + "..." : repName;
      repName = `${shortName} 외 ${bundleItems.length - 1}건`;
      mainType = "collection"; 
    }
  }

  return {
    id: `bundle_${Date.now()}`,
    type: mainType,
    name: repName,
    date: today,
    items: bundleItems
  };
};