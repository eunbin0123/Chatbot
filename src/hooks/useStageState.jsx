import { useState } from "react";
import { getFullEngineName } from "../utils/engineMapping";

export function useStageState() {
  const [selectedStage, setSelectedStage] = useState("analysis");

  const [stageStatus, setStageStatus] = useState({
    analysis: true,
    rag: true,
    mcp: true,
    prompt: true,
    response: true,
  });

  const [stageEngines, setStageEngines] = useState({
    analysis: "OpenAI GPT-5.3",
    rag: "OpenAI GPT-5.3",
    response: "OpenAI GPT-5.3",
    analysisKey: "",
    responseKey: "",
    ragKeys: { gpt: "", gemini: "", llamon: "" },
    ragVectorId: "",
  });

  const restoreFromAgent = (agentData) => {
    const engines = agentData.engines || { analysis: "gpt", rag: "gpt", response: "gpt" };
    const keys = agentData.keys || { analysis: "", response: "", rag: { gpt: "", gemini: "", llamon: "" } };
    setStageEngines((prev) => ({
      ...prev,
      analysis: getFullEngineName(engines.analysis),
      rag: getFullEngineName(engines.rag),
      response: getFullEngineName(engines.response),
      analysisKey: keys.analysis || "",
      responseKey: keys.response || "",
      ragKeys: keys.rag || { gpt: "", gemini: "", llamon: "" },
    }));
    setStageStatus(agentData.stageStatus || {
      analysis: true, rag: true, mcp: true, prompt: true, response: true,
    });
  };

  const resetStageState = () => {
    setSelectedStage("analysis");
    setStageEngines({
      analysis: "OpenAI GPT-5.3",
      rag: "OpenAI GPT-5.3",
      response: "OpenAI GPT-5.3",
      analysisKey: "",
      responseKey: "",
      ragKeys: { gpt: "", gemini: "", llamon: "" },
      ragVectorId: "",
    });
    setStageStatus({ analysis: true, rag: true, mcp: true, prompt: true, response: true });
  };

  const isToggleable = !["analysis", "response"].includes(selectedStage);

  return {
    selectedStage, setSelectedStage,
    stageStatus, setStageStatus,
    stageEngines, setStageEngines,
    isToggleable,
    restoreFromAgent,
    resetStageState,
  };
}
