import React from "react";

export const AddDirectoryModal = ({ isOpen, mcp }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-box" style={{ maxWidth: "420px", textAlign: "left", padding: "28px" }}>
                <h2 className="modal-title" style={{ marginBottom: "8px", fontSize: "20px" }}>
                    디렉토리 생성
                </h2>
                <p className="modal-desc" style={{ marginBottom: "24px" }}>
                    MCP 도구들을 분류할 새로운 그룹을 만듭니다.
                </p>

                <div className="form-group" style={{ marginBottom: "16px" }}>
                    <label style={{ fontWeight: "600", marginBottom: "8px", display: "block" }}>
                        디렉토리명
                    </label>
                    <input
                        type="text"
                        className="custom-input"
                        value={mcp.newDirName}
                        onChange={(e) => mcp.setNewDirName(e.target.value)}
                        placeholder="예: 외부 연동 API"
                        autoFocus
                        onKeyDown={(e) => {
                            if (e.key === "Enter") mcp.handleAddDirectory();
                        }}
                    />
                </div>

                <div className="form-group" style={{ marginBottom: "32px" }}>
                    <label style={{ fontWeight: "600", marginBottom: "8px", display: "block" }}>
                        설명 (선택)
                    </label>
                    <textarea
                        className="custom-input"
                        style={{ height: "80px", resize: "none" }}
                        value={mcp.newDirDesc}
                        onChange={(e) => mcp.setNewDirDesc(e.target.value)}
                        placeholder="디렉토리에 대한 설명을 입력하세요."
                    />
                </div>

                <div className="modal-buttons" style={{ gap: "12px", display: "flex" }}>
                    <button
                        className="btn-outline"
                        style={{ flex: 1 }}
                        onClick={() => {
                            mcp.setIsAddDirModalOpen(false);
                            mcp.setNewDirName("");
                            mcp.setNewDirDesc("");
                        }}
                    >
                        취소
                    </button>
                    <button
                        className="btn-primary"
                        style={{ flex: 1.5 }}
                        onClick={mcp.handleAddDirectory}
                    >
                        추가하기
                    </button>
                </div>
            </div>
        </div>
    );
};