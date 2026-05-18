import { PasswordInput } from "../shared/PasswordInput.jsx";
import { Spinner } from "../shared/Spinner.jsx";

export function SmitheryModal({ mcp, t }) {
  if (!mcp.isAddItemModalOpen) return null;

  return (
      <div className="modal-overlay">
        <div className="modal-box" style={{ maxWidth: "580px", textAlign: "left", padding: "28px", maxHeight: "90vh", overflowY: "auto" }}>

          {/* 헤더 */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
            <span style={{ fontSize: "10px", fontWeight: "800", color: "#00c6ff", border: "1px solid rgba(0,198,255,0.4)", padding: "2px 8px", borderRadius: "6px", backgroundColor: "rgba(0,198,255,0.08)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Smithery</span>
            <h2 className="modal-title" style={{ margin: 0, fontSize: "20px" }}>{mcp.targetItemId ? t.smitheryEditTitle : t.smitheryAddTitle}</h2>
          </div>
          <p className="modal-desc" style={{ marginBottom: "20px" }}>{t.smitheryDesc}</p>

          {/* Step 1: 서버 검색 */}
          <div style={{ marginBottom: "16px" }}>
            <label style={{ fontSize: "12px", fontWeight: "700", color: "#718096", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: "8px" }}>
              {t.smitheryStep1}
            </label>
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                  type="text"
                  className="custom-input"
                  placeholder={t.smitherySearchPlaceholder}
                  value={mcp.smitherySearchQuery}
                  onChange={(e) => mcp.setSmitherySearchQuery(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") mcp.handleSmitherySearch(); }}
                  style={{ flex: 1 }}
                  autoFocus
              />
              <button
                  className="btn-klever-sync"
                  style={{ padding: "0 20px", borderRadius: "10px", whiteSpace: "nowrap", minWidth: "80px" }}
                  onClick={mcp.handleSmitherySearch}
                  disabled={mcp.isSearching || !mcp.smitherySearchQuery.trim()}
              >
                {mcp.isSearching ? <Spinner /> : t.searchBtn}
              </button>
            </div>

            {/* 검색 결과 */}
            {mcp.smitherySearchResults.length > 0 && (
                <div style={{ marginTop: "8px", border: "1px solid rgba(0,198,255,0.3)", borderRadius: "12px", overflow: "hidden", backgroundColor: "#0b0d10", maxHeight: "220px", overflowY: "auto" }}>
                  {mcp.smitherySearchResults.map((server, idx) => (
                      <div
                          key={idx}
                          onClick={() => mcp.handleSelectSmitheryServer(server)}
                          style={{ padding: "12px 16px", cursor: "pointer", borderBottom: idx < mcp.smitherySearchResults.length - 1 ? "1px solid #1a1d24" : "none", transition: "background 0.15s" }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(0,198,255,0.06)"}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                            <span style={{ color: "#fff", fontSize: "13px", fontWeight: "600" }}>{server.displayName || server.qualifiedName}</span>
                            <span style={{ color: "#718096", fontSize: "11px" }}>{server.qualifiedName}</span>
                            {server.description && (
                                <span style={{ color: "#4a5568", fontSize: "11px", marginTop: "2px" }}>{server.description.slice(0, 70)}{server.description.length > 70 ? "..." : ""}</span>
                            )}
                          </div>
                          <span style={{ fontSize: "9px", color: "#00c6ff", border: "1px solid rgba(0,198,255,0.3)", padding: "2px 8px", borderRadius: "4px", whiteSpace: "nowrap", flexShrink: 0, marginLeft: "12px" }}>선택</span>
                        </div>
                      </div>
                  ))}
                </div>
            )}

            {/* 선택된 서버 + API 키 입력 */}
            {mcp.selectedSmitheryServer && (
                <div style={{ marginTop: "12px" }}>
                  <div style={{ padding: "10px 14px", borderRadius: "10px", backgroundColor: "rgba(0,198,255,0.06)", border: "1px solid rgba(0,198,255,0.2)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <span style={{ color: "#00c6ff", fontSize: "13px", fontWeight: "600" }}>{mcp.selectedSmitheryServer.displayName || mcp.selectedSmitheryServer.qualifiedName}</span>
                      <span style={{ color: "#4a5568", fontSize: "11px", marginLeft: "8px" }}>{mcp.selectedSmitheryServer.qualifiedName}</span>
                    </div>
                    <button
                        onClick={() => { mcp.setSelectedSmitheryServer(null); mcp.setServerToolList([]); mcp.setSelectedToolName(""); mcp.setSmitheryToolSpec(null); mcp.setSmitheryNeedsApiKey(false); mcp.setSmitheryFetchError(""); }}
                        style={{ background: "none", border: "none", color: "#718096", cursor: "pointer", fontSize: "16px", padding: "2px 6px" }}>✕</button>
                  </div>

                  {mcp.smitheryNeedsApiKey && (
                      <div style={{ marginTop: "12px", padding: "16px", backgroundColor: "rgba(248,113,113,0.05)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: "10px" }}>
                        <label style={{ fontSize: "12px", fontWeight: "700", color: "#fca5a5", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: "8px" }}>{t.smitheryApiKeyWarning}</label>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <PasswordInput
                              placeholder={t.smitheryApiKeyPlaceholder}
                              value={mcp.smitheryApiKey}
                              onChange={(e) => mcp.setSmitheryApiKey(e.target.value)}
                          />
                          <button
                              className="btn-klever-sync"
                              style={{ padding: "0 16px", borderRadius: "10px", whiteSpace: "nowrap", minWidth: "80px", opacity: mcp.smitheryApiKey.trim() && !mcp.isFetchingSpec ? 1 : 0.4 }}
                              onClick={mcp.handleRetryWithApiKey}
                              disabled={!mcp.smitheryApiKey.trim() || mcp.isFetchingSpec}
                          >
                            {mcp.isFetchingSpec ? <Spinner /> : t.retryBtn}
                          </button>
                        </div>
                        <p style={{ fontSize: "11px", color: "#fca5a5", marginTop: "8px", lineHeight: "1.5" }}>* 이 서버는 인증키 또는 유료 API 키가 필요합니다.</p>
                      </div>
                  )}
                </div>
            )}
          </div>

          {/* 로딩 */}
          {mcp.isFetchingSpec && !mcp.smitheryToolSpec && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px", color: "#718096", fontSize: "13px" }}>
                <Spinner size={16} /> {t.toolListLabel}...
              </div>
          )}

          {/* Step 2: 툴 선택 */}
          {mcp.serverToolList.length > 0 && (
              <div style={{ marginBottom: "16px" }}>
                <label style={{ fontSize: "12px", fontWeight: "700", color: "#718096", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: "8px" }}>
                  {t.smitheryStep2} ({mcp.serverToolList.length}{t.smitheryToolCount})
                </label>
                <div style={{ border: "1px solid #2d3748", borderRadius: "12px", overflow: "hidden", maxHeight: "180px", overflowY: "auto" }}>
                  {mcp.serverToolList.map((tool, idx) => {
                    const isSelected = mcp.selectedToolName === tool.name;
                    return (
                        <div
                            key={idx}
                            onClick={() => mcp.handleSelectTool(tool)}
                            style={{ padding: "10px 14px", cursor: "pointer", borderBottom: idx < mcp.serverToolList.length - 1 ? "1px solid #1a1d24" : "none", backgroundColor: isSelected ? "rgba(0,198,255,0.08)" : "transparent", transition: "background 0.15s", display: "flex", justifyContent: "space-between", alignItems: "center" }}
                            onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.02)"; }}
                            onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = "transparent"; }}
                        >
                          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                            <span style={{ color: isSelected ? "#00c6ff" : "#e2e8f0", fontSize: "13px", fontWeight: isSelected ? "700" : "500", fontFamily: "var(--f-mono)" }}>{tool.name}</span>
                            {tool.description && <span style={{ color: "#718096", fontSize: "11px" }}>{tool.description.slice(0, 60)}{tool.description.length > 60 ? "..." : ""}</span>}
                          </div>
                          {isSelected && <span style={{ color: "#00c6ff", fontSize: "16px" }}>✓</span>}
                        </div>
                    );
                  })}
                </div>
              </div>
          )}

          {/* 구분선 */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "16px 0" }}>
            <div style={{ flex: 1, height: "1px", backgroundColor: "#2d3748" }} />
            <span style={{ color: "#4a5568", fontSize: "11px", whiteSpace: "nowrap" }}>{t.orDirectInput}</span>
            <div style={{ flex: 1, height: "1px", backgroundColor: "#2d3748" }} />
          </div>

          {/* Step 3: 직접 입력 */}
          <div className="form-group" style={{ marginBottom: "16px" }}>
            <label style={{ fontSize: "12px", fontWeight: "700", color: "#718096", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: "8px" }}>{t.toolNameLabel}</label>
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                  type="text"
                  className="custom-input"
                  placeholder={t.toolNamePlaceholder}
                  value={mcp.smitheryToolName}
                  onChange={(e) => { mcp.setSmitheryToolName(e.target.value); if (!mcp.serverToolList.length) { mcp.setSmitheryToolSpec(null); mcp.setSmitheryFetchError(""); } }}
                  onKeyDown={(e) => { if (e.key === "Enter") mcp.handleFetchSmitherySpec(mcp.smitheryToolName); }}
                  style={{ flex: 1 }}
              />
              <button
                  className="btn-klever-sync"
                  style={{ padding: "0 20px", borderRadius: "10px", whiteSpace: "nowrap", minWidth: "90px" }}
                  onClick={() => mcp.handleFetchSmitherySpec(mcp.smitheryToolName)}
                  disabled={mcp.isFetchingSpec || !mcp.smitheryToolName.trim()}
              >
                {mcp.isFetchingSpec ? <Spinner /> : t.fetchSpecBtn}
              </button>
            </div>
          </div>

          {/* 에러 메시지 */}
          {mcp.smitheryFetchError && (
              <div style={{ padding: "10px 14px", borderRadius: "10px", marginBottom: "16px", backgroundColor: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.3)", color: "#fca5a5", fontSize: "12px", lineHeight: "1.5" }}>
                ⚠️ {mcp.smitheryFetchError}
              </div>
          )}

          {/* 스펙 프리뷰 */}
          {mcp.smitheryToolSpec && (
              <div style={{ border: "1px solid rgba(0,198,255,0.3)", borderRadius: "14px", padding: "20px", backgroundColor: "rgba(0,198,255,0.04)", marginBottom: "24px" }}>
                {mcp.smitheryToolSpec.description && (
                    <p style={{ fontSize: "12px", color: "#a0aec0", margin: "0 0 16px 0", lineHeight: "1.6", padding: "10px 12px", backgroundColor: "rgba(0,0,0,0.2)", borderRadius: "8px" }}>
                      {mcp.smitheryToolSpec.description}
                    </p>
                )}
                <label style={{ fontSize: "11px", fontWeight: "700", color: "#718096", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "10px" }}>
                  Parameters ({mcp.smitheryToolSpec.parameters.length})
                </label>
                {mcp.smitheryToolSpec.parameters.length === 0 ? (
                    <div style={{ padding: "14px", textAlign: "center", color: "#4a5568", fontSize: "12px", border: "1px dashed #2d3748", borderRadius: "8px" }}>{t.noArgsToolMsg}</div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "180px", overflowY: "auto", paddingRight: "2px" }}>
                      {mcp.smitheryToolSpec.parameters.map((param, idx) => (
                          <div key={idx} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                            <input type="text" className="custom-input" placeholder="Key" style={{ flex: 1, padding: "7px 10px", fontSize: "12px" }} value={param.key}
                                   onChange={(e) => { const updated = [...mcp.smitheryToolSpec.parameters]; updated[idx] = { ...updated[idx], key: e.target.value }; mcp.setSmitheryToolSpec({ ...mcp.smitheryToolSpec, parameters: updated }); }} />
                            <select className="custom-select" style={{ width: "90px", padding: "7px 8px", fontSize: "11px" }} value={param.type}
                                    onChange={(e) => { const updated = [...mcp.smitheryToolSpec.parameters]; updated[idx] = { ...updated[idx], type: e.target.value }; mcp.setSmitheryToolSpec({ ...mcp.smitheryToolSpec, parameters: updated }); }}>
                              <option>String</option><option>Number</option><option>Boolean</option>
                            </select>
                            <input type="text" className="custom-input" placeholder="설명" style={{ flex: 1.5, padding: "7px 10px", fontSize: "12px" }} value={param.desc}
                                   onChange={(e) => { const updated = [...mcp.smitheryToolSpec.parameters]; updated[idx] = { ...updated[idx], desc: e.target.value }; mcp.setSmitheryToolSpec({ ...mcp.smitheryToolSpec, parameters: updated }); }} />
                            <button type="button" onClick={() => { const updated = mcp.smitheryToolSpec.parameters.filter((_, i) => i !== idx); mcp.setSmitheryToolSpec({ ...mcp.smitheryToolSpec, parameters: updated }); }}
                                    style={{ background: "none", border: "none", color: "#e53e3e", cursor: "pointer", padding: "4px", flexShrink: 0 }}>✕</button>
                          </div>
                      ))}
                    </div>
                )}
                <button
                    onClick={() => mcp.setSmitheryToolSpec({ ...mcp.smitheryToolSpec, parameters: [...mcp.smitheryToolSpec.parameters, { key: "", type: "String", desc: "" }] })}
                    style={{ marginTop: "10px", background: "transparent", color: "#00c6ff", border: "1px solid rgba(0,198,255,0.3)", padding: "6px 12px", borderRadius: "6px", fontSize: "11px", cursor: "pointer", width: "100%", fontWeight: "600" }}>
                  + 파라미터 직접 추가
                </button>
              </div>
          )}

          {/* 버튼 */}
          <div className="modal-buttons" style={{ gap: "12px", display: "flex" }}>
            <button className="btn-outline" style={{ flex: 1 }} onClick={mcp.closeSmitheryModal}>{t.cancelBtn}</button>
            <button className="btn-primary"
                    style={{ flex: 1.5, opacity: mcp.smitheryToolName.trim() ? 1 : 0.4, cursor: mcp.smitheryToolName.trim() ? "pointer" : "not-allowed" }}
                    disabled={!mcp.smitheryToolName.trim()}
                    onClick={mcp.handleAddSmitheryItem}>
              {mcp.targetItemId ? t.editConfirmBtn : t.addConfirmBtn}
            </button>
          </div>
        </div>
      </div>
  );
}