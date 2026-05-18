import { PasswordInput } from "../shared/PasswordInput.jsx";
import { Spinner } from "../shared/Spinner.jsx";

export function SystemTab({ t,
                              // 스테이지
                              selectedStage, setSelectedStage,
                              stageStatus, setStageStatus,
                              stageEngines, setStageEngines,
                              isToggleable,
                              sidebarStages,
                              stageDescriptions,
                              // RAG
                              rag,
                              isGptRag,
                              currentRagEngineType,
                              // MCP
                              mcp,
                              // 프롬프트
                              prompt,
                              // 공용
                              setAlertMessage,
                          }) {
    return (
        <div className="tab-pane fade-in" style={{ padding: "10px" }}>
            <div className="system-pane" style={{ display: "flex", gap: "10px", alignItems: "flex-start", width: "100%", minHeight: "820px" }}>

                {/* 좌측 워크플로우 사이드바 */}
                <div style={{ width: "320px", flexShrink: 0, display: "flex", flexDirection: "column", gap: "16px", height: "820px", overflowY: "auto", paddingRight: "12px" }}>
                    <div className="glass-card" style={{ padding: "24px", borderRadius: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
                        {sidebarStages.map((stage) => {
                            if (stage.isGroup) {
                                const isAnySubActive = stage.subItems.some((s) => selectedStage === s.id);
                                return (
                                    <div key={stage.id} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                        <div className={`setting-card ${isAnySubActive ? "active-no-glow" : ""}`} style={{ padding: "16px 20px", borderRadius: "16px", border: isAnySubActive ? "1.5px solid var(--accent)" : "1px solid var(--border-glass)", backgroundColor: isAnySubActive ? "rgba(0,198,255,0.08)" : "var(--sidebar-card-bg)", transition: "all 0.2s ease-out" }}>
                                            <h3 style={{ fontSize: "14px", fontWeight: "700", color: isAnySubActive ? "var(--sidebar-active-text)" : "var(--sidebar-text)", margin: 0 }}>{stage.label}</h3>
                                        </div>
                                        <div style={{ paddingLeft: "12px", display: "flex", flexDirection: "column", gap: "4px", marginTop: "4px", borderLeft: "1px solid rgba(0,198,255,0.2)", marginLeft: "12px" }}>
                                            {stage.subItems.map((subItem) => {
                                                const isActive = selectedStage === subItem.id;
                                                const isOn = stageStatus[subItem.id];
                                                return (
                                                    <div key={subItem.id} className={`setting-card ${isActive ? "active-no-glow" : ""}`}
                                                         style={{ padding: "10px 16px", cursor: "pointer", borderRadius: "12px", border: isActive ? "1px solid var(--accent)" : "1px solid transparent", backgroundColor: isActive ? "rgba(0,198,255,0.05)" : "transparent", transition: "all 0.2s ease-out" }}
                                                         onClick={() => setSelectedStage(subItem.id)}>
                                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                                                                <h4 style={{ fontSize: "13px", fontWeight: "600", color: isActive ? "var(--sidebar-active-text)" : (isOn ? "var(--sidebar-text)" : "var(--text-muted)"), margin: 0 }}>{subItem.label}</h4>
                                                                {isOn && (subItem.id === "rag" || (subItem.id === "mcp" && mcp.mcpDirectories.some((d) => d.active))) && (
                                                                    <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "4px" }}>
                                                                        {subItem.id === "rag" ? (
                                                                            <span style={{ fontSize: "9px", color: "var(--accent)", backgroundColor: "rgba(0,198,255,0.1)", padding: "2px 5px", borderRadius: "4px", fontFamily: "var(--f-mono)", opacity: 0.8, letterSpacing: "0.01em", textTransform: "uppercase" }}>{stageEngines.rag}</span>
                                                                        ) : subItem.id === "mcp" ? (
                                                                            mcp.mcpDirectories.filter((d) => d.active).map((d) => (
                                                                                <span key={d.id} style={{ fontSize: "9px", color: "var(--accent)", backgroundColor: "rgba(0,198,255,0.1)", padding: "2px 5px", borderRadius: "4px", fontFamily: "var(--f-mono)", opacity: 0.8, letterSpacing: "0.01em", textTransform: "uppercase" }}>{d.name}</span>
                                                                            ))
                                                                        ) : null}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div style={{ width: "5px", height: "5px", borderRadius: "50%", backgroundColor: isOn ? "var(--accent)" : "#4a5568" }} />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            }
                            const isActive = selectedStage === stage.id;
                            return (
                                <div key={stage.id} className={`setting-card ${isActive ? "active-no-glow" : ""}`}
                                     style={{ padding: "16px 20px", cursor: "pointer", borderRadius: "16px", border: isActive ? "1.5px solid var(--accent)" : "1px solid var(--border-glass)", backgroundColor: isActive ? "rgba(0,198,255,0.08)" : "var(--sidebar-card-bg)", transition: "all 0.2s ease-out", marginBottom: "4px" }}
                                     onClick={() => setSelectedStage(stage.id)}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                                            <h3 style={{ fontSize: "14px", fontWeight: "700", color: isActive ? "var(--sidebar-active-text)" : "var(--sidebar-text)", margin: 0 }}>{stage.label}</h3>
                                            <div style={{ display: "flex", marginTop: "4px" }}>
                                                <span style={{ fontSize: "9px", color: "var(--accent)", backgroundColor: "rgba(0,198,255,0.1)", padding: "2px 5px", borderRadius: "4px", fontFamily: "var(--f-mono)", opacity: 0.8, letterSpacing: "0.01em", textTransform: "uppercase" }}>{stage.engine}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* 우측 상세 패널 */}
                <div style={{ flex: 1, minHeight: "820px", overflowY: selectedStage === "mcp" ? "visible" : "auto" }}>
                    <div style={{ minHeight: "100%", backgroundColor: "var(--bg-card)", border: "1px solid var(--border-glass)", borderRadius: "16px", padding: "32px", display: "flex", flexDirection: "column", boxSizing: "border-box", boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}>

                        {/* 패널 헤더 */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#00c6ff", boxShadow: "0 0 10px #00c6ff" }} />
                                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                                    <h2 style={{ fontSize: "18px", fontWeight: "700", color: "var(--text-primary)", margin: 0, letterSpacing: "-0.02em" }}>{stageDescriptions[selectedStage]?.title}</h2>
                                    <p style={{ fontSize: "13px", color: "var(--text-muted)", opacity: 0.8, margin: 0, lineHeight: "1.4" }}>{stageDescriptions[selectedStage]?.desc}</p>
                                </div>
                            </div>
                            {isToggleable && (
                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "11px", fontWeight: "700", color: stageStatus[selectedStage] ? "#00c6ff" : "#4a5568", textTransform: "uppercase" }}>
                    {stageStatus[selectedStage] ? t.toggleActive : t.toggleInactive}
                  </span>
                                    <div style={{ width: "46px", height: "22px", backgroundColor: stageStatus[selectedStage] ? "#00c6ff" : "var(--toggle-off-bg)", borderRadius: "11px", position: "relative", cursor: "pointer", transition: "all 0.3s ease" }}
                                         onClick={() => setStageStatus((prev) => ({ ...prev, [selectedStage]: !prev[selectedStage] }))}>
                                        <div style={{ width: "18px", height: "18px", backgroundColor: "#fff", borderRadius: "50%", position: "absolute", left: stageStatus[selectedStage] ? "25px" : "3px", top: "2px", transition: "all 0.25s cubic-bezier(0.16,1,0.3,1)", boxShadow: "0 2px 4px rgba(0,0,0,0.3)" }} />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div style={{ borderBottom: "1px solid var(--divider-color)", marginBottom: "24px" }} />

                        <div style={{ flex: 1 }}>

                            {/* ── analysis / response ── */}
                            {(selectedStage === "analysis" || selectedStage === "response") && (
                                <div className="fade-in">
                                    <div className="form-group" style={{ marginBottom: "32px" }}>
                                        <label className="stage-form-label" style={{ marginBottom: "12px" }}>
                                            {selectedStage === "analysis" ? t.analysisEngineLabel : t.responseEngineLabel}
                                        </label>
                                        <select className="custom-select" style={{ height: "52px", borderRadius: "10px", fontSize: "15px" }}
                                                value={selectedStage === "analysis" ? stageEngines.analysis : stageEngines.response}
                                                onChange={(e) => setStageEngines((prev) => ({ ...prev, [selectedStage]: e.target.value }))}>
                                            <option>OpenAI GPT-5.3</option>
                                            <option>Google Gemini 3.1 Pro</option>
                                            <option disabled>LLaMON</option>
                                            <option disabled>{t.customEngine}</option>
                                        </select>
                                    </div>
                                    <div className="stage-key-box">
                                        <label className="stage-key-label">{t.apiKeySection}</label>
                                        <PasswordInput
                                            placeholder={t.apiKeyPlaceholder}
                                            value={selectedStage === "analysis" ? stageEngines.analysisKey : stageEngines.responseKey}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setStageEngines((prev) => ({ ...prev, [selectedStage === "analysis" ? "analysisKey" : "responseKey"]: val }));
                                            }}
                                        />
                                        <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "8px" }}>{t.apiKeyHint}</p>
                                    </div>
                                </div>
                            )}

                            {/* ── RAG ── */}
                            {selectedStage === "rag" && (
                                <div className="fade-in">
                                    <div className="form-group" style={{ marginBottom: "20px" }}>
                                        <label className="stage-form-label" style={{ marginBottom: "8px" }}>{t.ragEngineLabel}</label>
                                        <select className="custom-select" style={{ height: "48px", fontSize: "14px" }}
                                                value={stageEngines.rag}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    setStageEngines((prev) => ({ ...prev, rag: val }));
                                                    if (!val.includes("GPT")) rag.setNativeRagId("");
                                                }}>
                                            <option value="OpenAI GPT-5.3">OpenAI GPT-5.3</option>
                                            <option value="Google Gemini 3.1 Pro">Google Gemini 3.1 Pro</option>
                                            <option value="LLaMON" disabled>LLaMON</option>
                                        </select>
                                    </div>
                                    <div className="stage-key-box">
                                        <div className="form-group" style={{ marginBottom: "20px" }}>
                                            <label className="stage-form-label">{isGptRag ? "OpenAI" : "Gemini"} API Key 설정</label>
                                            <PasswordInput
                                                placeholder="API 키를 입력하세요..."
                                                value={stageEngines.ragKeys[currentRagEngineType] || ""}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    setStageEngines((prev) => ({ ...prev, ragKeys: { ...prev.ragKeys, [currentRagEngineType]: val } }));
                                                }}
                                            />
                                        </div>
                                        {isGptRag && (
                                            <div className="form-group" style={{ marginBottom: "20px" }}>
                                                <label className="stage-form-label" style={{ marginBottom: "8px" }}>{t.vectorStoreLabel}</label>
                                                <input type="text" className="custom-input" placeholder="vs_abc123def456"
                                                       style={{ backgroundColor: "rgba(255,255,255,0.02)", border: "1px solid #4a5568", borderRadius: "12px", color: "#cbd5e0", padding: "10px 14px", fontSize: "13px", outline: "none" }}
                                                       value={rag.nativeRagId}
                                                       onChange={(e) => rag.setNativeRagId(e.target.value)}
                                                       onBlur={() => rag.handleVectorIdFinish(setAlertMessage)}
                                                       onKeyDown={(e) => { if (e.key === "Enter") rag.handleVectorIdFinish(setAlertMessage); }}
                                                />
                                            </div>
                                        )}

                                        {/* 지식 업로드 */}
                                        <div className="form-group" style={{ marginBottom: "24px" }}>
                                            <label style={{ fontSize: "13px", color: "#a0aec0", marginBottom: "8px", display: "block" }}>{t.knowledgeLabel}</label>
                                            <div className={`unified-rag-box ${rag.isDragging ? "drag-active" : ""} ${rag.isUploading ? "uploading" : ""}`}
                                                 style={{ position: "relative", backgroundColor: "rgba(255,255,255,0.02)", border: rag.isDragging ? "2px solid var(--accent)" : "1px dashed #4a5568", borderRadius: "12px", minHeight: "160px", display: "flex", flexDirection: "column", transition: "all 0.2s" }}
                                                 onDragOver={rag.handleDragOver} onDragLeave={rag.handleDragLeave} onDrop={rag.handleDrop}>
                        <textarea className="unified-rag-textarea"
                                  placeholder={t.knowledgePlaceholder}
                                  value={rag.ragInput}
                                  onChange={(e) => rag.setRagInput(e.target.value)}
                                  onKeyDown={rag.handleRagKeyDown}
                        />
                                                <input type="file" ref={rag.fileInputRef} style={{ display: "none" }} accept=".pdf,.txt,.doc,.docx" multiple onChange={rag.handleFileChange} />
                                                {(rag.ragFiles.length > 0 || rag.ragTexts.length > 0) && (
                                                    <div className="rag-files-preview" style={{ paddingBottom: "40px" }}>
                                                        {rag.ragTexts.map((item) => (
                                                            <div key={item.id} className="file-chip">
                                                                {item.type === "url"
                                                                    ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                                                                    : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                                                                }
                                                                <span title={item.content}>{item.content}</span>
                                                                <button type="button" onClick={() => rag.removeRagText(item.id)}>
                                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                                                </button>
                                                            </div>
                                                        ))}
                                                        {rag.ragFiles.map((file) => (
                                                            <div key={file.id} className="file-chip">
                                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>
                                                                <span>{file.name}</span>
                                                                <button type="button" onClick={() => rag.removeFile(file.id)}>
                                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                                <div className="unified-rag-bottom">
                                                    <button className="btn-attach-new" onClick={rag.handleFileAttach}>
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                                                        파일 첨부
                                                    </button>
                                                    <button className="btn-submit-new"
                                                            onClick={() => rag.handleUploadKnowledge(setAlertMessage)}
                                                            disabled={rag.isUploading || (!rag.ragInput.trim() && rag.ragFiles.length === 0 && rag.ragTexts.length === 0)}>
                                                        {rag.isUploading
                                                            ? <Spinner />
                                                            : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>
                                                        }
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* 지식 목록 */}
                                        <div>
                                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: rag.isKnowledgeListOpen ? "8px" : "0" }}>
                                                <button className="btn-icon" onClick={() => rag.setIsKnowledgeListOpen(!rag.isKnowledgeListOpen)} style={{ padding: "6px", margin: "-6px" }}>
                                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
                                                </button>
                                                {rag.isKnowledgeListOpen && (
                                                    <label style={{ fontSize: "13px", color: "#e2e8f0", fontWeight: 600, margin: 0, whiteSpace: "nowrap" }}>
                                                        {t.savedKnowledgeLabel} ({rag.savedKnowledge.length})
                                                    </label>
                                                )}
                                            </div>
                                            {rag.isKnowledgeListOpen && (
                                                rag.savedKnowledge.length === 0 ? (
                                                    <div style={{ padding: "32px 20px", textAlign: "center", border: "1px dashed #4a5568", borderRadius: "8px", color: "#718096", fontSize: "13px", backgroundColor: "var(--dir-body-bg)", marginTop: "8px" }}>
                                                        업로드된 지식 데이터가 없습니다.
                                                    </div>
                                                ) : (
                                                    <div className="knowledge-list-wrap">
                                                        {rag.savedKnowledge.map((item) => (
                                                            <div key={item.id} className={`knowledge-item ${rag.selectedKnowledgeIds.includes(item.id) ? "selected" : ""}`} onClick={() => rag.handleToggleKnowledgeSelection(item.id)}>
                                                                <div className="knowledge-info">
                                                                    <input type="checkbox" className="knowledge-checkbox" checked={rag.selectedKnowledgeIds.includes(item.id)} readOnly />
                                                                    <div className="knowledge-icon">
                                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                            {item.type === "document"
                                                                                ? <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                                                                                : <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                                                                            }
                                                                        </svg>
                                                                    </div>
                                                                    <div className="knowledge-details">
                                                                        <span className="knowledge-name" title={item.name}>{item.name}</span>
                                                                        <span className="knowledge-date">{item.date} {t.uploadedAt}</span>
                                                                    </div>
                                                                </div>
                                                                <div style={{ display: "flex", gap: "4px" }}>
                                                                    <button className="btn-icon" onClick={(e) => { e.stopPropagation(); rag.handleEditKnowledge(item); }}>
                                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                                                    </button>
                                                                    <button className="btn-icon danger" onClick={(e) => { e.stopPropagation(); rag.handleDeleteKnowledge(item.id); }}>
                                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ── MCP ── */}
                            {selectedStage === "mcp" && (
                                <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                            <h2 style={{ fontSize: "16px", fontWeight: "800", color: "#fff", margin: 0 }}>{t.dirListTitle}</h2>
                                            <span style={{ fontSize: "9px", fontWeight: "800", color: "#00c6ff", border: "1px solid rgba(0,198,255,0.4)", padding: "2px 7px", borderRadius: "5px", backgroundColor: "rgba(0,198,255,0.08)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Smithery Connected</span>
                                        </div>
                                        <button className="btn-klever-sync" style={{ padding: "10px 24px", borderRadius: "12px", fontSize: "13px" }} onClick={() => mcp.setIsAddDirModalOpen(true)}>{t.addDirBtn}</button>
                                    </div>
                                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "20px" }}>
                                        {mcp.mcpDirectories.length > 0 ? mcp.mcpDirectories.map((dir) => (
                                            <div key={dir.id} className="setting-card glass-card" style={{ padding: 0, overflow: "hidden", border: "1px solid var(--border-glass)", transition: "all 0.3s" }}>
                                                <div onClick={() => mcp.toggleDirectory(dir.id)} style={{ padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", borderBottom: "1px solid var(--border-glass)", background: "var(--dir-header-bg)" }}>
                                                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <span style={{ color: "var(--accent)", fontSize: "14px", transform: dir.isOpen ? "rotate(0deg)" : "rotate(-90deg)", transition: "0.3s" }}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="6 9 12 15 18 9"/></svg>
                            </span>
                                                        <div style={{ display: "flex", flexDirection: "column" }}>
                                                            <span style={{ color: "var(--dir-name-color)", fontSize: "15px", fontWeight: "700" }}>{dir.name}</span>
                                                            <span style={{ color: "var(--text-muted)", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.05em" }}>{dir.items.length} Units</span>
                                                        </div>
                                                    </div>
                                                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                                                        <button onClick={(e) => mcp.handleDeleteDirectory(dir.id, e)} style={{ background: "none", border: "none", color: "#718096", cursor: "pointer", padding: "4px", display: "flex", alignItems: "center" }}>
                                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                                                        </button>
                                                        <div onClick={(e) => mcp.toggleDirectoryActive(dir.id, e)} style={{ width: "36px", height: "18px", backgroundColor: dir.active ? "var(--accent)" : "#1e293b", borderRadius: "18px", position: "relative", cursor: "pointer" }}>
                                                            <div style={{ width: "12px", height: "12px", backgroundColor: "#fff", borderRadius: "50%", position: "absolute", left: dir.active ? "22px" : "2px", top: "3px", transition: "0.2s" }} />
                                                        </div>
                                                    </div>
                                                </div>
                                                {dir.isOpen && (
                                                    <div style={{ padding: "20px", backgroundColor: "var(--dir-body-bg)" }}>
                                                        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
                                                            {dir.items.map((item) => (
                                                                <div key={item.id} className="glass-card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)", backgroundColor: "var(--dir-item-bg)" }}>
                                                                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                                                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                                                            <span style={{ color: "var(--dir-name-color)", fontSize: "13px", fontWeight: "600" }}>{item.name}</span>
                                                                            <span style={{ fontSize: "8px", fontWeight: "700", color: "#00c6ff", border: "1px solid rgba(0,198,255,0.3)", padding: "1px 5px", borderRadius: "4px", backgroundColor: "rgba(0,198,255,0.06)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Smithery</span>
                                                                        </div>
                                                                        <span style={{ color: "var(--text-muted)", fontSize: "10px", fontFamily: "var(--f-mono)", opacity: 0.7 }}>
                                      POST · {(item.params || []).length} params
                                                                            {item.qualifiedName && <span style={{ marginLeft: "6px", color: "#4a5568" }}>· {item.qualifiedName}</span>}
                                    </span>
                                                                    </div>
                                                                    <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                                                                        <button style={{ padding: "5px 10px", fontSize: "11px", color: "var(--text-secondary)", border: "1px solid var(--border-glass)", borderRadius: "6px", background: "rgba(255,255,255,0.03)", cursor: "pointer" }}
                                                                                onClick={() => mcp.openSmitheryModal({ dirId: dir.id, item })}>{t.editBtn}</button>
                                                                        <button style={{ padding: "5px 10px", fontSize: "11px", color: "#fca5a5", border: "1px solid rgba(248,113,113,0.2)", borderRadius: "6px", background: "rgba(248,113,113,0.05)", cursor: "pointer" }}
                                                                                onClick={() => mcp.handleDeleteApiItem(dir.id, item.id)}>{t.deleteBtn}</button>
                                                                        <div onClick={(e) => mcp.toggleItemActive(dir.id, item.id, e)} style={{ width: "32px", height: "16px", backgroundColor: item.active ? "var(--accent)" : "#2d3748", borderRadius: "16px", position: "relative", cursor: "pointer" }}>
                                                                            <div style={{ width: "10px", height: "10px", backgroundColor: "#fff", borderRadius: "50%", position: "absolute", left: item.active ? "20px" : "2px", top: "3px", transition: "0.2s" }} />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <button style={{ padding: "12px", border: "1px solid #4a5568", borderRadius: "10px", fontSize: "12px", color: "#718096", background: "rgba(255,255,255,0.02)", cursor: "pointer", width: "100%", fontWeight: "600" }}
                                                                onClick={() => mcp.openSmitheryModal({ dirId: dir.id })}>{t.addToolBtn}</button>
                                                    </div>
                                                )}
                                            </div>
                                        )) : (
                                            <div style={{ gridColumn: "1 / -1", padding: "60px 40px", textAlign: "center", color: "var(--text-muted)", backgroundColor: "var(--dir-item-bg)", borderRadius: "20px", border: "1px solid var(--border-glass)" }}>{t.noDirs}</div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* ── 프롬프팅 ── */}
                            {selectedStage === "prompt" && (
                                <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                                        <div className="mode-toggle-group">
                                            <button className={`mode-toggle-btn ${prompt.promptMode === "tag" ? "active" : ""}`} onClick={() => prompt.setPromptMode("tag")}>{t.tagModeBtn}</button>
                                            <button className={`mode-toggle-btn ${prompt.promptMode === "manual" ? "active" : ""}`} onClick={() => prompt.setPromptMode("manual")}>{t.manualModeBtn}</button>
                                        </div>
                                    </div>
                                    {prompt.promptMode === "tag" && (
                                        <div>
                                            <h4 style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "12px", fontWeight: "600" }}>{t.tagSectionLabel}</h4>
                                            <div style={{ border: "1px solid #2d3748", borderRadius: "14px", padding: "12px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                                                {(t.promptTags || prompt.promptTagOptions).map((tag) => {
                                                    const isActive = prompt.selectedTags.includes(tag.id);
                                                    return (
                                                        <div key={tag.id} onClick={() => prompt.togglePromptTag(tag.id)}
                                                             style={{ padding: "8px 12px", borderRadius: "10px", border: "1px solid " + (isActive ? "var(--accent)" : "var(--tag-border)"), backgroundColor: isActive ? "var(--tag-active-bg)" : "transparent", color: isActive ? "var(--sidebar-active-text)" : "var(--text-muted)", fontSize: "12px", fontWeight: "600", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", cursor: "pointer" }}>
                                                            {isActive && <span>✓</span>}{tag.label}
                                                        </div>
                                                    );
                                                })}
                                                {prompt.customTags.map((tag) => {
                                                    const isActive = prompt.selectedTags.includes(tag.id);
                                                    return (
                                                        <div key={tag.id} onClick={() => prompt.togglePromptTag(tag.id)}
                                                             style={{ position: "relative", padding: "8px 12px", borderRadius: "10px", border: "1px solid " + (isActive ? "var(--accent)" : "var(--tag-border)"), backgroundColor: isActive ? "var(--tag-active-bg)" : "transparent", color: isActive ? "var(--sidebar-active-text)" : "var(--text-muted)", fontSize: "12px", fontWeight: "600", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", cursor: "pointer" }}>
                                                            {isActive && <span>✓</span>}{tag.label}
                                                            <button type="button" className="prompt-tag-remove" onClick={(e) => prompt.handleRemoveCustomTag(e, tag.id)} style={{ position: "absolute", right: "8px" }}>
                                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                                            </button>
                                                        </div>
                                                    );
                                                })}
                                                <div style={{ gridColumn: "span 2", padding: "1px", borderRadius: "12px", border: "1px solid #4a5568", background: "var(--dir-header-bg)" }}>
                                                    <div style={{ display: "flex", alignItems: "center" }}>
                                                        <input type="text" placeholder={t.tagInputPlaceholder}
                                                               style={{ flex: 1, border: "none", background: "none", color: "#718096", fontSize: "12px", fontWeight: "600", padding: "8px 12px", outline: "none" }}
                                                               value={prompt.customTagInput}
                                                               onChange={(e) => prompt.setCustomTagInput(e.target.value)}
                                                               onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); prompt.handleAddCustomTag(); } }}
                                                        />
                                                        <button className="btn-add-tag" onClick={prompt.handleAddCustomTag} style={{ margin: "4px" }}>{t.tagAddBtn}</button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {prompt.promptMode === "manual" && (
                                        <div>
                                            <h4 style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "12px", fontWeight: "600" }}>{t.manualModeBtn}</h4>
                                            <textarea className="manual-prompt-textarea"
                                                      placeholder={t.manualPlaceholder}
                                                      value={prompt.manualPrompt}
                                                      onChange={(e) => prompt.setManualPrompt(e.target.value)}
                                                      style={{ height: "280px" }}
                                            />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}