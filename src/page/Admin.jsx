import React, { useState, useEffect } from "react";
import { BasicChatbot } from "./BasicChatBot";
import { DigitalHuman } from "./DigitalHuman";
import "../css/Admin.css";

import { loadSavedConfig, saveConfiguration } from "../utils/adminUtils";
import { i18n } from "../constants/i18n";

import { useAgentState } from "../hooks/useAgentState.jsx";
import { useRagState } from "../hooks/useRagState.jsx";
import { useMcpState } from "../hooks/useMcpState.jsx";
import { usePromptState } from "../hooks/usePromptState.jsx";

import { AgentTab } from "../components/AgentTab.jsx";
import { SystemTab } from "../components/SystemTab.jsx";
import { WidgetTab } from "../components/WidgetTab.jsx";
import { ConfirmModals } from "../modals/ConfirmModals.jsx";
import { SmitheryModal } from "../modals/SmitheryModal.jsx";

const getMappedLlmType = (engineName) => {
    if (!engineName) return "gpt";
    if (engineName.includes("GPT")) return "gpt";
    if (engineName.includes("Gemini")) return "gemini";
    if (engineName.includes("LLaMON")) return "llamon";
    return "gpt";
};
const getFullEngineName = (shortType) => {
    if (shortType === "gemini") return "Google Gemini 3.1 Pro";
    if (shortType === "llamon") return "LLaMON";
    return "OpenAI GPT-5.3";
};

export default function Admin({ chatbotType }) {
    const [uiLang, setUiLang] = useState("ko");
    const [activeTab, setActiveTab] = useState("agent");
    const [isDarkMode, setIsDarkMode] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => { document.querySelector(".fw-toggle")?.click(); }, 500);
        return () => clearTimeout(timer);
    }, []);

    // stageEngines는 useRagState에 넘겨야 하므로 hooks 전에 선언
    const [selectedStage, setSelectedStage] = useState("analysis");
    const [stageStatus, setStageStatus] = useState({ analysis: true, rag: true, mcp: true, prompt: true, response: true });
    const [stageEngines, setStageEngines] = useState({
        analysis: "OpenAI GPT-5.3", rag: "OpenAI GPT-5.3", response: "OpenAI GPT-5.3",
        analysisKey: "", responseKey: "", ragKeys: { gpt: "", gemini: "", llamon: "" }, ragVectorId: "",
    });

    const agent = useAgentState();
    const mcp = useMcpState();
    const prompt = usePromptState({ selectedAgentId: agent.selectedAgentId, setApiKeys: agent.setApiKeys });
    const rag = useRagState({ stageEngines, getMappedLlmType });

    const [layout, setLayout] = useState("bottom-right");
    const [autoOff, setAutoOff] = useState(15);
    const [autoOffSec, setAutoOffSec] = useState(0);
    const [codeTab, setCodeTab] = useState("vanilla");

    useEffect(() => {
        loadSavedConfig(agent.setApiKeys, setLayout, setAutoOff, setAutoOffSec, mcp.setMcpList);
    }, []);

    useEffect(() => {
        if (mcp.mcpList.length === 0 || mcp.isInitialMcpLoaded) return;
        mcp.setIsInitialMcpLoaded(true);
        let savedDirs = [];
        try { const local = localStorage.getItem("klever_mcp_directories"); if (local) savedDirs = JSON.parse(local); } catch (e) { console.error(e); }
        if (savedDirs.length === 0) savedDirs = [{ id: "dir_default", name: "연동된 API", description: "서버에서 불러온 도구들", active: true, isOpen: true, items: [] }];
        mcp.mcpList.forEach((m) => {
            const mapped = { id: m.id, name: m.name, url: m.desc, method: m.method || "POST", active: m.active, apiKey: m.apiKey || "", params: m.parameters || [], type: m.type || "smithery" };
            let found = false;
            for (let dir of savedDirs) { const i = dir.items.findIndex((item) => item.id === m.id); if (i >= 0) { dir.items[i] = mapped; found = true; break; } }
            if (!found && savedDirs[0]) savedDirs[0].items.push(mapped);
        });
        mcp.updateMcpData([...savedDirs]);
    }, [mcp.mcpList, mcp.isInitialMcpLoaded]);

    useEffect(() => {
        const onKey = (e) => {
            if (e.key !== "Escape") return;
            agent.setIsModalOpen(false); agent.setIsExitModalOpen(false); agent.setIsNewKeyModalOpen(false);
            mcp.setIsAddDirModalOpen(false); agent.setAlertMessage(""); agent.setDeleteTargetId(null); agent.setReissueTargetId(null);
            if (mcp.isAddItemModalOpen) mcp.closeSmitheryModal();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [mcp.isAddItemModalOpen]);

    useEffect(() => {
        const agentData = agent.apiKeys.find((a) => a.id === agent.selectedAgentId);
        if (!agentData) return;
        agent.setUiCharacter(agentData.character || "chanu");
        const engines = agentData.engines || { analysis: "gpt", rag: "gpt", response: "gpt" };
        const keys = agentData.keys || { analysis: "", response: "", rag: { gpt: "", gemini: "", llamon: "" } };
        setStageEngines((prev) => ({ ...prev, analysis: getFullEngineName(engines.analysis), rag: getFullEngineName(engines.rag), response: getFullEngineName(engines.response), analysisKey: keys.analysis || "", responseKey: keys.response || "", ragKeys: keys.rag || { gpt: "", gemini: "", llamon: "" } }));
        const loadedAssistantId = agentData.assistantId || "";
        rag.setUiRagType(loadedAssistantId ? "native" : "none");
        rag.setAutoAssistantId(loadedAssistantId);
        rag.setNativeRagId(loadedAssistantId);
        prompt.restorePromptFromAgent(agentData);
        setStageStatus(agentData.stageStatus || { analysis: true, rag: true, mcp: true, prompt: true, response: true });
        if (agent.isAgentSwitch(agent.selectedAgentId)) { agent.markAgentSwitched(agent.selectedAgentId); rag.resetRagForAgentSwitch({ engines, loadedAssistantId }); }
    }, [agent.selectedAgentId, agent.apiKeys]);

    const confirmSave = () => {
        agent.setIsModalOpen(false);
        const currentEngines = { analysis: getMappedLlmType(stageEngines.analysis), rag: getMappedLlmType(stageEngines.rag), response: getMappedLlmType(stageEngines.response) };
        const currentKeys = { analysis: stageEngines.analysisKey, response: stageEngines.responseKey, rag: stageEngines.ragKeys };
        const updatedApiKeys = agent.apiKeys.map((k) => k.id === agent.selectedAgentId ? { ...k, llm: currentEngines.response, engines: currentEngines, keys: currentKeys, stageStatus } : k);
        agent.setApiKeys(updatedApiKeys);
        saveConfiguration({ apiKeys: updatedApiKeys, selectedAgentId: agent.selectedAgentId, uiCharacter: agent.uiCharacter, uiLlmType: currentEngines.response, uiRagType: stageStatus.rag ? "native" : "none", autoAssistantId: rag.autoAssistantId, promptMode: prompt.promptMode, selectedTags: prompt.selectedTags, customTags: prompt.customTags, manualPrompt: prompt.manualPrompt, layout, autoOff, autoOffSec, mcpList: mcp.mcpList, setApiKeys: agent.setApiKeys, engines: currentEngines, keys: currentKeys, stageStatus });
        agent.setAlertMessage("성공적으로 적용되었습니다!");
    };

    const handleReset = () => {
        agent.resetAgentState(); rag.resetRagState(); prompt.resetPromptState(); mcp.resetMcpState();
        setLayout("bottom-right"); setAutoOff(15); setAutoOffSec(0);
        setStageEngines({ analysis: "OpenAI GPT-5.3", rag: "OpenAI GPT-5.3", response: "OpenAI GPT-5.3", analysisKey: "", responseKey: "", ragKeys: { gpt: "", gemini: "", llamon: "" }, ragVectorId: "" });
        setStageStatus({ analysis: true, rag: true, mcp: true, prompt: true, response: true });
    };

    const getEmbedCode = () => {
        const total = (parseInt(autoOff) || 0) * 60 + (parseInt(autoOffSec) || 0);
        if (codeTab === "react") return `// npm install @klever-one/react\n\nimport { KleverWidget } from '@klever-one/react';\n\nexport default function App() {\n  return (\n    <>\n      <KleverWidget clientId="YOUR_CLIENT_ID" layout="${layout}" autoOff={${total}} />\n    </>\n  );\n}`;
        return `\n<script>\n  (function(w,d,s,o,f,js,fjs){w['KleverOneWidget']=o;w[o]=w[o]||function(){(w[o].q=w[o].q||[]).push(arguments)};js=d.createElement(s);fjs=d.getElementsByTagName(s)[0];js.id=o;js.src=f;js.async=1;fjs.parentNode.insertBefore(js,fjs);}(window,document,'script','kw','https://cdn.klever-one.com/widget.js'));\n  kw('init',{clientId:'YOUR_CLIENT_ID',layout:'${layout}',autoOff:${total}});\n</script>`;
    };
    const handleCopyEmbedCode = () => {
        try { const ta = document.createElement("textarea"); ta.value = getEmbedCode(); document.body.appendChild(ta); ta.select(); document.execCommand("copy"); document.body.removeChild(ta); agent.setAlertMessage("삽입 코드가 클립보드에 복사되었습니다!"); } catch (err) { console.error(err); }
    };

    const savedAgent = agent.selectedAgent;
    const digitalHumans = [{ id: "yuri", num: 2 }, { id: "chanu", num: 1 }, { id: "sujin", num: 4 }];
    const currentAvatarNum = digitalHumans.find((h) => h.id === agent.uiCharacter)?.num ?? 1;
    const savedEngines = savedAgent.engines || { analysis: "gpt", rag: "gpt", response: "gpt" };
    const savedKeys = savedAgent.keys || { analysis: "", response: "", rag: { gpt: "", gemini: "", llamon: "" } };
    const resolvedPromptTags = (savedAgent.promptTags || []).map((tagId) => { const match = (savedAgent.customTags || []).find((t) => t.id === tagId); return match ? match.label : tagId; });
    const isGptRag = stageEngines.rag.includes("GPT");
    const currentRagEngineType = getMappedLlmType(stageEngines.rag);
    const isToggleable = !["analysis", "response"].includes(selectedStage);
    const stageDescriptions = i18n[uiLang]?.stageDescriptions || i18n["ko"].stageDescriptions;
    const sb = i18n[uiLang]?.sidebar || i18n["ko"].sidebar;
    const sidebarStages = [
        { id: "analysis", label: sb.analysis, engine: stageStatus.analysis ? stageEngines.analysis : "OFFLINE" },
        { id: "knowledge_group", label: sb.knowledge, isGroup: true, subItems: [
                { id: "rag", label: sb.rag, engine: stageStatus.rag ? stageEngines.rag : "OFFLINE" },
                { id: "mcp", label: sb.mcp, engine: `${mcp.mcpDirectories.filter((d) => d.active).reduce((sum, d) => sum + d.items.length, 0)} UNITS ACTIVE` },
                { id: "prompt", label: sb.prompt, engine: sb.promptActive },
            ]},
        { id: "response", label: sb.response, engine: stageStatus.response ? stageEngines.response : "OFFLINE" },
    ];

    return (
        <div className={`app-root ${!isDarkMode ? "light-mode" : ""}`}>
            <div className="agent-settings-container">

                <div className="view-header">
                    <div className="title-area">
                        <h1 className="main-title"><span className="highlight">KLEVER ONE</span></h1>
                        <p className="sub-title">{i18n[uiLang]?.subTitle}</p>
                    </div>
                    <div className="header-buttons">
                        <select className="ui-lang-select" value={uiLang} onChange={(e) => setUiLang(e.target.value)}>
                            <option value="ko">한국어</option><option value="en">English</option>
                            <option value="zh">中文</option><option value="vi">Tiếng Việt</option><option value="ja">日本語</option>
                        </select>
                        <button className="btn-icon-theme" onClick={() => setIsDarkMode(!isDarkMode)}>
                            {isDarkMode
                                ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
                                : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                            }
                        </button>
                        <button className="btn-outline" onClick={handleReset}>{i18n[uiLang]?.reset}</button>
                        <button className="btn-primary" onClick={() => agent.setIsModalOpen(true)}>{i18n[uiLang]?.save}</button>
                        <button className="btn-icon-back" onClick={() => agent.setIsExitModalOpen(true)}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                        </button>
                    </div>
                </div>

                <div className="settings-tabs">
                    {["agent", "system", "widget"].map((tab, i) => (
                        <button key={tab} className={`tab-btn ${activeTab === tab ? "active" : ""}`} onClick={() => setActiveTab(tab)}>
                            {[i18n[uiLang]?.tab1, i18n[uiLang]?.tab2, i18n[uiLang]?.tab3][i]}
                        </button>
                    ))}
                </div>

                <div className="tab-content-area">
                    {activeTab === "agent" && <AgentTab agent={agent} i18n={i18n} uiLang={uiLang} />}
                    {activeTab === "system" && (
                        <SystemTab
                            t={i18n[uiLang]}
                            selectedStage={selectedStage} setSelectedStage={setSelectedStage}
                            stageStatus={stageStatus} setStageStatus={setStageStatus}
                            stageEngines={stageEngines} setStageEngines={setStageEngines}
                            isToggleable={isToggleable} sidebarStages={sidebarStages} stageDescriptions={stageDescriptions}
                            rag={rag} isGptRag={isGptRag} currentRagEngineType={currentRagEngineType}
                            mcp={mcp} prompt={prompt} setAlertMessage={agent.setAlertMessage}
                        />
                    )}
                    {activeTab === "widget" && (
                        <WidgetTab
                            i18n={i18n} uiLang={uiLang}
                            layout={layout} setLayout={setLayout}
                            autoOff={autoOff} setAutoOff={setAutoOff}
                            autoOffSec={autoOffSec} setAutoOffSec={setAutoOffSec}
                            codeTab={codeTab} setCodeTab={setCodeTab}
                            getEmbedCode={getEmbedCode} handleCopyEmbedCode={handleCopyEmbedCode}
                        />
                    )}
                </div>
            </div>

            <div id="chatbot-wrapper">
                {chatbotType === "sdk" ? (
                    <DigitalHuman apiKey={import.meta.env.VITE_KLEVER_API_KEY} layout={layout} />
                ) : (
                    <BasicChatbot
                        unrealurl={import.meta.env.VITE_MATCHMAKER} layout={layout}
                        autoOff={autoOff * 60 + autoOffSec} avatarnum={currentAvatarNum}
                        analysisLlm={savedEngines.analysis || "gpt"} ragLlm={savedEngines.rag || "gpt"}
                        responseLlm={savedEngines.response || savedAgent.llm || "gpt"}
                        analysisApiKey={savedKeys.analysis || ""} ragApiKey={savedKeys.rag?.[savedEngines.rag] || ""}
                        responseApiKey={savedKeys.response || ""} assistantId={savedAgent.assistantId || ""}
                        promptMode={savedAgent.promptMode || "tag"} promptTags={resolvedPromptTags}
                        promptManual={savedAgent.promptManual || ""} mcpList={mcp.mcpList}
                    />
                )}
            </div>

            <ConfirmModals agent={agent} onConfirmSave={confirmSave} t={i18n[uiLang]} />
            <SmitheryModal mcp={mcp} t={i18n[uiLang]} />

            {mcp.isAddDirModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-box" style={{ maxWidth: "420px", textAlign: "left", padding: "28px" }}>
                        <h2 className="modal-title" style={{ marginBottom: "8px", fontSize: "20px" }}>{i18n[uiLang]?.addDirTitle}</h2>
                        <p className="modal-desc" style={{ marginBottom: "24px" }}>{i18n[uiLang]?.addDirDesc}</p>
                        <div className="form-group" style={{ marginBottom: "16px" }}>
                            <label style={{ fontWeight: "600", marginBottom: "8px", display: "block" }}>{i18n[uiLang]?.dirNameLabel}</label>
                            <input type="text" className="custom-input" value={mcp.newDirName} onChange={(e) => mcp.setNewDirName(e.target.value)} placeholder={i18n[uiLang]?.dirNamePlaceholder} autoFocus onKeyDown={(e) => { if (e.key === "Enter") mcp.handleAddDirectory(); }} />
                        </div>
                        <div className="form-group" style={{ marginBottom: "32px" }}>
                            <label style={{ fontWeight: "600", marginBottom: "8px", display: "block" }}>{i18n[uiLang]?.dirDescLabel}</label>
                            <textarea className="custom-input" style={{ height: "80px", resize: "none" }} value={mcp.newDirDesc} onChange={(e) => mcp.setNewDirDesc(e.target.value)} placeholder={i18n[uiLang]?.dirDescPlaceholder} />
                        </div>
                        <div className="modal-buttons" style={{ gap: "12px", display: "flex" }}>
                            <button className="btn-outline" style={{ flex: 1 }} onClick={() => { mcp.setIsAddDirModalOpen(false); mcp.setNewDirName(""); mcp.setNewDirDesc(""); }}>취소</button>
                            <button className="btn-primary" style={{ flex: 1.5 }} onClick={mcp.handleAddDirectory}>추가하기</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}