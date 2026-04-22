import { 
  uploadFilesToVectorStore, 
  linkVectorStoreToAssistant, 
  uploadFilesToGemini 
} from "../services/ragService";

// 🚀 기본 제공 MCP 리스트
export const DEFAULT_MCP_LIST = [
  { 
    id: "web_search", 
    name: "웹 검색 (Web Search)", 
    desc: "실시간 웹 검색 결과를 기반으로 최신 정보를 반영합니다.", 
    type: "built-in", 
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
    active: false,
    apiKey: "",
    parameters: [
      { key: "expression", type: "string", desc: "계산할 수학 수식 또는 코드" }
    ]
  },
  { 
    id: "custom_1", 
    name: "기상청 날씨 API", 
    desc: "https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0", 
    type: "custom", 
    active: true,
    apiKey: "sk-weather-gov-abc123def456", 
    parameters: [
      { key: "ServiceKey", type: "string", desc: "발급받은 공공데이터포털 인증키" },
      { key: "pageNo", type: "number", desc: "페이지 번호 (기본값: 1)" },
      { key: "numOfRows", type: "number", desc: "한 페이지 결과 수 (기본값: 10)" },
      { key: "dataType", type: "string", desc: "응답자료형식 (XML / JSON)" },
      { key: "base_date", type: "string", desc: "발표일자 (YYYYMMDD)" },
      { key: "base_time", type: "string", desc: "발표시각 (HHMM)" },
      { key: "nx", type: "number", desc: "예보지점 X 좌표" },
      { key: "ny", type: "number", desc: "예보지점 Y 좌표" }
    ]
  }
];

// 1. 초기 렌더링 시 스토리지에서 설정 불러오기 (MCP 포함)
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

// 🚀 3. MCP 리스트 변경 시 스토리지에 즉시 동기화
export const syncMcpToStorage = (newMcpList, setMcpList) => {
  setMcpList(newMcpList);
  
  const adminConfig = JSON.parse(localStorage.getItem("klever_admin_config") || "{}");
  adminConfig.mcpList = newMcpList;
  localStorage.setItem("klever_admin_config", JSON.stringify(adminConfig));

  const widgetConfig = JSON.parse(localStorage.getItem("klever_widget_config") || "{}");
  widgetConfig.mcpList = newMcpList;
  localStorage.setItem("klever_widget_config", JSON.stringify(widgetConfig));
};

// 4. 설정 완료 및 저장 (MCP 데이터 포함)
export const saveConfiguration = ({
  apiKeys, selectedAgentId, uiCharacter, uiLlmType, uiRagType,
  autoAssistantId, promptMode, selectedTags, customTags, manualPrompt,
  layout, autoOff, autoOffSec, digitalHumans, mcpList, setApiKeys
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
    promptManual: savedAgent.promptManual,
    mcpList: mcpList // 🚀 MCP 정보도 위젯으로 전달
  };
  localStorage.setItem("klever_widget_config", JSON.stringify(widgetConfig));

  const adminConfig = {
    apiKeys: updatedApiKeys,
    layout: layout,
    autoOff: autoOff,
    autoOffSec: autoOffSec,
    mcpList: mcpList // 🚀 Admin 설정에도 유지
  };
  localStorage.setItem("klever_admin_config", JSON.stringify(adminConfig));
};

// 5. Vector Store ID 검증 및 연결
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

// 🚀 6. 서버로 RAG 파일 업로드 처리 (수정됨: asst_ 입력 시 vs_ 탐색 지원)
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
    const inputId = nativeRagId.trim();
    if (!inputId) {
      throw new Error("파일을 Vector Store에 연동하려면 Vector Store ID 또는 Assistant ID를 먼저 입력해주세요.");
    }
    
    const openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY;
    let targetVectorStoreId = inputId;

    // 🚀 사용자가 Assistant ID (asst_...)를 입력했을 경우의 분기 처리
    if (inputId.startsWith("asst_")) {
      try {
        const asstRes = await fetch(`https://api.openai.com/v1/assistants/${inputId}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${openaiApiKey}`,
            "OpenAI-Beta": "assistants=v2"
          }
        });
        
        if (!asstRes.ok) {
          throw new Error("Assistant 정보를 불러오는데 실패했습니다. 올바른 Assistant ID인지 확인해주세요.");
        }

        const asstData = await asstRes.json();
        // Assistant에 연결된 첫 번째 Vector Store ID 추출
        const attachedVsId = asstData.tool_resources?.file_search?.vector_store_ids?.[0];

        if (attachedVsId) {
          targetVectorStoreId = attachedVsId; // 진짜 타겟 설정 완료
          console.log(`[RAG Upload] Assistant(${inputId})에 연결된 VectorStore(${targetVectorStoreId})를 발견했습니다.`);
        } else {
          throw new Error("입력하신 Assistant에는 연결된 지식저장소(Vector Store)가 없습니다.");
        }
      } catch (err) {
        throw new Error(err.message || "Assistant 연동 조회 중 오류가 발생했습니다.");
      }
    } else if (!inputId.startsWith("vs_")) {
      throw new Error("유효한 Vector Store ID (vs_...) 또는 Assistant ID (asst_...)를 입력해주세요.");
    }

    // 찾아낸 (또는 원래 입력된) Vector Store ID로 파일 업로드 실행
    await uploadFilesToVectorStore(openaiApiKey, targetVectorStoreId, ragFiles);
    return null;

  } else if (uiLlmType === "gemini") {
    const geminiApiKey = import.meta.env.VITE_GEMINAI_API_KEY;
    const uploadedGeminiFiles = await uploadFilesToGemini(geminiApiKey, ragFiles);
    return JSON.stringify(uploadedGeminiFiles);
  }
  
  return null;
};

// 7. UI 리스트 렌더링용 데이터 묶음(Bundle) 생성
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

// ==========================================
// 🚀 MCP (Tool Calling / Function Calling) 로직
// ==========================================

// 1. OpenAI 규격에 맞게 도구(Tools) 스키마 생성
export const buildOpenAITools = (mcpList) => {
  const activeMcps = mcpList?.filter(m => m.active) || [];
  if (activeMcps.length === 0) return undefined;

  return activeMcps.map(mcp => {
    const properties = {};
    const required = [];
    mcp.parameters.forEach(p => {
      properties[p.key] = {
        type: p.type === 'number' ? 'number' : 'string',
        description: p.desc
      };
      required.push(p.key);
    });

    return {
      type: "function",
      function: {
        name: mcp.id.replace(/[^a-zA-Z0-9_]/g, '_'), // 특수문자 제거
        description: mcp.desc || mcp.name,
        parameters: {
          type: "object",
          properties: properties,
          required: required
        }
      }
    };
  });
};

// 2. Gemini 규격에 맞게 도구(Tools) 스키마 생성
export const buildGeminiTools = (mcpList) => {
  const activeMcps = mcpList?.filter(m => m.active) || [];
  if (activeMcps.length === 0) return undefined;

  return [{
    functionDeclarations: activeMcps.map(mcp => {
      const properties = {};
      const required = [];
      mcp.parameters.forEach(p => {
        properties[p.key] = {
          type: p.type === 'number' ? 'NUMBER' : 'STRING',
          description: p.desc
        };
        required.push(p.key);
      });

      return {
        name: mcp.id.replace(/[^a-zA-Z0-9_]/g, '_'),
        description: mcp.desc || mcp.name,
        parameters: {
          type: "OBJECT",
          properties: properties,
          required: required
        }
      };
    })
  }];
};

// 3. LLM이 도구 사용을 요청했을 때, 프론트엔드에서 실제 API를 실행해주는 함수
export const executeMcpTool = async (toolName, args, mcpList) => {
  const mcp = mcpList.find(m => m.id.replace(/[^a-zA-Z0-9_]/g, '_') === toolName);
  if (!mcp) return JSON.stringify({ error: "해당 도구를 찾을 수 없습니다." });

  console.log(`[🤖 MCP 도구 실행] ${mcp.name} 호출됨!`, args);

  try {
    if (mcp.type === "custom") {
      // Custom URL 방식 (GET 방식으로 파라미터를 붙여서 보냄)
      const url = new URL(mcp.desc);
      Object.keys(args).forEach(key => url.searchParams.append(key, String(args[key])));

      const headers = {};
      if (mcp.apiKey) {
        // 기상청 API 등은 보통 파라미터에 ServiceKey를 넣지만, 헤더 인증이 필요한 경우를 대비
        headers["Authorization"] = mcp.apiKey.startsWith("Bearer ") ? mcp.apiKey : `Bearer ${mcp.apiKey}`;
      }

      const res = await fetch(url.toString(), { method: "GET", headers });
      const data = await res.json();
      return JSON.stringify(data);

    } else if (mcp.id === "calculator") {
      // 내장 계산기 도구
      const result = new Function('return ' + args.expression)();
      return JSON.stringify({ result });
      
    } else if (mcp.id === "web_search") {
      // 내장 웹 검색 시뮬레이션 (실제 구현 시 구글 서치 API 등으로 대체)
      return JSON.stringify({ result: `[웹 검색 결과] '${args.query}'에 대한 최신 정보입니다.` });
    }

    return JSON.stringify({ error: "지원하지 않는 도구 형식입니다." });
  } catch (e) {
    console.error("[MCP 실행 에러]", e);
    return JSON.stringify({ error: e.message });
  }
};