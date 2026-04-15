// src/services/ragService.js

// =========================================================
// GPT
// =========================================================

// 1. 파일들을 Vector Store에 업로드하는 함수
export const uploadFilesToVectorStore = async (apiKey, vectorStoreId, files) => {
  for (const ragFile of files) {
    // 1-1. 파일 업로드
    const formData = new FormData();
    formData.append("purpose", "assistants");
    formData.append("file", ragFile.fileObject);

    const fileUploadRes = await fetch("https://api.openai.com/v1/files", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
      },
      body: formData,
    });

    if (!fileUploadRes.ok) {
      throw new Error(`파일 업로드 실패: ${ragFile.name}`);
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
      throw new Error(`Vector Store 연동 실패: ${ragFile.name}`);
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

  // 기존 Assistant 찾기
  let matchedAssistant = assistantsData.data?.find(ast =>
    ast.tool_resources?.file_search?.vector_store_ids?.includes(vectorStoreId)
  );

  if (matchedAssistant) {
    return { id: matchedAssistant.id, isNew: false };
  } 
  
  // 없으면 새로 생성
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
// Gemini
// =========================================================

export const uploadFilesToGemini = async (apiKey, files) => {
  const uploadedFilesInfo = [];
  
  for (const ragFile of files) {
    const file = ragFile.fileObject;
    // 파일 형식이 없을 경우를 대비한 기본값
    const mimeType = file.type || "text/plain";
    const numBytes = file.size.toString();
    const displayName = file.name;

    // [STEP 1] 제미나이 서버에 "나 파일 올릴거야, 자리 만들어줘" 하고 요청 (URL 발급받기)
    const startRes = await fetch(`https://generativelanguage.googleapis.com/upload/v1beta/files?key=${apiKey}`, {
      method: "POST",
      headers: {
        "X-Goog-Upload-Protocol": "resumable",
        "X-Goog-Upload-Command": "start",
        "X-Goog-Upload-Header-Content-Length": numBytes,
        "X-Goog-Upload-Header-Content-Type": mimeType,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ file: { display_name: displayName } })
    });

    if (!startRes.ok) {
      const err = await startRes.text();
      throw new Error(`Gemini 업로드 준비 실패: ${err}`);
    }

    // 응답 헤더에서 우리가 실제 파일을 전송해야 할 고유 URL을 쏙 빼옵니다.
    const uploadUrl = startRes.headers.get("x-goog-upload-url");
    if (!uploadUrl) {
      throw new Error("Gemini 서버로부터 업로드 URL을 받지 못했습니다.");
    }

    // [STEP 2] 발급받은 URL로 실제 파일(바이너리) 데이터 전송
    const uploadRes = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        "Content-Length": numBytes,
        "X-Goog-Upload-Offset": "0",
        "X-Goog-Upload-Command": "upload, finalize"
      },
      body: file // 파일 그 자체를 냅다 던집니다.
    });

    if (!uploadRes.ok) {
      const err = await uploadRes.text();
      throw new Error(`Gemini 파일 전송 실패: ${err}`);
    }

    const data = await uploadRes.json();
    
    // 업로드 성공 시 반환되는 파일 이름, uri, 타입을 배열에 차곡차곡 저장
    uploadedFilesInfo.push({
      name: data.file.name,
      uri: data.file.uri,
      mimeType: data.file.mimeType
    });
  }
  
  return uploadedFilesInfo; 
};