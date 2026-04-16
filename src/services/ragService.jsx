// src/services/ragService.js

// =========================================================
// GPT 연동 로직
// =========================================================

// 1. 파일들을 Vector Store에 업로드하는 함수
export const uploadFilesToVectorStore = async (apiKey, vectorStoreId, files) => {
  for (const ragFile of files) {
    // 🚀 완벽 차단: fileObject와 file을 모두 검사해서 실제 알맹이를 가져옵니다.
    const actualFile = ragFile.fileObject || ragFile.file;

    if (!actualFile || !(actualFile instanceof Blob)) {
      throw new Error(`파일 데이터 유실: '${ragFile.name}' 파일이 올바르지 않습니다. 다시 첨부해주세요.`);
    }

    // 1-1. 파일 업로드
    const formData = new FormData();
    formData.append("purpose", "assistants");
    // 🚀 완벽 차단: 세 번째 인자로 파일 이름을 명시해서 안전하게 보냅니다!
    formData.append("file", actualFile, ragFile.name);

    const fileUploadRes = await fetch("https://api.openai.com/v1/files", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        // 절대 "Content-Type" 헤더를 추가하지 마세요. 브라우저가 자동 계산합니다.
      },
      body: formData,
    });

    if (!fileUploadRes.ok) {
      const errData = await fileUploadRes.json().catch(() => ({}));
      console.error("OpenAI 파일 업로드 에러:", errData);
      throw new Error(`파일 업로드 실패 (${ragFile.name}): ${errData.error?.message || '알 수 없는 서버 에러'}`);
    }
    
    const fileData = await fileUploadRes.json();

    // 1-2. Vector Store에 파일 연동
    const vectorStoreRes = await fetch(`https://api.openai.com/v1/vector_stores/${vectorStoreId}/files`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "OpenAI-Beta": "assistants=v2"
      },
      body: JSON.stringify({ file_id: fileData.id }),
    });

    if (!vectorStoreRes.ok) {
      const vsError = await vectorStoreRes.json().catch(() => ({}));
      throw new Error(`Vector Store 연동 실패 (${ragFile.name}): ${vsError.error?.message || '알 수 없는 오류'}`);
    }
  }
};

// 2. Vector Store ID를 가진 Assistant를 찾거나 새로 생성하는 함수
export const verifyOrCreateAssistant = async (apiKey, vectorStoreId) => {
  const assistantsRes = await fetch("https://api.openai.com/v1/assistants?limit=100", {
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "OpenAI-Beta": "assistants=v2"
    }
  });
  const assistantsData = await assistantsRes.json();

  let matchedAssistant = assistantsData.data?.find(ast =>
    ast.tool_resources?.file_search?.vector_store_ids?.includes(vectorStoreId)
  );

  if (matchedAssistant) {
    return { id: matchedAssistant.id, isNew: false };
  } 
  
  const createRes = await fetch("https://api.openai.com/v1/assistants", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
      "OpenAI-Beta": "assistants=v2"
    },
    body: JSON.stringify({
      name: "KLEVER ONE Auto Assistant",
      instructions: "You are a helpful assistant. Use the provided knowledge base to answer questions.",
      model: "gpt-4o",
      tools: [{ type: "file_search" }],
      tool_resources: {
        file_search: { vector_store_ids: [vectorStoreId] }
      }
    })
  });
  const createData = await createRes.json();
  return { id: createData.id, isNew: true };
};

// 3. Vector Store ID 입력 시 Assistant 연동 및 결과 메시지 생성 함수
export const linkVectorStoreToAssistant = async (apiKey, vectorStoreId) => {
  try {
    const assistantInfo = await verifyOrCreateAssistant(apiKey, vectorStoreId);
    
    return {
      success: true,
      assistantId: assistantInfo.id,
      isNew: assistantInfo.isNew,
      message: assistantInfo.isNew
        ? `새로운 Assistant가 생성되어 Vector Store와 연결되었습니다.\n(ID: ${assistantInfo.id})`
        : `Vector Store가 확인되었습니다.\n(기존 Assistant 자동 연결: ${assistantInfo.id})`
    };
  } catch (error) {
    console.error("Assistant 연동 에러:", error);
    return {
      success: false,
      message: "Assistant 연동 중 오류가 발생했습니다: " + error.message
    };
  }
};

// =========================================================
// Gemini 연동 로직
// =========================================================

export const uploadFilesToGemini = async (apiKey, files) => {
  const uploadedFilesInfo = [];
  
  for (const ragFile of files) {
    // 🚀 완벽 차단: 여기서도 실제 알맹이를 안전하게 가져옵니다.
    const actualFile = ragFile.fileObject || ragFile.file;

    if (!actualFile || !(actualFile instanceof Blob)) {
      throw new Error(`파일 데이터 유실: '${ragFile.name}' 파일이 올바르지 않습니다. 다시 첨부해주세요.`);
    }

    const uploadUrl = `https://generativelanguage.googleapis.com/upload/v1beta/files?key=${apiKey}`;
    const mimeType = actualFile.type || "text/plain";

    const res = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        "X-Goog-Upload-Command": "upload, finalize",
        "X-Goog-Upload-Header-Content-Length": actualFile.size.toString(),
        "X-Goog-Upload-Header-Content-Type": mimeType,
        "Content-Type": mimeType
      },
      body: actualFile
    });

    if (!res.ok) {
      const errData = await res.text();
      throw new Error(`Gemini 업로드 실패: ${actualFile.name} - ${errData}`);
    }
    
    const data = await res.json();
    
    uploadedFilesInfo.push({
      name: data.file.name,
      uri: data.file.uri,
      mimeType: data.file.mimeType
    });
  }
  
  return uploadedFilesInfo; 
};