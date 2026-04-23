import { 
  uploadFilesToVectorStore, 
  linkVectorStoreToAssistant, 
  uploadFilesToGemini 
} from "../services/ragService";

// 🚀 기본 제공 MCP 리스트 (하드코딩 파라미터 제외, 순수 범용 구조)
export const DEFAULT_MCP_LIST = [
  { 
    id: "web_search", 
    name: "웹 검색 (Web Search)", 
    desc: "실시간 웹 검색 결과를 기반으로 최신 정보를 반영합니다.", 
    type: "built-in", 
    method: "GET",
    active: true,
    apiKey: "",
    parameters: [
      { key: "query", type: "string", desc: "검색어" },
      { key: "num_results", type: "number", desc: "가져올 결과 개수 (기본: 5)" }
    ]
  },
  { 
    id: "calculator", 
    name: "수학 및 코드 실행기", 
    desc: "복잡한 수식이나 코드를 실행하여 정확한 결과값을 도출합니다.", 
    type: "built-in", 
    method: "GET",
    active: false,
    apiKey: "",
    parameters: [
      { key: "expression", type: "string", desc: "계산할 수학 수식 또는 코드" }
    ]
  }
];

export const loadSavedConfig = (setApiKeys, setLayout, setAutoOff, setAutoOffSec, setMcpList) => {
  const savedAdminConfig = localStorage.getItem("klever_admin_config");
  if (savedAdminConfig) {
    const parsedConfig = JSON.parse(savedAdminConfig);
    if (parsedConfig.apiKeys) setApiKeys(parsedConfig.apiKeys);
    if (parsedConfig.layout) setLayout(parsedConfig.layout);
    if (parsedConfig.autoOff !== undefined) setAutoOff(parsedConfig.autoOff);
    if (parsedConfig.autoOffSec !== undefined) setAutoOffSec(parsedConfig.autoOffSec);
    if (parsedConfig.mcpList) setMcpList(parsedConfig.mcpList);
    else setMcpList(DEFAULT_MCP_LIST);
  } else {
    setMcpList(DEFAULT_MCP_LIST);
  }
};

export const syncTagsToStorage = (apiKeys, selectedAgentId, newCustomTags, newSelectedTags, setApiKeys) => {
  const updatedApiKeys = apiKeys.map(agent => 
    agent.id === selectedAgentId ? { ...agent, promptTags: newSelectedTags, customTags: newCustomTags } : agent
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

export const syncMcpToStorage = (newMcpList, setMcpList) => {
  setMcpList(newMcpList);
  const adminConfig = JSON.parse(localStorage.getItem("klever_admin_config") || "{}");
  adminConfig.mcpList = newMcpList;
  localStorage.setItem("klever_admin_config", JSON.stringify(adminConfig));

  const widgetConfig = JSON.parse(localStorage.getItem("klever_widget_config") || "{}");
  widgetConfig.mcpList = newMcpList;
  localStorage.setItem("klever_widget_config", JSON.stringify(widgetConfig));
};

export const saveConfiguration = ({
  apiKeys, selectedAgentId, uiCharacter, uiLlmType, uiRagType,
  autoAssistantId, promptMode, selectedTags, customTags, manualPrompt,
  layout, autoOff, autoOffSec, digitalHumans, mcpList, setApiKeys
}) => {
  const updatedApiKeys = apiKeys.map(agent => 
    agent.id === selectedAgentId ? { 
      ...agent, character: uiCharacter, llm: uiLlmType,
      assistantId: uiRagType === "native" ? autoAssistantId : "",
      promptMode: promptMode, promptTags: selectedTags, customTags: customTags, promptManual: manualPrompt 
    } : agent
  );
  setApiKeys(updatedApiKeys);

  const savedAgent = updatedApiKeys.find(a => a.id === selectedAgentId);
  const selectedHuman = digitalHumans.find(human => human.id === savedAgent.character);

  const widgetConfig = {
    layout: layout,
    avatarnum: selectedHuman ? selectedHuman.num : 1,
    llm: savedAgent.llm || "gpt",
    assistantId: savedAgent.assistantId || "",
    promptMode: savedAgent.promptMode, 
    promptTags: savedAgent.promptTags, 
    customTags: savedAgent.customTags,
    promptManual: savedAgent.promptManual,
    mcpList: mcpList
  };
  localStorage.setItem("klever_widget_config", JSON.stringify(widgetConfig));

  const adminConfig = { apiKeys: updatedApiKeys, layout, autoOff, autoOffSec, mcpList };
  localStorage.setItem("klever_admin_config", JSON.stringify(adminConfig));
};

export const processVectorIdFinish = async (nativeRagId, uiLlmType, uiRagType, lastVerifiedVsId) => {
  const currentId = nativeRagId.trim();
  if (!currentId || uiLlmType !== "gpt" || uiRagType !== "native" || currentId === lastVerifiedVsId) return { skip: true }; 
  const result = await linkVectorStoreToAssistant(import.meta.env.VITE_OPENAI_API_KEY, currentId);
  return { skip: false, success: result.success, assistantId: result.assistantId, message: result.message, currentId };
};

export const processKnowledgeUpload = async (ragFiles, uiLlmType, uiRagType, nativeRagId) => {
  if (ragFiles.length === 0) return null;
  if (uiRagType !== "native") throw new Error("현재 파일 업로드는 Native 연동일 때만 작동합니다.");

  const inputId = nativeRagId.trim();
  if (!inputId) throw new Error("Vector Store ID 또는 Assistant ID를 입력해주세요.");

  if (uiLlmType === "gpt") {
    const openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY;
    let targetVectorStoreId = inputId;

    if (inputId.startsWith("asst_")) {
      const asstRes = await fetch(`https://api.openai.com/v1/assistants/${inputId}`, {
        method: "GET", headers: { "Authorization": `Bearer ${openaiApiKey}`, "OpenAI-Beta": "assistants=v2" }
      });
      const asstData = await asstRes.json();
      const attachedVsId = asstData.tool_resources?.file_search?.vector_store_ids?.[0];
      if (attachedVsId) targetVectorStoreId = attachedVsId;
      else throw new Error("이 Assistant에는 연결된 Vector Store가 없습니다.");
    }
    await uploadFilesToVectorStore(openaiApiKey, targetVectorStoreId, ragFiles);
    return null;
  } else if (uiLlmType === "gemini") {
    return JSON.stringify(await uploadFilesToGemini(import.meta.env.VITE_GEMINAI_API_KEY, ragFiles));
  }
  return null;
};

export const createBundle = (ragInput, ragTexts, ragFiles) => {
  const bundleItems = [];
  if (ragInput.trim()) bundleItems.push({ id: `k1_${Date.now()}`, type: ragInput.startsWith("http") ? 'url' : 'text', content: ragInput.trim() });
  ragTexts.forEach((t, i) => bundleItems.push({ id: `k2_${Date.now()}_${i}`, type: t.type, content: t.content }));
  ragFiles.forEach(f => bundleItems.push({ id: f.id, type: 'document', content: f.name, fileObject: f.fileObject || f.file }));
  return { id: `bundle_${Date.now()}`, type: bundleItems.length > 1 ? "collection" : "document", name: bundleItems[0]?.content || "새 지식", date: new Date().toISOString().split('T')[0], items: bundleItems };
};

export const buildOpenAITools = (mcpList) => {
  const activeMcps = mcpList?.filter(m => m.active) || [];
  if (activeMcps.length === 0) return undefined;
  return activeMcps.map(mcp => ({
    type: "function",
    function: {
      name: mcp.id.replace(/[^a-zA-Z0-9_]/g, '_'),
      description: mcp.desc || mcp.name,
      parameters: {
        type: "object",
        properties: mcp.parameters.reduce((acc, p) => ({ ...acc, [p.key]: { type: p.type === 'number' ? 'number' : 'string', description: p.desc } }), {}),
        required: mcp.parameters.map(p => p.key)
      }
    }
  }));
};

export const buildGeminiTools = (mcpList) => {
  const activeMcps = mcpList?.filter(m => m.active) || [];
  if (activeMcps.length === 0) return undefined;
  return [{
    functionDeclarations: activeMcps.map(mcp => ({
      name: mcp.id.replace(/[^a-zA-Z0-9_]/g, '_'),
      description: mcp.desc || mcp.name,
      parameters: {
        type: "OBJECT",
        properties: mcp.parameters.reduce((acc, p) => ({ ...acc, [p.key]: { type: p.type === 'number' ? 'NUMBER' : 'STRING', description: p.desc } }), {}),
        required: mcp.parameters.map(p => p.key)
      }
    }))
  }];
};

// 💡 [진짜 범용 MCP 로직] 특정 API 하드코딩을 전부 제거하고, 점(.) 표기법을 통해 알아서 중첩 JSON을 만들도록 설계했습니다.
export const executeMcpTool = async (toolName, args, mcpList) => {
  const mcp = mcpList.find(m => m.id.replace(/[^a-zA-Z0-9_]/g, '_') === toolName);
  if (!mcp) return JSON.stringify({ error: "도구를 찾을 수 없습니다." });

  console.log(`[🤖 범용 MCP 실행] ${mcp.name} (${mcp.method || 'GET'})`, args);

  try {
    if (mcp.id === "calculator") return JSON.stringify({ result: new Function('return ' + args.expression)() });
    if (mcp.id === "web_search") return JSON.stringify({ result: `[가상 검색] '${args.query}' 검색 결과.` });

    const headers = { "Content-Type": "application/json" };
    if (mcp.apiKey) headers["Authorization"] = mcp.apiKey.startsWith("Bearer ") ? mcp.apiKey : `Bearer ${mcp.apiKey}`;

    const method = mcp.method || "GET";
    let fetchOptions = { method, headers };

    if (method === "POST") {
      // 🚀 마법의 변환기: 'start.dateTime' 같은 평면 키값을 { start: { dateTime: "..." } } 형태로 자동 조립해줍니다.
      const buildNestedObject = (flatObj) => {
        const result = {};
        for (const key in flatObj) {
          const keys = key.split('.');
          keys.reduce((acc, part, idx) => {
            if (idx === keys.length - 1) acc[part] = flatObj[key];
            else acc[part] = acc[part] || {};
            return acc[part];
          }, result);
        }
        return result;
      };

      const finalBodyData = buildNestedObject(args); // 무조건 범용적으로 변환

      fetchOptions.body = JSON.stringify(finalBodyData);
      const res = await fetch(mcp.desc, fetchOptions);
      const data = await res.json();
      return JSON.stringify(data);
      
    } else {
      const url = new URL(mcp.desc);
      Object.keys(args).forEach(key => url.searchParams.append(key, String(args[key])));
      const res = await fetch(url.toString(), fetchOptions);
      const data = await res.json();
      return JSON.stringify(data);
    }
  } catch (e) {
    console.error("[MCP 실행 오류]", e);
    return JSON.stringify({ error: e.message });
  }
};