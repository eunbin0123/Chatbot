const BG_MAP = {
  yuri:  "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
  chanu: "linear-gradient(135deg, #2b5876 0%, #4e4376 100%)",
  sujin: "linear-gradient(135deg, #3a1c71 0%, #d76d77 50%, #ffaf7b 100%)",
};
const NUM_MAP = { yuri: 2, chanu: 1, sujin: 4 };

export function AgentTab({ agent, i18n, uiLang }) {
  const t = i18n[uiLang] || i18n["ko"];
  const digitalHumans = (t.characters || i18n["ko"].characters).map((c) => ({
    ...c,
    bg: BG_MAP[c.id],
    num: NUM_MAP[c.id],
  }));
  return (
      <div className="tab-pane fade-in">

        {/* API 키 관리 */}
        <div className="setting-card">
          <div className="card-header-flex" style={{ marginBottom: "16px" }}>
            <div>
              <h3 className="card-title">{i18n[uiLang]?.apiKeyTitle}</h3>
              <p className="card-desc" style={{ marginBottom: 0 }}>{i18n[uiLang]?.apiKeyDesc}</p>
            </div>
            <button className="btn-klever-sync" onClick={() => agent.handleGenerateNewKey(`${i18n[uiLang]?.newKeyDefaultName || "신규 에이전트 키"} #${agent.apiKeys.length + 1}`)}>
              {i18n[uiLang]?.newKeyBtn}
            </button>
          </div>
          <div className="api-key-list">
            {agent.apiKeys.map((keyObj) => (
                <div key={keyObj.id} className="api-key-item">
                  <div className="api-key-info">
                    <div className="api-key-name-wrap">
                      <span className="api-key-name">{keyObj.name}</span>
                      <span className="api-key-date">{keyObj.date}</span>
                    </div>
                    <input type="text" className="api-key-value" value={keyObj.value} readOnly />
                  </div>
                  <div className="api-key-actions">
                    <button className="btn-icon" onClick={() => agent.handleCopySpecificKey(keyObj.value)}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                      </svg>
                    </button>
                    <button className="btn-text-reissue" onClick={() => agent.handleReissueKey(keyObj.id)}>재발급</button>
                    <button className="btn-icon danger" onClick={() => agent.handleDeleteKey(keyObj.id)}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                      </svg>
                    </button>
                  </div>
                </div>
            ))}
          </div>
        </div>

        {/* 디지털 휴먼 모델 선택 */}
        <div className="setting-card" style={{ padding: "24px 28px 32px" }}>
          <div className="card-header-flex" style={{ marginBottom: "16px" }}>
            <div>
              <h3 className="card-title">{i18n[uiLang]?.modelTitle}</h3>
              <p className="card-desc" style={{ marginBottom: 0 }}>{i18n[uiLang]?.modelDesc}</p>
            </div>
            <button className="btn-klever-sync" onClick={() => window.open("https://www.klever-one.com/studio", "_blank")}>
              {i18n[uiLang]?.studioBtn}
            </button>
          </div>
          <div className="agent-select-box">
            <label>{i18n[uiLang]?.agentSelectLabel}</label>
            <select
                className="custom-select"
                value={agent.selectedAgentId}
                onChange={(e) => agent.setSelectedAgentId(Number(e.target.value))}
            >
              {agent.apiKeys.map((k) => (
                  <option key={k.id} value={k.id}>{k.name} ({k.value.substring(0, 16)}...)</option>
              ))}
            </select>
          </div>
          <div className="character-grid">
            {digitalHumans.map((human) => (
                <div
                    key={human.id}
                    className={`character-card ${agent.uiCharacter === human.id ? "selected" : ""}`}
                    onClick={() => agent.setUiCharacter(human.id)}
                >
                  <div className="character-bg" style={{ background: human.bg }} />
                  <div className="character-overlay">
                    <div className="character-text">
                      <h4>{human.name}</h4>
                      <p>{human.desc}</p>
                    </div>
                    <button className="btn-character">
                      {agent.uiCharacter === human.id ? i18n[uiLang]?.selectedBtn : i18n[uiLang]?.selectBtn}
                    </button>
                  </div>
                </div>
            ))}
          </div>
        </div>
      </div>
  );
}