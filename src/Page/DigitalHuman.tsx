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
  layout: string; // ✅ 사용됨
}

export function DigitalHuman({ apiKey, layout }: DigitalHumanProps) { // ⭐ layout 받기
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSdkLoaded, setIsSdkLoaded] = useState(false);
  const [inputText, setInputText] = useState("");

  const containerRef = useRef<HTMLDivElement>(null);
  const clientRef = useRef<any>(null);

  // SDK 로딩
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

  const openWidget = () => {
    setIsLoading(true);
    setIsOpen(true);
  };

  const closeWidget = () => {
    if (clientRef.current) {
      clientRef.current.disconnect();
      clientRef.current = null;
    }
    setIsOpen(false);
    setIsLoading(false);
  };

  const toggleWidget = () => {
    isOpen ? closeWidget() : openWidget();
  };

  // SDK 연결
  useEffect(() => {
    if (isOpen && isSdkLoaded && containerRef.current && !clientRef.current) {
      const { KleverOneClient } = window.KleverOneSdk;

      const client = new KleverOneClient({
        apiKey,
        container: containerRef.current,
        callbacks: {
          onReady: () => {
            console.log("Klever One 준비 완료");
            setIsLoading(false);

            setTimeout(() => {
              try {
                client.sendText("안녕하세요");
                client.sendZoomIn();
              } catch (e) {
                console.error("ConversationManager 준비 안됨");
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

  const sendMessage = () => {
    if (!inputText.trim() || !clientRef.current) return;
    clientRef.current.sendText(inputText);
    setInputText("");
  };

  return (
    <>
      {/* ⭐ layout 클래스 추가 ONLY */}
      <div className={`dh-widget ${layout} ${isOpen ? "open" : "closed"}`}>
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
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button onClick={sendMessage} className="dh-send-btn">
            <svg 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="3"
              strokeLinecap="round" 
              strokeLinejoin="round" 
              width="18" 
              height="18"
            >
              <line x1="12" y1="19" x2="12" y2="5"></line>
              <polyline points="5 12 12 5 19 12"></polyline>
            </svg>
          </button>
        </div>
      </div>

      {/* ⭐ layout 클래스 추가 ONLY */}
      <button className={`dh-toggle-btn ${layout}`} onClick={toggleWidget}>
        {isOpen ? (
          <svg viewBox="0 0 24 24" width="32" height="32">
            <line x1="4" y1="4" x2="20" y2="20" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="4" y1="20" x2="20" y2="4" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
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