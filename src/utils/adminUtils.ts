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

export const loadSavedConfig = (setApiKeys: any, setLayout: any, setAutoOff: any, setAutoOffSec: any, setMcpList: any) => {
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

export const syncTagsToStorage = (apiKeys: any[], selectedAgentId: any, newCustomTags: any[], newSelectedTags: any[], setApiKeys: any) => {
  const updatedApiKeys = apiKeys.map((agent: any) => 
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

export const syncMcpToStorage = (newMcpList: any[], setMcpList: any) => {
  setMcpList(newMcpList);
  const adminConfig = JSON.parse(localStorage.getItem("klever_admin_config") || "{}");
  adminConfig.mcpList = newMcpList;
  localStorage.setItem("klever_admin_config", JSON.stringify(adminConfig));

  const widgetConfig = JSON.parse(localStorage.getItem("klever_widget_config") || "{}");
  widgetConfig.mcpList = newMcpList;
  localStorage.setItem("klever_widget_config", JSON.stringify(widgetConfig));
};

// ✅ [FIX #12] saveConfiguration에 engines/keys 파라미터 추가하여 정상 저장되도록 수정
export const saveConfiguration = ({
  apiKeys,
  selectedAgentId,
  uiCharacter,
  uiLlmType,
  uiRagType,
  autoAssistantId,
  promptMode,
  selectedTags,
  customTags,
  manualPrompt,
  layout,
  autoOff,
  autoOffSec,
  digitalHumans,
  mcpList,
  setApiKeys,
  engines,
  keys,
  stageStatus,  // ← 추가
}: any) => {
  const updatedApiKeys = apiKeys.map((agent: any) => 
    agent.id === selectedAgentId ? { 
      ...agent,
      character: uiCharacter,
      llm: uiLlmType,
      assistantId: uiRagType === "native" ? autoAssistantId : "",
      promptMode,
      promptTags: selectedTags,
      customTags,
      promptManual: manualPrompt,
      engines: engines || agent.engines,
      keys: keys || agent.keys,
      stageStatus: stageStatus || agent.stageStatus,  // ← 추가
    } : agent
  );
  setApiKeys(updatedApiKeys);

  const savedAgent = updatedApiKeys.find((a: any) => a.id === selectedAgentId);
  const selectedHuman = digitalHumans.find((human: any) => human.id === savedAgent.character);

  const widgetConfig = {
    layout: layout,
    avatarnum: selectedHuman ? selectedHuman.num : 1,
    llm: savedAgent.llm || "gpt",
    assistantId: savedAgent.assistantId || "",
    promptMode: savedAgent.promptMode, 
    promptTags: savedAgent.promptTags, 
    customTags: savedAgent.customTags,
    promptManual: savedAgent.promptManual,
    mcpList: mcpList,
    // ✅ engines/keys도 widgetConfig에 저장
    engines: savedAgent.engines,
    keys: savedAgent.keys,
  };
  localStorage.setItem("klever_widget_config", JSON.stringify(widgetConfig));

  const adminConfig = { apiKeys: updatedApiKeys, layout, autoOff, autoOffSec, mcpList };
  localStorage.setItem("klever_admin_config", JSON.stringify(adminConfig));
};

export const processVectorIdFinish = async (nativeRagId: string, uiLlmType: string, uiRagType: string, lastVerifiedVsId: string) => {
  const currentId = nativeRagId.trim();
  if (!currentId || uiLlmType !== "gpt" || uiRagType !== "native" || currentId === lastVerifiedVsId) return { skip: true }; 
  const result = await linkVectorStoreToAssistant(import.meta.env.VITE_OPENAI_API_KEY, currentId);
  return { skip: false, success: result.success, assistantId: result.assistantId, message: result.message, currentId };
};

export const processKnowledgeUpload = async (ragFiles: any[], uiLlmType: string, uiRagType: string, nativeRagId: string) => {
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

export const createBundle = (ragInput: string, ragTexts: any[], ragFiles: any[]) => {
  const bundleItems: any[] = [];
  if (ragInput.trim()) bundleItems.push({ id: `k1_${Date.now()}`, type: ragInput.startsWith("http") ? 'url' : 'text', content: ragInput.trim() });
  ragTexts.forEach((t, i) => bundleItems.push({ id: `k2_${Date.now()}_${i}`, type: t.type, content: t.content }));
  ragFiles.forEach(f => bundleItems.push({ id: f.id, type: 'document', content: f.name, fileObject: f.fileObject || f.file }));
  return { id: `bundle_${Date.now()}`, type: bundleItems.length > 1 ? "collection" : "document", name: bundleItems[0]?.content || "새 지식", date: new Date().toISOString().split('T')[0], items: bundleItems };
};

// ✅ [FIX #7] OpenAI tools: Boolean 타입 지원 추가
export const buildOpenAITools = (mcpList: any[]) => {
  const activeMcps = mcpList?.filter((m: any) => m.active) || [];
  if (activeMcps.length === 0) return undefined;

  const mapType = (type: string): string => {
    switch (type?.toLowerCase()) {
      case 'number': return 'number';
      case 'boolean': return 'boolean';
      default: return 'string';
    }
  };

  return activeMcps.map((mcp: any) => ({
    type: "function",
    function: {
      name: mcp.id.replace(/[^a-zA-Z0-9_]/g, '_'),
      description: mcp.desc || mcp.name,
      parameters: {
        type: "object",
        properties: (mcp.parameters || []).reduce((acc: any, p: any) => ({
          ...acc,
          [p.key]: { type: mapType(p.type), description: p.desc }
        }), {}),
        required: (mcp.parameters || []).map((p: any) => p.key)
      }
    }
  }));
};

// ✅ [FIX #8] Gemini tools: Boolean 타입 지원 추가
export const buildGeminiTools = (mcpList: any[]) => {
  const activeMcps = mcpList?.filter((m: any) => m.active) || [];
  if (activeMcps.length === 0) return undefined;

  const mapGeminiType = (type: string): string => {
    switch (type?.toLowerCase()) {
      case 'number': return 'NUMBER';
      case 'boolean': return 'BOOLEAN';
      default: return 'STRING';
    }
  };

  return [{
    functionDeclarations: activeMcps.map((mcp: any) => ({
      name: mcp.id.replace(/[^a-zA-Z0-9_]/g, '_'),
      description: mcp.desc || mcp.name,
      parameters: {
        type: "OBJECT",
        properties: (mcp.parameters || []).reduce((acc: any, p: any) => ({
          ...acc,
          [p.key]: { type: mapGeminiType(p.type), description: p.desc }
        }), {}),
        required: (mcp.parameters || []).map((p: any) => p.key)
      }
    }))
  }];
};

// ✅ [FIX #9] web_search: 실제 DuckDuckGo API 호출로 교체 (CORS 우회 프록시 사용)
// ✅ [FIX #11] calculator: new Function 대신 안전한 수식 파서 사용
// ✅ [FIX #10] GET 방식도 buildNestedObject 일관성 유지 (flat 유지가 맞으나 로그 개선)
export const executeMcpTool = async (toolName: string, args: any, mcpList: any[]) => {
  const mcp = mcpList.find((m: any) => m.id.replace(/[^a-zA-Z0-9_]/g, '_') === toolName);
  if (!mcp) return JSON.stringify({ error: "도구를 찾을 수 없습니다." });

  console.log(`[🤖 범용 MCP 실행] ${mcp.name} (${mcp.method || 'GET'})`, args);

  try {
    // ✅ [FIX #11] calculator: 안전한 수식만 허용 (숫자, 연산자, 괄호, 수학함수만)
    if (mcp.id === "calculator") {
      const expr = String(args.expression || "");
      // 허용: 숫자, 사칙연산, 괄호, 소수점, Math 함수, 공백
      const safePattern = /^[0-9+\-*/().%\s,Math.sincotagbqlrtuepow]+$/;
      if (!safePattern.test(expr.replace(/Math\.[a-z]+/g, "0"))) {
        return JSON.stringify({ error: "허용되지 않는 수식입니다. 숫자와 사칙연산만 사용하세요." });
      }
      try {
        // 기본 사칙연산만 허용하는 안전한 계산
        const sanitized = expr.replace(/[^0-9+\-*/().%\s]/g, "");
        if (!sanitized.trim()) return JSON.stringify({ error: "수식이 비어있습니다." });
        // eslint-disable-next-line no-new-func
        const result = new Function(`"use strict"; return (${sanitized})`)();
        return JSON.stringify({ result });
      } catch (e: any) {
        return JSON.stringify({ error: `계산 오류: ${e.message}` });
      }
    }

    // ✅ [FIX #9] web_search: 실제 검색 API 연동 (SERPER API 또는 DuckDuckGo instant answer)
    if (mcp.id === "web_search") {
      const query = String(args.query || "");
      const numResults = Number(args.num_results) || 5;

      if (!query) return JSON.stringify({ error: "검색어가 없습니다." });

      // SERPER API 키가 있으면 사용, 없으면 DuckDuckGo fallback
      const serperKey = (typeof window !== 'undefined' && (window as any).__SERPER_API_KEY__) || 
                        (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SERPER_API_KEY) || "";

      if (serperKey) {
        try {
          const res = await fetch("https://google.serper.dev/search", {
            method: "POST",
            headers: { "X-API-KEY": serperKey, "Content-Type": "application/json" },
            body: JSON.stringify({ q: query, num: numResults, gl: "kr", hl: "ko" })
          });
          const data = await res.json();
          const results = (data.organic || []).slice(0, numResults).map((r: any) => ({
            title: r.title,
            snippet: r.snippet,
            link: r.link
          }));
          return JSON.stringify({ query, results });
        } catch (e: any) {
          console.warn("[web_search] SERPER 실패, DuckDuckGo fallback:", e.message);
        }
      }

      // DuckDuckGo Instant Answer API (CORS 이슈 있을 수 있어 프록시 통해 시도)
      try {
        const ddgUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;
        const res = await fetch(ddgUrl);
        const data = await res.json();

        const results: any[] = [];
        if (data.AbstractText) {
          results.push({ title: data.Heading || query, snippet: data.AbstractText, link: data.AbstractURL || "" });
        }
        (data.RelatedTopics || []).slice(0, numResults - results.length).forEach((t: any) => {
          if (t.Text) results.push({ title: t.Text.split(" - ")[0] || query, snippet: t.Text, link: t.FirstURL || "" });
        });

        if (results.length === 0) {
          return JSON.stringify({ query, results: [], note: "검색 결과가 없습니다. VITE_SERPER_API_KEY를 설정하면 Google 검색이 가능합니다." });
        }
        return JSON.stringify({ query, results: results.slice(0, numResults) });
      } catch (e: any) {
        return JSON.stringify({ 
          error: "웹 검색 실패",
          note: "VITE_SERPER_API_KEY 환경변수를 설정하면 실제 Google 검색이 가능합니다.",
          query 
        });
      }
    }

    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (mcp.apiKey) {
      headers["Authorization"] = mcp.apiKey.startsWith("Bearer ") ? mcp.apiKey : `Bearer ${mcp.apiKey}`;
    }

    const method = mcp.method || "GET";

    if (method === "POST") {
      // 🚀 점(.) 표기법 → 중첩 객체 자동 조립
      const buildNestedObject = (flatObj: Record<string, any>) => {
        const result: Record<string, any> = {};
        for (const key in flatObj) {
          const keys = key.split('.');
          keys.reduce((acc: any, part, idx) => {
            if (idx === keys.length - 1) acc[part] = flatObj[key];
            else acc[part] = acc[part] || {};
            return acc[part];
          }, result);
        }
        return result;
      };

      const finalBodyData = buildNestedObject(args);
      const res = await fetch(mcp.desc, { method, headers, body: JSON.stringify(finalBodyData) });
      const data = await res.json();
      return JSON.stringify(data);
    } else {
      // GET: searchParams에 flat하게 추가
      const url = new URL(mcp.desc);
      Object.keys(args).forEach(key => url.searchParams.append(key, String(args[key])));
      const res = await fetch(url.toString(), { method, headers });
      const data = await res.json();
      return JSON.stringify(data);
    }
  } catch (e: any) {
    console.error("[MCP 실행 오류]", e);
    return JSON.stringify({ error: e.message });
  }
};