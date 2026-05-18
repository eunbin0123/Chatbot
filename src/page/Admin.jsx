import { useState, useEffect, useCallback, useRef } from "react";
import { BasicChatbot } from "./BasicChatBot";
import { DigitalHuman } from "./DigitalHuman";
import "../css/Admin.css";

import { loadSavedConfig, saveConfiguration } from "../utils/adminUtils";
import { getMappedLlmType } from "../utils/engineMapping";
import { i18n } from "../constants/i18n";

import { useAgentState } from "../hooks/useAgentState.jsx";
import { useRagState } from "../hooks/useRagState.jsx";
import { useMcpState } from "../hooks/useMcpState.jsx";
import { usePromptState } from "../hooks/usePromptState.jsx";
import { useStageState } from "../hooks/useStageState.jsx";

import { AgentTab } from "../components/AgentTab.jsx";
import { SystemTab } from "../components/SystemTab.jsx";
import { WidgetTab } from "../components/WidgetTab.jsx";
import { ConfirmModals } from "../modals/ConfirmModals.jsx";
import { SmitheryModal } from "../modals/SmitheryModal.jsx";
import { AddDirectoryModal } from "../modals/AddDirectoryModal.jsx";

export default function Admin({ chatbotType }) {
    const [uiLang, setUiLang] = useState("ko");
    const [activeTab, setActiveTab] = useState("agent");
    const [isDarkMode, setIsDarkMode] = useState(true);

    // ── 챗봇 토글 (마운트 1회) ──
    useEffect(() => {
        const timer = setTimeout(() => {
            document.querySelector(".fw-toggle")?.click();
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    // ── hooks ──
    const stage = useStageState();
    const agent = useAgentState();
    const mcp = useMcpState();
    const prompt = usePromptState({
        selectedAgentId: agent.selectedAgentId,
        setApiKeys: agent.setApiKeys,
    });
    const rag = useRagState({ stageEngines: stage.stageEngines, getMappedLlmType });

    // ── 동작 설정 ──
    const [layout, setLayout] = useState("bottom-right");
    const [autoOff, setAutoOff] = useState(15);
    const [autoOffSec, setAutoOffSec] = useState(0);
    const [codeTab, setCodeTab] = useState("vanilla");

    // ── 초기 로드 (마운트 1회, setter ref로 안정화) ──
    const setApiKeysRef = useRef(agent.setApiKeys);
    const setMcpListRef = useRef(mcp.setMcpList);
    useEffect(() => {
        loadSavedConfig(setApiKeysRef.current, setLayout, setAutoOff, setAutoOffSec, setMcpListRef.current);
    }, []);

    // ── MCP 디렉토리 초기 구성 ──
    useEffect(() => {
        if (mcp.mcpList.length === 0 || mcp.isInitialMcpLoaded) return;
        mcp.setIsInitialMcpLoaded(true);
        let savedDirs = [];
        try {
            const local = localStorage.getItem("klever_mcp_directories");
            if (local) savedDirs = JSON.parse(local);
        } catch (e) { console.error(e); }
        if (savedDirs.length === 0) {
            savedDirs = [{ id: "dir_default", name: "연동된 API", description: "서버에서 불러온 도구들", active: true, isOpen: true, items: [] }];
        }
        mcp.mcpList.forEach((m) => {
            const mapped = { id: m.id, name: m.name, url: m.desc, method: m.method || "POST", active: m.active, apiKey: m.apiKey || "", params: m.parameters || [], type: m.type || "smithery" };
            let found = false;
            for (let dir of savedDirs) {
                const idx = dir.items.findIndex((item) => item.id === m.id);
                if (idx >= 0) { dir.items[idx] = mapped; found = true; break; }
            }
            if (!found && savedDirs[0]) savedDirs[0].items.push(mapped);
        });
        mcp.updateMcpData([...savedDirs]);
    }, [mcp.mcpList, mcp.isInitialMcpLoaded]); // eslint-disable-line react-hooks/exhaustive-deps

    // ── ESC 키 처리 ──
    useEffect(() => {
        const onKey = (e) => {
            if (e.key !== "Escape") return;
            agent.setIsModalOpen(false);
            agent.setIsExitModalOpen(false);
            agent.setIsNewKeyModalOpen(false);
            mcp.setIsAddDirModalOpen(false);
            agent.setAlertMessage("");
            agent.setDeleteTargetId(null);
            agent.setReissueTargetId(null);
            if (mcp.isAddItemModalOpen) mcp.closeSmitheryModal();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [
        agent.setIsModalOpen, agent.setIsExitModalOpen, agent.setIsNewKeyModalOpen,
        agent.setAlertMessage, agent.setDeleteTargetId, agent.setReissueTargetId,
        mcp.setIsAddDirModalOpen, mcp.isAddItemModalOpen, mcp.closeSmitheryModal,
    ]);

    // ── 에이전트 전환 시 상태 복원 ──
    useEffect(() => {
        const agentData = agent.apiKeys.find((a) => a.id === agent.selectedAgentId);
        if (!agentData) return;

        agent.setUiCharacter(agentData.character || "chanu");
        stage.restoreFromAgent(agentData);

        const engines = agentData.engines || { analysis: "gpt", rag: "gpt", response: "gpt" };
        const loadedAssistantId = agentData.assistantId || "";

        rag.setUiRagType(loadedAssistantId ? "native" : "none");
        rag.setAutoAssistantId(loadedAssistantId);
        rag.setNativeRagId(loadedAssistantId);

        prompt.restorePromptFromAgent(agentData);

        if (agent.isAgentSwitch(agent.selectedAgentId)) {
            agent.markAgentSwitched(agent.selectedAgentId);
            rag.resetRagForAgentSwitch({ engines, loadedAssistantId });
        }
    }, [agent.selectedAgentId, agent.apiKeys]); // eslint-disable-line react-hooks/exhaustive-deps

    // ── 저장 ──
    const confirmSave = useCallback(() => {
        agent.setIsModalOpen(false);
        const currentEngines = {
            analysis: getMappedLlmType(stage.stageEngines.analysis),
            rag: getMappedLlmType(stage.stageEngines.rag),
            response: getMappedLlmType(stage.stageEngines.response),
        };
        const currentKeys = {
            analysis: stage.stageEngines.analysisKey,
            response: stage.stageEngines.responseKey,
            rag: stage.stageEngines.ragKeys,
        };
        const updatedApiKeys = agent.apiKeys.map((k) =>
            k.id === agent.selectedAgentId
                ? { ...k, llm: currentEngines.response, engines: currentEngines, keys: currentKeys, stageStatus: stage.stageStatus }
                : k
        );
        agent.setApiKeys(updatedApiKeys);
        const DIGITAL_HUMANS = [
            { id: "yuri", num: 2 }, { id: "chanu", num: 1 }, { id: "sujin", num: 4 },
        ];
        saveConfiguration({
            apiKeys: updatedApiKeys,
            selectedAgentId: agent.selectedAgentId,
            uiCharacter: agent.uiCharacter,
            uiLlmType: currentEngines.response,
            uiRagType: stage.stageStatus.rag ? "native" : "none",
            autoAssistantId: rag.autoAssistantId,
            promptMode: prompt.promptMode,
            selectedTags: prompt.selectedTags,
            customTags: prompt.customTags,
            manualPrompt: prompt.manualPrompt,
            layout, autoOff, autoOffSec,
            mcpList: mcp.mcpList,
            setApiKeys: agent.setApiKeys,
            engines: currentEngines,
            keys: currentKeys,
            stageStatus: stage.stageStatus,
            digitalHumans: DIGITAL_HUMANS,
        });
        agent.setAlertMessage("성공적으로 적용되었습니다!");
    }, [agent, stage, rag, prompt, mcp, layout, autoOff, autoOffSec]);

    // ── 초기화 ──
    const handleReset = useCallback(() => {
        agent.resetAgentState();
        rag.resetRagState();
        prompt.resetPromptState();
        mcp.resetMcpState();
        stage.resetStageState();
        setLayout("bottom-right");
        setAutoOff(15);
        setAutoOffSec(0);
    }, [agent, rag, prompt, mcp, stage]);

    // ── 임베드 코드 ──
    const getEmbedCode = useCallback(() => {
        const total = (parseInt(autoOff) || 0) * 60 + (parseInt(autoOffSec) || 0);
        if (codeTab === "react")
            return `// npm install @klever-one/react\n\nimport { KleverWidget } from '@klever-one/react';\n\nexport default function App() {\n  return (\n    <>\n      <KleverWidget clientId="YOUR_CLIENT_ID" layout="${layout}" autoOff={${total}} />\n    </>\n  );\n}`;
        return `\n<script>\n  (function(w,d,s,o,f,js,fjs){w['KleverOneWidget']=o;w[o]=w[o]||function(){(w[o].q=w[o].q||[]).push(arguments)};js=d.createElement(s);fjs=d.getElementsByTagName(s)[0];js.id=o;js.src=f;js.async=1;fjs.parentNode.insertBefore(js,fjs);}(window,document,'script','kw','https://cdn.klever-one.com/widget.js'));\n  kw('init',{clientId:'YOUR_CLIENT_ID',layout:'${layout}',autoOff:${total}});\n</script>`;
    }, [codeTab, layout, autoOff, autoOffSec]);

    const handleCopyEmbedCode = useCallback(() => {
        try {
            const ta = document.createElement("textarea");
            ta.value = getEmbedCode();
            document.body.appendChild(ta); ta.select(); document.execCommand("copy"); document.body.removeChild(ta);
            agent.setAlertMessage("삽입 코드가 클립보드에 복사되었습니다!");
        } catch (err) { console.error(err); }
    }, [getEmbedCode, agent.setAlertMessage]);

    // ── 파생 데이터 ──
    const t = i18n[uiLang] || i18n["ko"];
    const savedAgent = agent.selectedAgent;
    const AVATAR_NUM = { yuri: 2, chanu: 1, sujin: 4 };
    const currentAvatarNum = AVATAR_NUM[agent.uiCharacter] ?? 1;
    const savedEngines = savedAgent.engines || { analysis: "gpt", rag: "gpt", response: "gpt" };
    const savedKeys = savedAgent.keys || { analysis: "", response: "", rag: { gpt: "", gemini: "", llamon: "" } };
    const resolvedPromptTags = (savedAgent.promptTags || []).map((tagId) => {
        const match = (savedAgent.customTags || []).find((ct) => ct.id === tagId);
        return match ? match.label : tagId;
    });

    const isGptRag = stage.stageEngines.rag.includes("GPT");
    const currentRagEngineType = getMappedLlmType(stage.stageEngines.rag);

    const sb = t.sidebar || i18n["ko"].sidebar;
    const stageDescriptions = t.stageDescriptions || i18n["ko"].stageDescriptions;
    const sidebarStages = [
        { id: "analysis", label: sb.analysis, engine: stage.stageStatus.analysis ? stage.stageEngines.analysis : "OFFLINE" },
        { id: "knowledge_group", label: sb.knowledge, isGroup: true, subItems: [
                { id: "rag", label: sb.rag, engine: stage.stageStatus.rag ? stage.stageEngines.rag : "OFFLINE" },
                { id: "mcp", label: sb.mcp, engine: `${mcp.mcpDirectories.filter((d) => d.active).reduce((sum, d) => sum + d.items.length, 0)} UNITS ACTIVE` },
                { id: "prompt", label: sb.prompt, engine: sb.promptActive },
            ]},
        { id: "response", label: sb.response, engine: stage.stageStatus.response ? stage.stageEngines.response : "OFFLINE" },
    ];

    return (
        <div className={`app-root ${!isDarkMode ? "light-mode" : ""}`}>
            <div className="agent-settings-container">

                {/* 헤더 */}
                <div className="view-header">
                    <div className="title-area">
                        <h1 className="main-title"><span className="highlight">KLEVER ONE</span></h1>
                        <p className="sub-title">{t.subTitle}</p>
                    </div>
                    <div className="header-buttons">
                        <select className="ui-lang-select" value={uiLang} onChange={(e) => setUiLang(e.target.value)}>
                            <option value="ko">한국어</option>
                            <option value="en">English</option>
                            <option value="zh">中文</option>
                            <option value="vi">Tiếng Việt</option>
                            <option value="ja">日本語</option>
                        </select>
                        <button className="btn-icon-theme" onClick={() => setIsDarkMode((prev) => !prev)}>
                            {isDarkMode
                                ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
                                : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                            }
                        </button>
                        <button className="btn-outline" onClick={handleReset}>{t.reset}</button>
                        <button className="btn-primary" onClick={() => agent.setIsModalOpen(true)}>{t.save}</button>
                        <button className="btn-icon-back" onClick={() => agent.setIsExitModalOpen(true)}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                            </svg>
                        </button>
                    </div>
                </div>

                {/* 탭 */}
                <div className="settings-tabs">
                    {["agent", "system", "widget"].map((tab, i) => (
                        <button
                            key={tab}
                            className={`tab-btn ${activeTab === tab ? "active" : ""}`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {[t.tab1, t.tab2, t.tab3][i]}
                        </button>
                    ))}
                </div>

                {/* 탭 콘텐츠 */}
                <div className="tab-content-area">
                    {activeTab === "agent" && (
                        <AgentTab agent={agent} i18n={i18n} uiLang={uiLang} />
                    )}
                    {activeTab === "system" && (
                        <SystemTab
                            t={t}
                            selectedStage={stage.selectedStage} setSelectedStage={stage.setSelectedStage}
                            stageStatus={stage.stageStatus} setStageStatus={stage.setStageStatus}
                            stageEngines={stage.stageEngines} setStageEngines={stage.setStageEngines}
                            isToggleable={stage.isToggleable}
                            sidebarStages={sidebarStages}
                            stageDescriptions={stageDescriptions}
                            rag={rag} isGptRag={isGptRag} currentRagEngineType={currentRagEngineType}
                            mcp={mcp} prompt={prompt}
                            setAlertMessage={agent.setAlertMessage}
                        />
                    )}
                    {activeTab === "widget" && (
                        <WidgetTab
                            i18n={i18n} uiLang={uiLang}
                            layout={layout} setLayout={setLayout}
                            autoOff={autoOff} setAutoOff={setAutoOff}
                            autoOffSec={autoOffSec} setAutoOffSec={setAutoOffSec}
                            codeTab={codeTab} setCodeTab={setCodeTab}
                            getEmbedCode={getEmbedCode}
                            handleCopyEmbedCode={handleCopyEmbedCode}
                        />
                    )}
                </div>
            </div>

            {/* 챗봇 */}
            <div id="chatbot-wrapper">
                {chatbotType === "sdk" ? (
                    <DigitalHuman apiKey={import.meta.env.VITE_KLEVER_API_KEY} layout={layout} />
                ) : (
                    <BasicChatbot
                        unrealurl={import.meta.env.VITE_MATCHMAKER}
                        layout={layout}
                        autoOff={autoOff * 60 + autoOffSec}
                        avatarnum={currentAvatarNum}
                        analysisLlm={savedEngines.analysis || "gpt"}
                        ragLlm={savedEngines.rag || "gpt"}
                        responseLlm={savedEngines.response || savedAgent.llm || "gpt"}
                        analysisApiKey={savedKeys.analysis || ""}
                        ragApiKey={savedKeys.rag?.[savedEngines.rag] || ""}
                        responseApiKey={savedKeys.response || ""}
                        assistantId={savedAgent.assistantId || ""}
                        promptMode={savedAgent.promptMode || "tag"}
                        promptTags={resolvedPromptTags}
                        promptManual={savedAgent.promptManual || ""}
                        mcpList={mcp.mcpList}
                    />
                )}
            </div>

            {/* 모달 */}
            <ConfirmModals agent={agent} onConfirmSave={confirmSave} t={t} />
            <SmitheryModal mcp={mcp} t={t} />
            <AddDirectoryModal isOpen={mcp.isAddDirModalOpen} mcp={mcp} t={t} />
        </div>
    );
}