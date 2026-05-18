export function ConfirmModals({ agent, onConfirmSave, t }) {
  return (
      <>
        {/* 저장 확인 */}
        {agent.isModalOpen && (
            <div className="modal-overlay"><div className="modal-box">
              <h2 className="modal-title">{t.saveModalTitle}</h2>
              <p className="modal-desc">{t.saveModalDesc.split("\n").map((l,i)=><span key={i}>{l}<br/></span>)}</p>
              <div className="modal-buttons">
                <button className="btn-outline" onClick={() => agent.setIsModalOpen(false)}>{t.cancelBtn}</button>
                <button className="btn-primary" onClick={onConfirmSave}>{t.applyBtn}</button>
              </div>
            </div></div>
        )}

        {/* 나가기 확인 */}
        {agent.isExitModalOpen && (
            <div className="modal-overlay"><div className="modal-box">
              <div className="modal-logo"><span>KLEVER ONE</span></div>
              <p className="modal-desc">{t.exitModalDesc.split("\n").map((l,i)=><span key={i}>{l}<br/></span>)}</p>
              <div className="modal-buttons">
                <button className="btn-outline" onClick={() => agent.setIsExitModalOpen(false)}>{t.cancelBtn}</button>
                <button className="btn-danger" onClick={() => { agent.setIsExitModalOpen(false); window.open("https://www.klever-one.com/", "_blank"); }}>{t.exitBtn}</button>
              </div>
            </div></div>
        )}

        {/* {t.newKeyModalTitle} */}
        {agent.isNewKeyModalOpen && (
            <div className="modal-overlay"><div className="modal-box">
              <h2 className="modal-title">{t.newKeyModalTitle}</h2>
              <p className="modal-desc" style={{ marginBottom: "16px" }}>{t.newKeyModalDesc}</p>
              <input
                  type="text"
                  className="custom-input"
                  style={{ marginBottom: "24px", textAlign: "center" }}
                  value={agent.newKeyNameInput}
                  onChange={(e) => agent.setNewKeyNameInput(e.target.value)}
                  placeholder={t.newKeyPlaceholder}
                  autoFocus
                  onKeyDown={(e) => { if (e.key === "Enter") agent.confirmGenerateNewKey(); }}
              />
              <div className="modal-buttons">
                <button className="btn-outline" onClick={() => agent.setIsNewKeyModalOpen(false)}>{t.cancelBtn}</button>
                <button className="btn-primary" onClick={agent.confirmGenerateNewKey}>{t.issueBtn}</button>
              </div>
            </div></div>
        )}

        {/* {t.alertTitle} */}
        {agent.alertMessage && (
            <div className="modal-overlay"><div className="modal-box">
              <h2 className="modal-title">{t.alertTitle}</h2>
              <p className="modal-desc" style={{ marginBottom: "24px" }}>{agent.alertMessage}</p>
              <div className="modal-buttons">
                <button className="btn-primary" onClick={() => agent.setAlertMessage("")}>{t.confirmBtn}</button>
              </div>
            </div></div>
        )}

        {/* {t.deleteKeyTitle} 확인 */}
        {agent.deleteTargetId && (
            <div className="modal-overlay"><div className="modal-box">
              <h2 className="modal-title">{t.deleteKeyTitle}</h2>
              <p className="modal-desc" style={{ marginBottom: "24px" }}>{t.deleteKeyDesc.split("\n").map((l,i)=><span key={i}>{l}<br/></span>)}</p>
              <div className="modal-buttons">
                <button className="btn-outline" onClick={() => agent.setDeleteTargetId(null)}>{t.cancelBtn}</button>
                <button className="btn-danger" onClick={agent.confirmDeleteKey}>{t.deleteBtn}</button>
              </div>
            </div></div>
        )}

        {/* {t.reissueKeyTitle} 확인 */}
        {agent.reissueTargetId && (
            <div className="modal-overlay"><div className="modal-box">
              <h2 className="modal-title">{t.reissueKeyTitle}</h2>
              <p className="modal-desc" style={{ marginBottom: "24px" }}>{t.reissueKeyDesc.split("\n").map((l,i)=><span key={i}>{l}<br/></span>)}</p>
              <div className="modal-buttons">
                <button className="btn-outline" onClick={() => agent.setReissueTargetId(null)}>{t.cancelBtn}</button>
                <button className="btn-primary" onClick={agent.confirmReissueKey}>{t.reissueConfirmBtn}</button>
              </div>
            </div></div>
        )}
      </>
  );
}