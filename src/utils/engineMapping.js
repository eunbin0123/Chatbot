/**
 * LLM 엔진 이름을 짧은 타입으로 매핑
 */
export const getMappedLlmType = (engineName) => {
    if (!engineName) return "gpt";
    if (engineName.includes("GPT")) return "gpt";
    if (engineName.includes("Gemini")) return "gemini";
    if (engineName.includes("LLaMON")) return "llamon";
    return "gpt";
};

/**
 * 짧은 타입을 전체 엔진 이름으로 변환
 */
export const getFullEngineName = (shortType) => {
    if (shortType === "gemini") return "Google Gemini 3.1 Pro";
    if (shortType === "llamon") return "LLaMON";
    return "OpenAI GPT-5.3";
};