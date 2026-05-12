import {
  uploadFilesToVectorStore,
  linkVectorStoreToAssistant,
  uploadFilesToGemini,
} from "../services/ragService";

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
      { key: "num_results", type: "number", desc: "가져올 결과 개수 (기본: 5)" },
    ],
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
      { key: "expression", type: "string", desc: "계산할 수학 수식 또는 코드" },
    ],
  },
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
  const updatedApiKeys = apiKeys.map((agent) =>
    agent.id === selectedAgentId
      ? { ...agent, promptTags: newSelectedTags, customTags: newCustomTags }
      : agent
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
  console.log('[MCP 저장]', JSON.stringify(newMcpList));
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
  layout, autoOff, autoOffSec, digitalHumans, mcpList, setApiKeys,
  engines, keys, stageStatus,
}) => {
  const updatedApiKeys = apiKeys.map((agent) =>
    agent.id === selectedAgentId
      ? {
          ...agent,
          character: uiCharacter,
          llm: uiLlmType,
          assistantId: uiRagType === "native" ? autoAssistantId : "",
          promptMode, promptTags: selectedTags, customTags,
          promptManual: manualPrompt,
          engines: engines || agent.engines,
          keys: keys || agent.keys,
          stageStatus: stageStatus || agent.stageStatus,
        }
      : agent
  );
  setApiKeys(updatedApiKeys);
  const savedAgent = updatedApiKeys.find((a) => a.id === selectedAgentId);
  const selectedHuman = digitalHumans.find((human) => human.id === savedAgent.character);
  const widgetConfig = {
    layout,
    avatarnum: selectedHuman ? selectedHuman.num : 1,
    llm: savedAgent.llm || "gpt",
    assistantId: savedAgent.assistantId || "",
    promptMode: savedAgent.promptMode,
    promptTags: savedAgent.promptTags,
    customTags: savedAgent.customTags,
    promptManual: savedAgent.promptManual,
    mcpList,
    engines: savedAgent.engines,
    keys: savedAgent.keys,
  };
  localStorage.setItem("klever_widget_config", JSON.stringify(widgetConfig));
  const adminConfig = { apiKeys: updatedApiKeys, layout, autoOff, autoOffSec, mcpList };
  localStorage.setItem("klever_admin_config", JSON.stringify(adminConfig));
};

export const processVectorIdFinish = async (nativeRagId, uiLlmType, uiRagType, lastVerifiedVsId) => {
  const currentId = nativeRagId.trim();
  if (!currentId || uiLlmType !== "gpt" || uiRagType !== "native" || currentId === lastVerifiedVsId)
    return { skip: true };
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
        method: "GET",
        headers: { Authorization: `Bearer ${openaiApiKey}`, "OpenAI-Beta": "assistants=v2" },
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
  if (ragInput.trim())
    bundleItems.push({ id: `k1_${Date.now()}`, type: ragInput.startsWith("http") ? "url" : "text", content: ragInput.trim() });
  ragTexts.forEach((t, i) => bundleItems.push({ id: `k2_${Date.now()}_${i}`, type: t.type, content: t.content }));
  ragFiles.forEach((f) => bundleItems.push({ id: f.id, type: "document", content: f.name, fileObject: f.fileObject || f.file }));
  return {
    id: `bundle_${Date.now()}`,
    type: bundleItems.length > 1 ? "collection" : "document",
    name: bundleItems[0]?.content || "새 지식",
    date: new Date().toISOString().split("T")[0],
    items: bundleItems,
  };
};

// ════════════════════════════════════════════════════════════════
// Smithery API
// ════════════════════════════════════════════════════════════════
const MCP_SERVER_URL = import.meta.env.VITE_MCP_SERVER_URL || "http://localhost:3000";

export const searchSmitheryServers = async (query, pageSize = 10) => {
  if (!query.trim()) return [];
  const res = await fetch(`${MCP_SERVER_URL}/smithery/search?q=${encodeURIComponent(query)}&pageSize=${pageSize}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `검색 실패 (${res.status})`);
  }
  const data = await res.json();
  return data.servers || [];
};

// ← apiKey 파라미터 추가
export const fetchSmitheryTools = async (qualifiedName, env = {}, apiKey = "") => {
  const res = await fetch(`${MCP_SERVER_URL}/smithery/tools`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ qualifiedName, env, apiKey }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    // 402: 결제 필요, needsApiKey 플래그
    if (res.status === 402) throw new Error("NEEDS_PAYMENT");
    throw new Error(err.error || `툴 목록 조회 실패 (${res.status})`);
  }
  const data = await res.json();
  return data.tools || [];
};

export const parseSmitheryToolSpec = (tool) => {
  const properties = tool.inputSchema?.properties || tool.parameters?.properties || {};
  const params = Object.entries(properties).map(([key, val]) => ({
    key,
    type: val.type === "number" ? "Number" : val.type === "boolean" ? "Boolean" : "String",
    desc: val.description || "",
  }));
  return { description: tool.description || "", parameters: params };
};

// ════════════════════════════════════════════════════════════════
// MCP Tool Use
// ════════════════════════════════════════════════════════════════
export const buildOpenAITools = (mcpList) => {
  const activeMcps = mcpList?.filter((m) => m.active) || [];
  if (activeMcps.length === 0) return undefined;
  const mapType = (type) => {
    switch (type?.toLowerCase()) {
      case "number": return "number";
      case "boolean": return "boolean";
      default: return "string";
    }
  };
  return activeMcps.map((mcp) => ({
    type: "function",
    function: {
      name: mcp.id.replace(/[^a-zA-Z0-9_]/g, "_"),
      description: mcp.desc || mcp.name,
      parameters: {
        type: "object",
        properties: (mcp.parameters || []).reduce((acc, p) => ({
          ...acc, [p.key]: { type: mapType(p.type), description: p.desc },
        }), {}),
        required: (mcp.parameters || []).map((p) => p.key),
      },
    },
  }));
};

export const buildGeminiTools = (mcpList) => {
  const activeMcps = mcpList?.filter((m) => m.active) || [];
  if (activeMcps.length === 0) return undefined;
  const mapGeminiType = (type) => {
    switch (type?.toLowerCase()) {
      case "number": return "NUMBER";
      case "boolean": return "BOOLEAN";
      default: return "STRING";
    }
  };
  return [{
    functionDeclarations: activeMcps.map((mcp) => ({
      name: mcp.id.replace(/[^a-zA-Z0-9_]/g, "_"),
      description: mcp.desc || mcp.name,
      parameters: {
        type: "OBJECT",
        properties: (mcp.parameters || []).reduce((acc, p) => ({
          ...acc, [p.key]: { type: mapGeminiType(p.type), description: p.desc },
        }), {}),
        required: (mcp.parameters || []).map((p) => p.key),
      },
    })),
  }];
};

export const executeMcpTool = async (toolName, args, mcpList) => {
  if (MCP_SERVER_URL) {
    console.log(`[🌐 MCP 서버 호출] ${toolName}`, args);
    const mcp = mcpList.find((m) => m.id.replace(/[^a-zA-Z0-9_]/g, "_") === toolName);
    const realToolName = mcp?.name || toolName;
    const sessionId = mcp?.qualifiedName || null;
    const apiKey = mcp?.apiKey || "";

    console.log(`[🔍 툴 매핑] ${toolName} → ${realToolName} (session: ${sessionId})`);

    try {
      const endpoint = sessionId
        ? `${MCP_SERVER_URL}/smithery/message`
        : `${MCP_SERVER_URL}/message`;

      const body = sessionId
        ? { sessionId, method: "tools/call", params: { name: realToolName, arguments: args }, apiKey }
        : { jsonrpc: "2.0", id: Date.now(), method: "tools/call", params: { name: realToolName, arguments: args } };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      console.log("[MCP 응답]", JSON.stringify(data).slice(0, 300));
      const content = data.result?.content?.[0]?.text;
      return content || JSON.stringify({ error: "빈 응답", raw: data });
    } catch (e) {
      console.error("[MCP 서버 오류]", e);
      return JSON.stringify({ error: e.message });
    }
  }

  // fallback
  const mcp = mcpList.find((m) => m.id.replace(/[^a-zA-Z0-9_]/g, "_") === toolName);
  if (!mcp) return JSON.stringify({ error: "도구를 찾을 수 없습니다." });

  try {
    if (mcp.id === "calculator") {
      const expr = String(args.expression || "");
      const sanitized = expr.replace(/[^0-9+\-*/().%\s]/g, "");
      if (!sanitized.trim()) return JSON.stringify({ error: "수식이 비어있습니다." });
      try {
        const result = new Function(`"use strict"; return (${sanitized})`)();
        return JSON.stringify({ result });
      } catch (e) {
        return JSON.stringify({ error: `계산 오류: ${e.message}` });
      }
    }
    if (mcp.id === "web_search") {
      const query = String(args.query || "");
      const numResults = Number(args.num_results) || 5;
      if (!query) return JSON.stringify({ error: "검색어가 없습니다." });
      try {
        const ddgUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;
        const res = await fetch(ddgUrl);
        const data = await res.json();
        const results = [];
        if (data.AbstractText) results.push({ title: data.Heading || query, snippet: data.AbstractText, link: data.AbstractURL || "" });
        (data.RelatedTopics || []).slice(0, numResults - results.length).forEach((t) => {
          if (t.Text) results.push({ title: t.Text.split(" - ")[0] || query, snippet: t.Text, link: t.FirstURL || "" });
        });
        return JSON.stringify({ query, results: results.slice(0, numResults) });
      } catch (e) {
        return JSON.stringify({ error: "웹 검색 실패", query });
      }
    }
    const headers = { "Content-Type": "application/json" };
    if (mcp.apiKey) headers["Authorization"] = mcp.apiKey.startsWith("Bearer ") ? mcp.apiKey : `Bearer ${mcp.apiKey}`;
    const method = mcp.method || "GET";
    if (method === "POST") {
      const res = await fetch(mcp.desc, { method, headers, body: JSON.stringify(args) });
      return JSON.stringify(await res.json());
    } else {
      const url = new URL(mcp.desc);
      Object.keys(args).forEach((key) => url.searchParams.append(key, String(args[key])));
      const res = await fetch(url.toString(), { method, headers });
      return JSON.stringify(await res.json());
    }
  } catch (e) {
    return JSON.stringify({ error: e.message });
  }
};

export const runOpenAIWithMcp = async ({ apiKey, model = "gpt-4o", messages, mcpList = [], systemPrompt = "", maxToolRounds = 5 }) => {
  const tools = buildOpenAITools(mcpList);
  const fullMessages = systemPrompt ? [{ role: "system", content: systemPrompt }, ...messages] : [...messages];
  let currentMessages = [...fullMessages];
  let round = 0;

  while (round < maxToolRounds) {
    round++;
    const body = { model, messages: currentMessages, ...(tools && tools.length > 0 ? { tools, tool_choice: "auto" } : {}) };
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData?.error?.message || `OpenAI API 오류: ${res.status}`);
    }
    const data = await res.json();
    const message = data.choices?.[0]?.message;
    if (!message) throw new Error("OpenAI 응답이 비어있습니다.");
    if (!message.tool_calls || message.tool_calls.length === 0) return message.content || "";
    currentMessages.push(message);
    const toolResults = await Promise.all(
      message.tool_calls.map(async (toolCall) => {
        const toolName = toolCall.function.name;
        let toolArgs = {};
        try { toolArgs = JSON.parse(toolCall.function.arguments || "{}"); } catch { toolArgs = {}; }
        console.log(`[🔧 tool_use] ${toolName}`, toolArgs);
        const result = await executeMcpTool(toolName, toolArgs, mcpList);
        return { role: "tool", tool_call_id: toolCall.id, content: result };
      })
    );
    currentMessages.push(...toolResults);
  }
  throw new Error(`MCP Tool Use: 최대 반복 횟수(${maxToolRounds})를 초과했습니다.`);
};

export const runGeminiWithMcp = async ({ apiKey, model = "gemini-2.0-flash", messages, mcpList = [], systemPrompt = "", maxToolRounds = 5 }) => {
  const tools = buildGeminiTools(mcpList);
  let currentContents = [...messages];
  let round = 0;

  const callGemini = async (contents) => {
    const body = {
      contents,
      ...(systemPrompt ? { systemInstruction: { parts: [{ text: systemPrompt }] } } : {}),
      ...(tools && tools.length > 0 ? { tools } : {}),
    };
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData?.error?.message || `Gemini API 오류: ${res.status}`);
    }
    return res.json();
  };

  while (round < maxToolRounds) {
    round++;
    const data = await callGemini(currentContents);
    const parts = data.candidates?.[0]?.content?.parts || [];
    const functionCallParts = parts.filter((p) => p.functionCall);
    const textParts = parts.filter((p) => p.text);
    if (functionCallParts.length === 0) return textParts.map((p) => p.text).join("") || "";
    currentContents.push({ role: "model", parts });
    const functionResponseParts = await Promise.all(
      functionCallParts.map(async (part) => {
        const { name, args } = part.functionCall;
        const result = await executeMcpTool(name, args || {}, mcpList);
        let parsedResult;
        try { parsedResult = JSON.parse(result); } catch { parsedResult = { result }; }
        return { functionResponse: { name, response: parsedResult } };
      })
    );
    currentContents.push({ role: "user", parts: functionResponseParts });
  }
  throw new Error(`MCP Tool Use: 최대 반복 횟수(${maxToolRounds})를 초과했습니다.`);
};

export const runLlmWithMcp = async ({ llmType, apiKey, messages, mcpList = [], systemPrompt = "", maxToolRounds = 5 }) => {
  if (llmType === "gemini") {
    const geminiContents = messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content || "" }],
    }));
    return runGeminiWithMcp({ apiKey, messages: geminiContents, mcpList, systemPrompt, maxToolRounds });
  }
  return runOpenAIWithMcp({ apiKey, messages, mcpList, systemPrompt, maxToolRounds });
};