import React, { useState, useEffect, useRef } from "react";
import { Config, PixelStreaming } from "@epicgames-ps/lib-pixelstreamingfrontend-ue5.4";
import "../css/FloatingWidget.css";

interface BasicChatbotProps {
  unrealurl: string;
  layout: string;
  autoOff: number; // 초 
  avatarnum : number
}

export function BasicChatbot({ unrealurl, layout, autoOff, avatarnum }: BasicChatbotProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [size, setSize] = useState({width : 360, height : 300}); // 초기 사이즈
    const [inputText, setInputText] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isMicOn, setIsMicOn] = useState(false);

    const videoWrapperRef = useRef<HTMLDivElement | null>(null);
    const psInstanceRef = useRef<PixelStreaming | null>(null);


    const widgetRef = useRef<HTMLDivElement | null>(null);

   const handleResize = (mouseDownEvent: React.MouseEvent) => {
        mouseDownEvent.preventDefault();
        
        const onMouseMove = (mouseMoveEvent: MouseEvent) => {
            setSize((prev) => {
                const isLeft = layout.includes("left");
                const isTop = layout.includes("top");

                // 핸들이 좌측에 있으면(isLeft=false인 layout), 오른쪽으로 갈수록 커짐 (+)
                // 핸들이 우측에 있으면(isLeft=true인 layout), 왼쪽으로 갈수록 커짐 (-)
                // 핸들이 상단에 있으면(isTop=false인 layout), 아래로 갈수록 커짐 (+)
                // 핸들이 하단에 있으면(isTop=true인 layout), 위로 갈수록 커짐 (-)
                
                const deltaX = isLeft ? -mouseMoveEvent.movementX : mouseMoveEvent.movementX;
                const deltaY = isTop ? -mouseMoveEvent.movementY : mouseMoveEvent.movementY;

                // 예: bottom-right 위젯은 핸들이 좌측상단에 있음 -> 마우스가 왼쪽/위로 갈수록 커져야 함
                // movementX가 음수(왼쪽)일 때 deltaX가 양수가 되어야 하므로 위 로직이 맞습니다.
                const adjustX = layout === "bottom-right" || layout === "center" || layout === "top-right" ? -mouseMoveEvent.movementX : mouseMoveEvent.movementX;
                const adjustY = layout === "bottom-right" || layout === "center" || layout === "bottom-left" ? -mouseMoveEvent.movementY : mouseMoveEvent.movementY;

                return {
                    width: Math.min(Math.max(prev.width + adjustX, 300), 800),
                    height: Math.min(Math.max(prev.height + adjustY, 250), 600)
                };
            });
        };
        const onMouseUp = () => {
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);
        };

        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
    };

   // 🚀 레이아웃별 최적화된 SVG 핸들 컴포넌트
   const ResizeHandle = () => {
        const isLeft = layout.includes("left");
        const isTop = layout.includes("top");

        const style: React.CSSProperties = {
            position: 'absolute',
            [isLeft ? 'right' : 'left']: '2px', // 살짝 더 구석에 밀착
            [isTop ? 'bottom' : 'top']: '2px',
            cursor: isLeft 
                ? (isTop ? 'sw-resize' : 'nw-resize') 
                : (isTop ? 'se-resize' : 'nw-resize'),
            zIndex: 10005,
            padding: '4px'
        };

        // 레이아웃별 둥근 꺽쇠 Path (M: 시작점, Q: 곡선 정점 및 끝점)
        let pathData = "M16,4 L8,4 Q4,4 4,8 L4,16"; // 기본: 좌상단 ㄴ (둥근 버전)
        
        if (layout === "bottom-right" || layout === "center") {
            pathData = "M16,4 L8,4 Q4,4 4,8 L4,16"; // 좌상단 ㄴ
        } else if (layout === "bottom-left") {
            pathData = "M8,4 L16,4 Q20,4 20,8 L20,16"; // 우상단 ㄱ
        } else if (layout === "top-right") {
            pathData = "M16,20 L8,20 Q4,20 4,16 L4,8"; // 좌하단 ㄴ 뒤집힌 모양
        } else if (layout === "top-left") {
            pathData = "M8,20 L16,20 Q20,20 20,16 L20,8"; // 우하단 ┘
        }

        return (
            <div className="fw-resize-handle" style={style} onMouseDown={handleResize}>
                <svg 
                    width="22" 
                    height="22" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="white" 
                    strokeWidth="2.5" // 너무 두꺼우면 곡선이 뭉개지니 살짝 조절
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                >
                    <path d={pathData}></path>
                </svg>
            </div>
        );
    };
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
                    const matchmakerUrl = unrealurl.replace("https://", "http://");
                    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
                    const res = await fetch(`${matchmakerUrl}/signallingserver`);
                    const data = await res.json();
                    const ssUrl = `${protocol}://${data.signallingServer}`;
                    const config = new Config({
                                        initialSettings: {
                                            ss: ssUrl,
                                            AutoPlayVideo: true,
                                            AutoConnect: true,
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
                            "Category": "SystemSetting",
                            "Type":"WebConnected",
                            "Width": "1280",
                            "Height":"720"
                        });
                        psInstance.emitUIInteraction({
                            "Category": "AvatarSetting",
                            "Type": "AvatarNum",
                            "Value":"1"
                        });
                        psInstance.emitUIInteraction({
                            "Category": "PageSetting",
                            "Type": "WindowSize"
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

    // 🚀 [추가] avatarnum이 변경될 때마다 실행되는 감지기
    useEffect(() => {
        // PixelStreaming이 연결되어 있고, 위젯이 열려있을 때만 값 전송
        if (psInstanceRef.current && isOpen) {
            
            psInstanceRef.current.emitUIInteraction({
                "Category": "ConversationSetting",
                "Type": "StartConversation"   
            });
             psInstanceRef.current.emitUIInteraction({
                Category: "AvatarSetting",
                Type: "AvatarNum",
                Value: String(avatarnum)
            });
            console.log(`아바타 변경 신호 전송됨: ${avatarnum}`); // 확인용 로그 (나중에 지우셔도 됩니다)
        }
    }, [avatarnum, isOpen]);

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
    // 🚀 레이아웃에 따라 위치가 바뀌는 닫기 버튼
    const CloseButton = () => {
        const isBottomLeft = layout === "bottom-left";
        
        const style: React.CSSProperties = {
            position: 'absolute',
            top: '12px',
            // 좌측 하단 레이아웃일 때만 좌측 상단(left), 나머지는 우측 상단(right)
            [isBottomLeft ? 'left' : 'right']: '12px', 
            zIndex: 10006,
            cursor: 'pointer',
            background: 'rgba(0,0,0,0.3)',
            borderRadius: '50%',
            width: '30px',
            height: '30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: 'none',
            transition: 'all 0.2s ease',
            backdropFilter: 'blur(4px)'
        };

        return (
            <button 
                style={style} 
                onClick={(e) => {
                    e.stopPropagation();
                    closeWidget();
                }}
                className="fw-inner-close-btn"
            >
                <svg viewBox="0 0 24 24" width="20" height="20" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        );
    };
    return (
        <>
        <div id="fw-app-root">
            <div className={`fw-widget ${layout} ${isOpen ? "open" : "closed"}`}
            style={{ width: `${size.width}px`, height: `${size.height}px` }}
            >
                {isLoading && (
                    <div className="fw-loading-overlay">
                        <div className="loading-spinner" />
                        <span>연결 중...</span>
                    </div>
                )}

                <div ref={videoWrapperRef} className="fw-video-wrapper" />
                {isOpen && <CloseButton />}
                <ResizeHandle />
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

            {!isOpen && (
                <button type="button" className={`fw-toggle ${layout}`} onClick={openWidget}>
                    <svg viewBox="0 0 24 24" width="30" height="30" fill="white">
                        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
                    </svg>
                </button>
            )}

            </div>
        </>
    );
};

