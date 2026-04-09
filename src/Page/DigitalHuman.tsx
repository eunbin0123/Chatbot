"use client";

import React, { useState, useEffect, useRef } from "react";
import "../css/DigitalHuman.css";

declare global {
  interface Window {
    KleverOneSdk: any;
  }
}

interface DigitalHumanProps {
  apiKey: string;
  layout: string;
  autoOff: number; // 초 단위
}

export function DigitalHuman({ apiKey, layout, autoOff }: DigitalHumanProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSdkLoaded, setIsSdkLoaded] = useState(false);
  const [inputText, setInputText] = useState("");

  const containerRef = useRef<HTMLDivElement>(null);
  const clientRef = useRef<any>(null);
  const autoOffTimerRef = useRef<any>(null);

  // ================== SDK 로딩 ==================
  useEffect(() => {
    if (!document.getElementById("klever-sdk")) {
      const script = document.createElement("script");
      script.id = "klever-sdk";
      script.src =
        "https://unpkg.com/@klever-one/web-sdk@0.1.0-beta.19/dist/core/klever-one-core-v0.1.0-beta.19.umd.js";
      script.async = true;
      script.onload = () => setIsSdkLoaded(true);
      document.body.appendChild(script);
    } else {
      setIsSdkLoaded(true);
    }
  }, []);

  // ================== 자동 꺼짐 ==================
  const resetAutoOffTimer = () => {
    if (!autoOff) return;

    if (autoOffTimerRef.current) {
      clearTimeout(autoOffTimerRef.current);
    }

    autoOffTimerRef.current = setTimeout(() => {
      closeWidget();
    }, autoOff * 1000);
  };

  // ================== 열기 ==================
  const openWidget = () => {
    setIsLoading(true);
    setIsOpen(true);
    resetAutoOffTimer();
  };

  // ================== 닫기 ==================
  const closeWidget = () => {
    if (clientRef.current) {
      clientRef.current.disconnect();
      clientRef.current = null;
    }

    if (autoOffTimerRef.current) {
      clearTimeout(autoOffTimerRef.current);
    }

    setIsOpen(false);
    setIsLoading(false);
  };

  const toggleWidget = () => {
    isOpen ? closeWidget() : openWidget();
  };

  // ================== SDK 연결 ==================
  useEffect(() => {
    if (isOpen && isSdkLoaded && containerRef.current && !clientRef.current) {
      const { KleverOneClient } = window.KleverOneSdk;

      const client = new KleverOneClient({
        apiKey,
        container: containerRef.current,
        callbacks: {
          onReady: () => {
            setIsLoading(false);

            setTimeout(() => {
              try {
                //client.sendText("안녕하세요");
                client.sendZoomIn();
                client.speak("안녕하세요! 우리 동네 복지 전문가, 노원복지샘의 디지털 가이드입니다. 오늘 어떤 도움이 필요해서 오셨나요? 저희 노원복지샘에서는 주민 여러분을 위해 크게 세 가지 서비스를 정성껏 준비하고 있어요. 첫째, 나에게 딱 맞는 복지 혜택을 찾아드리는 '맞춤 복지 검색', 둘째, 우리 동네 복지관의 유익한 프로그램 정보를 알려드리는 '복지 시설 안내', 셋째, 어려운 상황을 함께 고민하고 해결해 드리는 **'복지 상담 서비스'**입니다. 이 중에서 사용자님께 가장 필요한 서비스는 무엇인가요? 화면의 버튼을 누르거나 저에게 말씀해 주시면 바로 안내를 시작할게요");
              } catch (e) {
                console.error("초기 메시지 실패");
              }
            }, 200);
          },
          onError: (err: any) => {
            console.error("에러:", err);
            setIsLoading(false);
          },
        },
      });

      client.connect();
      clientRef.current = client;

      return () => {
        if (clientRef.current) {
          clientRef.current.disconnect();
          clientRef.current = null;
        }
      };
    }
  }, [isOpen, isSdkLoaded, apiKey]);

  // ================== 메시지 전송 ==================
  const sendMessage = () => {
    if (!inputText.trim() || !clientRef.current) return;
    clientRef.current.sendText(inputText);
    setInputText("");
    resetAutoOffTimer();
  };

  return (
    <>
      {/* 위젯 */}
      <div
        className={`dh-widget ${layout} ${isOpen ? "open" : "closed"}`}
        onMouseDown={resetAutoOffTimer}
        onTouchStart={resetAutoOffTimer}
      >
        {isLoading && (
          <div className="dh-loading-overlay">
            <div className="dh-spinner" />
            <span>연결 중...</span>
          </div>
        )}

        <div ref={containerRef} className="dh-container" />

        <div className="dh-input-bar">
          <input
            type="text"
            placeholder="메시지 입력..."
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value);
              resetAutoOffTimer();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") sendMessage();
              resetAutoOffTimer();
            }}
          />
          <button onClick={sendMessage} className="dh-send-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" width="18" height="18">
              <line x1="12" y1="19" x2="12" y2="5"></line>
              <polyline points="5 12 12 5 19 12"></polyline>
            </svg>
          </button>
        </div>
      </div>

      {/* 토글 버튼 */}
      <button className={`dh-toggle-btn ${layout}`} onClick={toggleWidget}>
        {isOpen ? (
          <svg viewBox="0 0 24 24" width="32" height="32">
            <line x1="4" y1="4" x2="20" y2="20" stroke="white" strokeWidth="2.5" />
            <line x1="4" y1="20" x2="20" y2="4" stroke="white" strokeWidth="2.5" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="28" height="28" fill="white">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
          </svg>
        )}
      </button>
    </>
  );
}