import React, { useState, useEffect, useRef } from "react";
import { Config, PixelStreaming } from "@epicgames-ps/lib-pixelstreamingfrontend-ue5.4";
import "./FloatingWidget.css";

const FloatingWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [inputText, setInputText] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isMicOn, setIsMicOn] = useState(false);

    const videoWrapperRef = useRef(null);
    const psInstanceRef = useRef(null);

    // PixelStreaming 연결 종료
    const disconnectStreaming = () => {
        if (psInstanceRef.current) {
            psInstanceRef.current.disconnect();
            psInstanceRef.current = null;
        }
        if (videoWrapperRef.current) {
            videoWrapperRef.current.innerHTML = "";
        }
        setIsLoading(false);
    };

    const openWidget = () => {
        setIsLoading(true);
        setIsOpen(true);
    };

    const closeWidget = () => {
        disconnectStreaming();
        setIsMicOn(false);
        setIsOpen(false);
    };

    // 토글 버튼 클릭 시 열기/닫기
    const toggleWidget = () => {
        if (isOpen) closeWidget();
        else openWidget();
    };

    // PixelStreaming 연결
    useEffect(() => {
        if (isOpen && !psInstanceRef.current && videoWrapperRef.current) {
            const connect = async () => {
                try {
                    const matchmakerUrl = import.meta.env.VITE_MATCHMAKER.replace("https://", "http://");
                    const res = await fetch(`${matchmakerUrl}/signallingserver`);
                    const data = await res.json();

                    const config = new Config({
                                        initialSettings: {
                                            ss: `wss://${data.signallingServer}`,
                                            AutoPlayVideo: true,
                                            AutoConnect: true,
                                            //StartVideoMuted: true,
                                            HoveringMouse: true,
                                            KeyboardInput:false,
                                            MouseInput:false,
                                        },
                                    });

                    const psInstance = new PixelStreaming(config);
                    psInstanceRef.current = psInstance;

                    psInstance.addEventListener("videoInitialized", () => {
                        if (videoWrapperRef.current) {
                            videoWrapperRef.current.innerHTML = "";
                            videoWrapperRef.current.appendChild(psInstance.videoElementParent);
                            setIsLoading(false);
                        }

                        psInstance.emitUIInteraction({
                            Category: "Page",
                            Type: "ChatbotPage"
                        });
                    });

                } catch (err) {
                    console.error("Matchmaker connection failed:", err);
                    setIsLoading(false);
                }
            };

            connect();

            return () => {
                disconnectStreaming();
            };
        }
    }, [isOpen]);

    // 메시지 전송
    const sendMessage = () => {
        const message = inputText.trim();
        if (!message || !psInstanceRef.current) return;

        psInstanceRef.current.emitUIInteraction({
            Category: "Chat",
            Type: "ChatCommand",
            Value: encodeURIComponent(message),
        });

        setInputText("");
    };

    // 엔터 입력 처리
    const handleKeyEvent = (e) => {
        if (e.key === "Enter") sendMessage();
    };

    // 마이크 토글
    const toggleMic = () => {
        setIsMicOn((v) => !v);
    };
const handleInputFocus = () => {
        if (psInstanceRef.current) {
            psInstanceRef.current.emitUIInteraction({
                Category: "Chat",
                Type: "Typing"
            });
        }
    };
    return (
        <>
        <div id="fw-app-root">
            <div className={`fw-widget ${isOpen ? "open" : "closed"}`}>
                {isLoading && (
                    <div className="fw-loading-overlay">
                        <div className="loading-spinner" />
                        <span>연결 중...</span>
                    </div>
                )}

                <div ref={videoWrapperRef} className="fw-video-wrapper" />

                <div className="fw-input-bar">
                    <input
                        type="text"
                        className="fw-input"
                        value={inputText}
                        onFocus={handleInputFocus}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={handleKeyEvent}
                        placeholder="메시지 입력..."
                        disabled={isLoading}
                    />

                    <button
                        type="button"
                        className={`mic-btn ${isMicOn ? "active" : ""}`}
                        onClick={toggleMic}
                        disabled={isLoading}
                    >
                        <svg viewBox="0 0 24 24" fill="white" style={{ width: "20px" }}>
                            <path d="M12 14a3 3 0 003-3V7a3 3 0 10-6 0v4a3 3 0 003 3zm5-3a1 1 0 10-2 0 3 3 0 11-6 0 1 1 0 10-2 0 5 5 0 004 4.9V19H9a1 1 0 100 2h6a1 1 0 100-2h-2v-2.1A5 5 0 0017 11z" />
                        </svg>
                    </button>

                    <button onClick={sendMessage} className="send-btn">
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="white" 
    strokeWidth="3"         /* 선 두께: 숫자가 클수록 두꺼워집니다 */
    strokeLinecap="round" 
    strokeLinejoin="round" 
    width="18" 
    height="18"
  >
    {/* 위로 향하는 직선 화살표 */}
    <line x1="12" y1="19" x2="12" y2="5"></line>
    <polyline points="5 12 12 5 19 12"></polyline>
  </svg>
</button>
                </div>
            </div>

            {/* 토글 버튼 하나로 열기/닫기 + X 표시 */}
            <button type="button" className="fw-toggle" onClick={toggleWidget}>
                {isOpen ? (
                    <svg viewBox="0 0 24 24" width="32" height="32">
                        <line x1="4" y1="4" x2="20" y2="20" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                        <line x1="4" y1="20" x2="20" y2="4" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                    </svg>
                ) : (
                    <svg viewBox="0 0 24 24" width="30" height="30" fill="white">
                        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
                    </svg>
                )}
            </button>

            </div>
        </>
    );
};

export default FloatingWidget;