export function WidgetTab({ i18n, uiLang, layout, setLayout, autoOff, setAutoOff, autoOffSec, setAutoOffSec, codeTab, setCodeTab, getEmbedCode, handleCopyEmbedCode }) {
  const t = i18n[uiLang] || i18n["ko"];
  const layoutOptions = t.layoutOptions || i18n["ko"].layoutOptions;

  return (
      <div className="tab-pane fade-in">

        {/* 레이아웃 */}
        <div className="setting-card">
          <h3 className="card-title">{t.layoutTitle}</h3>
          <p className="card-desc">{t.layoutDesc}</p>
          <div className="layout-selector">
            {layoutOptions.map((option) => (
                <div
                    key={option.id}
                    className={`layout-item ${layout === option.id ? "selected" : ""}`}
                    onClick={() => setLayout(option.id)}
                >
                  <div className="layout-preview">
                    <div className="browser-mockup">
                      <div className={`widget-box ${option.boxClass}`} />
                    </div>
                  </div>
                  <span>{option.label}</span>
                </div>
            ))}
          </div>
        </div>

        {/* 타이머 */}
        <div className="setting-card">
          <h3 className="card-title">{t.timeTitle}</h3>
          <div className="form-group mt-2" style={{ maxWidth: "350px" }}>
            <label>{t.timeDesc}</label>
            <div style={{ display: "flex", gap: "16px", width: "100%" }} className="mt-2">
              <div className="input-with-unit" style={{ flex: 1 }}>
                <input type="number" className="custom-input" value={autoOff} onChange={(e) => setAutoOff(e.target.value)} min="0" />
                <span className="unit">{t.minLabel}</span>
              </div>
              <div className="input-with-unit" style={{ flex: 1 }}>
                <input type="number" className="custom-input" value={autoOffSec} onChange={(e) => setAutoOffSec(e.target.value)} min="0" max="59" />
                <span className="unit">{t.secLabel}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 임베드 코드 */}
        <div className="setting-card">
          <h3 className="card-title">{t.codeTitle}</h3>
          <p className="card-desc">{t.codeDesc}</p>
          <div className="code-tabs">
            <button className={`code-tab-btn ${codeTab === "vanilla" ? "active" : ""}`} onClick={() => setCodeTab("vanilla")}>HTML (JS/TS)</button>
            <button className={`code-tab-btn ${codeTab === "react" ? "active" : ""}`} onClick={() => setCodeTab("react")}>React (JSX/TSX)</button>
          </div>
          <div className="code-container" style={{ marginTop: 0 }}>
            <button className="btn-copy-code" onClick={handleCopyEmbedCode}>{t.copyBtn}</button>
            <pre>{getEmbedCode()}</pre>
          </div>
        </div>
      </div>
  );
}