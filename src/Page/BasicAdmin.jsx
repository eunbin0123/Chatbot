import React, { useState, useEffect, useRef } from "react";
import { BasicChatbot } from "./BasicChatBot";

const styles = `
/* =========================================
   AgentSettings.css (KLEVER ONE Vibe)
========================================= */

/* 🚀 미리보기 화면 전체 배경색을 어둡게 맞춤 */
html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  min-height: 100vh;
  background-color: #0f1115;
}

.app-root {
  min-height: 100vh;
  background-color: #0f1115;
  transition: background-color 0.3s ease;
  /* flex 속성 제거로 레이아웃 찌그러짐 해결 */
}

.agent-settings-container,
.agent-settings-container * {
  box-sizing: border-box !important;
}

.agent-settings-container {
  width: 100%; /* 🚀 컨테이너 폭을 명시하여 넓게 펴줌 */
  max-width: 960px;
  margin: 0 auto;
  color: #e2e8f0;
  font-family: "Pretendard", sans-serif;
  padding: 40px 20px;
}

/* 헤더 및 탭 */
.view-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
.title-area {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.main-title {
  font-size: 30px;
  font-weight: 800;
  color: #fff;
  margin: 0;
  letter-spacing: -0.5px;
}
.main-title .highlight {
  background: linear-gradient(90deg, #00c6ff 0%, #0072ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.sub-title {
  font-size: 14px;
  color: #9ca3af;
  margin: 0;
}
.header-buttons {
  display: flex;
  gap: 12px;
}

.settings-tabs {
  display: flex;
  gap: 8px;
  border-bottom: 2px solid #2d3748;
  margin-bottom: 24px;
}
.tab-btn {
  background: transparent;
  border: none;
  color: #a0aec0;
  padding: 12px 20px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  transition: all 0.2s;
}
.tab-btn:hover {
  color: #e2e8f0;
}
.tab-btn.active {
  color: #00c6ff;
  border-bottom: 2px solid #00c6ff;
  font-weight: 600;
  text-shadow: 0 0 10px rgba(0, 198, 255, 0.3);
}

/* 본문 영역 */
.tab-content-area,
.tab-pane {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.fade-in {
  animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 공통 카드 */
.setting-card {
  background-color: #1a1d24;
  border: 1px solid #2d3748;
  border-radius: 12px;
  padding: 28px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}
.card-header-flex {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}
.card-title {
  font-size: 17px;
  color: #fff;
  margin: 0 0 8px 0;
  font-weight: 600;
}
.card-desc {
  font-size: 13px;
  color: #9ca3af;
  margin: 0 0 20px 0;
}

.btn-klever-sync {
  background-color: rgba(0, 198, 255, 0.1);
  color: #00c6ff;
  border: 1px solid rgba(0, 198, 255, 0.3);
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-klever-sync:hover {
  background-color: rgba(0, 198, 255, 0.2);
  border-color: #00c6ff;
}

/* ==================================================
   🚀 디지털 휴먼 이미지 선택 그리드 카드
================================================== */
.character-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

/* 반응형: 화면 작아지면 2개, 1개로 줄어듦 */
@media (max-width: 768px) {
  .character-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 480px) {
  .character-grid {
    grid-template-columns: 1fr;
  }
}

.character-card {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  aspect-ratio: 16 / 10;
  cursor: pointer;
  border: 2px solid #2d3748;
  background-color: #0f1115;
  transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s;
}

.character-card:hover {
  transform: translateY(-4px);
  border-color: #718096;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.4);
}

.character-card.selected {
  border-color: #00c6ff;
  box-shadow: 0 0 0 1px #00c6ff, 0 8px 20px rgba(0, 198, 255, 0.2);
}

.character-bg {
  width: 100%;
  height: 100%;
}

/* 이미지 하단 검은색 그라데이션 및 정보 */
.character-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(
    to top,
    rgba(26, 29, 36, 1) 10%,
    rgba(26, 29, 36, 0.7) 60%,
    transparent 100%
  );
  padding: 24px 20px 20px 20px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 12px;
}

.character-text {
  flex: 1;
}
.character-text h4 {
  margin: 0 0 6px 0;
  font-size: 16px;
  color: #fff;
  font-weight: 700;
}
.character-text p {
  margin: 0;
  font-size: 12px;
  color: #a0aec0;
  line-height: 1.4;
  word-break: keep-all;
}

/* 우측 하단 선택하기 버튼 */
.btn-character {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #fff;
  padding: 6px 16px;
  border-radius: 99px;
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  transition: all 0.2s;
}

.character-card:hover .btn-character {
  background: rgba(255, 255, 255, 0.15);
}
.character-card.selected .btn-character {
  background: #00c6ff;
  border-color: #00c6ff;
  color: #fff;
  font-weight: 600;
}

/* ================== 폼 요소 ================== */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}
.form-group label {
  font-size: 13px;
  color: #cbd5e0;
}
.form-group-row {
  display: flex;
  gap: 24px;
}
.mt-2 {
  margin-top: 8px;
}

.custom-input,
.custom-select {
  width: 100%;
  padding: 12px 16px;
  background-color: #0f1115;
  border: 1px solid #4a5568;
  color: #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
}
.custom-input:focus,
.custom-select:focus {
  border-color: #00c6ff;
}

/* 🚀 셀렉트 박스 화살표 커스텀 (우측 마진 10px 적용) */
.custom-select {
  appearance: none;
  -webkit-appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23a0aec0' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 16px;
  padding-right: 36px;
}

.custom-input[readOnly] {
  background-color: #11141a;
  color: #718096;
  cursor: copy;
}
.input-with-unit {
  display: flex;
  align-items: center;
  gap: 8px;
}
.input-with-unit .unit {
  color: #a0aec0;
  font-size: 14px;
}

/* API 키 관리 리스트 (다중 API) */
.api-key-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 8px;
}
.api-key-item {
  display: flex;
  align-items: center;
  gap: 12px;
  background-color: #0b0d10;
  border: 1px solid #4a5568;
  padding: 12px 16px;
  border-radius: 8px;
  transition: border-color 0.2s;
}
.api-key-item:hover {
  border-color: #718096;
}
.api-key-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.api-key-name-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}
.api-key-name {
  font-size: 13px;
  font-weight: 600;
  color: #e2e8f0;
}
.api-key-date {
  font-size: 11px;
  color: #718096;
}
.api-key-value {
  font-size: 13px;
  color: #a0aec0;
  font-family: "Consolas", "Monaco", monospace;
  background: transparent;
  border: none;
  outline: none;
  width: 100%;
}
.api-key-actions {
  display: flex;
  gap: 4px;
}
.btn-icon {
  background: transparent;
  border: none;
  color: #a0aec0;
  cursor: pointer;
  padding: 6px;
  border-radius: 6px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}
.btn-icon:hover {
  background-color: #2d3748;
  color: #fff;
}
.btn-icon.danger:hover {
  background-color: rgba(229, 62, 62, 0.1);
  color: #e53e3e;
}

.btn-text-reissue {
  background: transparent;
  border: 1px solid #4a5568;
  color: #a0aec0;
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}
.btn-text-reissue:hover {
  background-color: rgba(0, 198, 255, 0.1);
  color: #00c6ff;
  border-color: #00c6ff;
}

/* 라디오 */
.radio-group {
  display: grid;
  grid-template-columns: repeat(4, 1fr); /* 🚀 2열에서 4열로 변경 (한 줄로 나열) */
  gap: 12px;
}

@media (max-width: 900px) {
  .radio-group {
    grid-template-columns: repeat(2, 1fr); /* 중간 화면에서는 2열 */
  }
}

@media (max-width: 600px) {
  .radio-group {
    grid-template-columns: 1fr; /* 모바일에서는 1열 */
  }
}

.radio-card {
  display: flex;
  align-items: center;
  gap: 12px; /* 🚀 간격을 늘려 라디오 버튼과 글자 사이의 여백 추가 */
  padding: 12px 14px; /* 🚀 패딩을 살짝 줄여 한 줄에 잘 들어가게 함 */
  background-color: #0f1115;
  border: 1px solid #4a5568;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}
.radio-card:hover {
  border-color: #718096;
}
.radio-card.active {
  border-color: #00c6ff;
  background-color: rgba(0, 198, 255, 0.05);
}
.radio-card input[type="radio"] {
  margin: 0;
  cursor: pointer;
  accent-color: #00c6ff;
}
.radio-label {
  font-size: 13px; /* 🚀 폰트 사이즈를 조금 줄임 */
  color: #e2e8f0;
  white-space: nowrap; /* 🚀 텍스트 줄바꿈 방지 */
  overflow: hidden;
  text-overflow: ellipsis;
}
.custom-endpoint-box {
  margin-top: 16px;
  padding: 16px;
  background-color: #2d3748;
  border-radius: 8px;
  animation: fadeIn 0.3s ease-out;
  box-sizing: border-box;
}
.custom-endpoint-box label {
  font-size: 13px;
  color: #e2e8f0;
  box-sizing: border-box;
}

/* ==================================================
   🚀 에이전트 선택 박스 (탭 2)
================================================== */
.agent-select-box {
  margin-bottom: 24px;
  padding: 16px;
  background-color: #0b0d10;
  border: 1px solid #4a5568;
  border-radius: 8px;
}
.agent-select-box label {
  font-size: 13px;
  color: #cbd5e0;
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
}

/* ================== RAG 학습 폼 요소 (통합형) ================== */
.unified-rag-box {
  background-color: #0f1115;
  border: 1px dashed #4a5568;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: all 0.2s;
  margin-top: 8px;
}
.unified-rag-box:hover,
.unified-rag-box:focus-within {
  border-color: #00c6ff;
  background-color: rgba(0, 198, 255, 0.02);
}
.unified-rag-box.drag-active {
  border-color: #00c6ff;
  background-color: rgba(0, 198, 255, 0.1);
  border-width: 2px;
}
.unified-rag-textarea {
  width: 100%;
  min-height: 60px; /* 🚀 100px에서 60px로 축소 */
  padding: 16px;
  background: transparent;
  border: none;
  color: #e2e8f0;
  font-size: 14px;
  resize: vertical;
  outline: none;
  font-family: inherit;
}
.unified-rag-textarea::placeholder {
  color: #718096;
  line-height: 1.5;
}
.unified-rag-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px 12px;
}
.btn-attach {
  display: flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  color: #a0aec0;
  border: 1px solid transparent;
  font-size: 13px;
  cursor: pointer;
  padding: 6px 10px;
  border-radius: 6px;
  transition: all 0.2s;
}
.btn-attach:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: #4a5568;
  color: #fff;
}
.btn-add-rag {
  background-color: #2d3748;
  color: #e2e8f0;
  border: 1px solid #4a5568;
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-add-rag:hover {
  background-color: #00c6ff;
  border-color: #00c6ff;
  color: #fff;
}
.rag-files-preview {
  padding: 0 16px 12px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.file-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #2d3748;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 12px;
  color: #e2e8f0;
  border: 1px solid #4a5568;
  max-width: 100%;
}
.file-chip span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 250px;
}
.file-chip button {
  background: transparent;
  border: none;
  color: #a0aec0;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}
.file-chip button:hover {
  color: #e53e3e;
}

/* ================== 태그 프롬프팅 폼 요소 ================== */
.prompt-tags-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 16px;
}
.prompt-tag {
  background-color: #0f1115;
  border: 1px solid #4a5568;
  color: #a0aec0;
  padding: 8px 16px;
  border-radius: 99px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
  user-select: none;
}
.prompt-tag:hover {
  border-color: #718096;
  color: #e2e8f0;
}
.prompt-tag.active {
  background-color: rgba(0, 198, 255, 0.1);
  border-color: #00c6ff;
  color: #00c6ff;
  font-weight: 500;
}

.prompt-tag-remove {
  background: transparent;
  border: none;
  color: inherit;
  padding: 0;
  margin-left: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.5;
  transition: opacity 0.2s;
}
.prompt-tag-remove:hover {
  opacity: 1;
  color: #e53e3e;
}

/* ==================================================
   🚀 MCP 연동 리스트 
================================================== */
.mcp-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #0b0d10;
  border: 1px solid #4a5568;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 8px;
  transition: border-color 0.2s;
}
.mcp-item:hover {
  border-color: #718096;
}
.mcp-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.mcp-name { 
  font-size: 14px; 
  font-weight: 600; 
  color: #e2e8f0; 
  display: flex; 
  align-items: center; 
  gap: 8px; 
}
.mcp-desc { 
  font-size: 12px; 
  color: #718096; 
}
.mcp-badge { 
  background: #2d3748; 
  color: #a0aec0; 
  padding: 2px 6px; 
  border-radius: 4px; 
  font-size: 10px; 
  font-weight: 700; 
}
.mcp-badge.built-in { 
  background: rgba(0, 198, 255, 0.1); 
  color: #00c6ff; 
  border: 1px solid rgba(0, 198, 255, 0.2); 
}

/* 토글 스위치 UI */
.toggle-switch {
  position: relative;
  width: 40px;
  height: 22px;
  appearance: none;
  -webkit-appearance: none;
  background: #4a5568;
  border-radius: 99px;
  cursor: pointer;
  outline: none;
  transition: background 0.3s;
  margin: 0;
}
.toggle-switch:checked {
  background: #00c6ff;
}
.toggle-switch::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 18px;
  height: 18px;
  background: #fff;
  border-radius: 50%;
  transition: transform 0.3s;
}
.toggle-switch:checked::after {
  transform: translateX(18px);
}
.light-mode .mcp-item { background-color: #f7fafc; border-color: #e2e8f0; }
.light-mode .mcp-name { color: #1a202c; }
.light-mode .mcp-desc { color: #718096; }
.light-mode .toggle-switch { background: #cbd5e0; }

/* ================== 모드 토글 버튼 및 커스텀 프롬프트 ================== */
.mode-toggle-group {
  display: flex;
  background-color: #0f1115;
  border: 1px solid #2d3748;
  border-radius: 8px;
  overflow: hidden;
}
.mode-toggle-btn {
  background: transparent;
  color: #a0aec0;
  border: none;
  padding: 6px 16px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}
.mode-toggle-btn:hover {
  color: #e2e8f0;
}
.mode-toggle-btn.active {
  background-color: #2d3748;
  color: #00c6ff;
}

/* 🚀 카드 내 구분선 (Divider) */
.card-divider {
  border: none;
  border-top: 1px dashed #4a5568;
  margin: 24px 0;
  width: 100%;
}
.light-mode .card-divider {
  border-top-color: #cbd5e0;
}

.custom-tag-input-wrap {
  display: flex;
  align-items: center;
  background-color: transparent;
  border: 1px dashed #4a5568;
  border-radius: 99px;
  padding: 4px 4px 4px 12px;
  gap: 6px;
  transition: border-color 0.2s;
}
.custom-tag-input-wrap:focus-within {
  border-color: #718096;
}
.custom-tag-input {
  background: transparent;
  border: none;
  color: #e2e8f0;
  font-size: 13px;
  outline: none;
  width: 90px;
}
.custom-tag-input::placeholder {
  color: #718096;
}
.btn-add-tag {
  background-color: #2d3748;
  color: #e2e8f0;
  border: none;
  border-radius: 99px;
  padding: 4px 12px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-add-tag:hover {
  background-color: #4a5568;
  color: #fff;
}

.manual-prompt-textarea {
  width: 100%;
  min-height: 150px;
  padding: 16px;
  background-color: #0f1115;
  border: 1px solid #4a5568;
  border-radius: 8px;
  color: #e2e8f0;
  font-size: 14px;
  resize: vertical;
  outline: none;
  font-family: inherit;
  margin-top: 16px;
}
.manual-prompt-textarea:focus {
  border-color: #00c6ff;
}

/* ================== 위젯 레이아웃 선택기 ================== */
.layout-selector {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 16px;
}
.layout-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}
.layout-item span {
  font-size: 13px;
  color: #a0aec0;
  transition: color 0.2s;
  white-space: nowrap;
}
.layout-preview {
  width: 100%;
  height: 100px;
  background-color: #0f1115;
  border: 2px solid #4a5568;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.2s;
}
.layout-item:hover .layout-preview {
  border-color: #718096;
}
.layout-item.selected .layout-preview {
  border-color: #00c6ff;
  background-color: rgba(0, 198, 255, 0.05);
}
.layout-item.selected span {
  color: #00c6ff;
  font-weight: bold;
}

.browser-mockup {
  width: 80%;
  height: 70%;
  border: 1px dashed #718096;
  border-radius: 4px;
  position: relative;
}
.widget-box {
  position: absolute;
  background-color: #00c6ff;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 198, 255, 0.4);
}

.widget-box.br {
  width: 20px;
  height: 35px;
  bottom: 6px;
  right: 6px;
}
.widget-box.bl {
  width: 20px;
  height: 35px;
  bottom: 6px;
  left: 6px;
}
.widget-box.tr {
  width: 20px;
  height: 35px;
  top: 6px;
  right: 6px;
}
.widget-box.tl {
  width: 20px;
  height: 35px;
  top: 6px;
  left: 6px;
}
.widget-box.center {
  width: 35px;
  height: 45px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

/* ================== 버튼 ================== */
button {
  cursor: pointer;
  font-family: inherit;
  font-size: 14px;
}
.btn-primary {
  background: linear-gradient(90deg, #00c6ff 0%, #0072ff 100%);
  color: #fff;
  border: none;
  padding: 10px 24px;
  border-radius: 8px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(0, 114, 255, 0.3);
  transition: transform 0.2s, box-shadow 0.2s;
}
.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(0, 114, 255, 0.4);
}
.btn-primary:disabled {
  background: #4a5568;
  color: #a0aec0;
  cursor: not-allowed;
  box-shadow: none;
}
.btn-danger {
  background: #e53e3e;
  color: #fff;
  border: none;
  padding: 10px 24px;
  border-radius: 8px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(229, 62, 62, 0.3);
  transition: transform 0.2s, box-shadow 0.2s;
}
.btn-danger:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(229, 62, 62, 0.4);
}
.btn-secondary {
  background-color: #4a5568;
  color: #fff;
  border: none;
  padding: 0 16px;
  border-radius: 8px;
  font-weight: 500;
}
.btn-outline {
  background-color: transparent;
  color: #cbd5e0;
  border: 1px solid #4a5568;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 500;
}
.text-blue {
  color: #00c6ff;
  border-color: rgba(0, 198, 255, 0.5);
}

/* ==================================================
   🚀 저장 확인 모달 (Modal) UI
================================================== */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease-out;
}

.modal-box {
  background-color: #1a1d24;
  border: 1px solid #2d3748;
  border-radius: 16px;
  padding: 32px;
  width: 90%;
  max-width: 360px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
  text-align: center;
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.modal-title {
  font-size: 20px;
  font-weight: 700;
  color: #fff;
  margin: 0 0 12px 0;
}

.modal-logo {
  font-size: 24px;
  font-weight: 800;
  margin: 0 0 16px 0;
}

.modal-logo span {
  background: linear-gradient(90deg, #00c6ff 0%, #0072ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.modal-desc {
  font-size: 14px;
  color: #a0aec0;
  margin: 0 0 28px 0;
  line-height: 1.5;
  word-break: keep-all;
}

.modal-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.modal-buttons button {
  flex: 1;
  padding: 12px 0;
}

/* ==================================================
   🚀 상단 뒤로가기 아이콘 버튼 UI
================================================== */
.btn-icon-back {
  background-color: transparent;
  color: #a0aec0;
  border: none;
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s;
  padding: 0;
}
.btn-icon-back:hover {
  color: #fff;
  transform: scale(1.1);
}

/* ==================================================
   🚀 코드 복사 컨테이너 UI
================================================== */
.code-container {
  position: relative;
  background-color: #0b0d10;
  border: 1px solid #4a5568;
  border-radius: 8px;
  padding: 20px 16px 16px;
  margin-top: 16px;
  overflow-x: auto;
}
.code-container pre {
  margin: 0;
  color: #a0aec0;
  font-size: 13px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-all;
  font-family: "Consolas", "Monaco", monospace;
  padding-right: 80px;
}
.code-container .code-highlight {
  color: #00c6ff;
}
.btn-copy-code {
  position: absolute;
  top: 12px;
  right: 12px;
  background-color: #2d3748;
  color: #e2e8f0;
  border: 1px solid #4a5568;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-copy-code:hover {
  background-color: #4a5568;
  color: #fff;
  border-color: #718096;
}

/* ==================================================
   🚀 라이트 모드 (Light Mode) 오버라이드
================================================== */
.app-root.light-mode { background-color: #f0f4f8; }
.light-mode .agent-settings-container { color: #1a202c; }
.light-mode .main-title { color: #1a202c; }
.light-mode .sub-title { color: #4a5568; }
.light-mode .view-header { border-bottom-color: rgba(0, 0, 0, 0.1); }
.light-mode .tab-btn { color: #718096; }
.light-mode .tab-btn:hover { color: #1a202c; }
.light-mode .tab-btn.active { color: #0072ff; border-bottom-color: #0072ff; text-shadow: none; }
.light-mode .setting-card { background-color: #ffffff; border-color: #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
.light-mode .card-title { color: #1a202c; }
.light-mode .card-desc { color: #718096; }
.light-mode .api-key-item { background-color: #f7fafc; border-color: #e2e8f0; }
.light-mode .api-key-name { color: #1a202c; }
.light-mode .api-key-value { color: #4a5568; }
.light-mode .btn-icon { color: #718096; }
.light-mode .btn-icon:hover { background-color: #edf2f7; color: #1a202c; }
.light-mode .btn-text-reissue { border-color: #cbd5e0; color: #4a5568; }
.light-mode .btn-text-reissue:hover { background-color: rgba(0, 114, 255, 0.1); color: #0072ff; border-color: #0072ff; }
.light-mode .radio-card { background-color: #ffffff; border-color: #e2e8f0; }
.light-mode .radio-card.active { background-color: rgba(0, 114, 255, 0.05); border-color: #0072ff; }
.light-mode .radio-label { color: #4a5568; }
.light-mode .custom-endpoint-box { background-color: #f7fafc; border-color: #e2e8f0; }
.light-mode .custom-endpoint-box label { color: #4a5568; }
.light-mode .agent-select-box { background-color: #f7fafc; border-color: #e2e8f0; }
.light-mode .agent-select-box label { color: #4a5568; }
.light-mode .unified-rag-box { background-color: #ffffff; border-color: #cbd5e0; }
.light-mode .unified-rag-box:hover { background-color: rgba(0, 114, 255, 0.02); }
.light-mode .unified-rag-textarea { color: #1a202c; }
.light-mode .btn-attach { color: #4a5568; }
.light-mode .btn-attach:hover { background: #edf2f7; color: #1a202c; }
.light-mode .file-chip { background: #edf2f7; border-color: #cbd5e0; color: #4a5568; }
.light-mode .prompt-tag { background-color: #ffffff; border-color: #cbd5e0; color: #4a5568; }
.light-mode .prompt-tag:hover { border-color: #718096; color: #1a202c; }
.light-mode .prompt-tag.active { background-color: rgba(0, 114, 255, 0.1); border-color: #0072ff; color: #0072ff; }
.light-mode .mode-toggle-group { background-color: #f7fafc; border-color: #cbd5e0; }
.light-mode .mode-toggle-btn { color: #718096; }
.light-mode .mode-toggle-btn.active { background-color: #ffffff; color: #0072ff; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
.light-mode .custom-input, .light-mode .custom-select, .light-mode .manual-prompt-textarea { background-color: #ffffff; border-color: #cbd5e0; color: #1a202c; }
.light-mode .custom-input[readOnly] { background-color: #f7fafc; color: #718096; }
.light-mode select.custom-select { background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%234a5568' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e"); }
.light-mode .character-card { background-color: #ffffff; border-color: #e2e8f0; }
.light-mode .character-card.selected { border-color: #0072ff; box-shadow: 0 0 0 1px #0072ff, 0 8px 20px rgba(0, 114, 255, 0.15); }
.light-mode .layout-preview { background-color: #ffffff; border-color: #cbd5e0; }
.light-mode .layout-item span { color: #4a5568; }
.light-mode .browser-mockup { border-color: #cbd5e0; background-color: #ffffff; }
.light-mode .code-container { background-color: #f7fafc; border-color: #cbd5e0; }
.light-mode .code-container pre { color: #2d3748; }
.light-mode .btn-copy-code { background-color: #ffffff; color: #4a5568; border-color: #cbd5e0; }
.light-mode .modal-box { background-color: #ffffff; border-color: #e2e8f0; }
.light-mode .modal-title { color: #1a202c; }
.light-mode .modal-desc { color: #4a5568; }
.light-mode .btn-outline { border-color: #cbd5e0; color: #4a5568; }
.light-mode .btn-outline:hover { background-color: #f7fafc; }
.light-mode .btn-icon-back { color: #a0aec0; }
.light-mode .btn-icon-back:hover { color: #1a202c; }
.light-mode .form-group label { color: #4a5568; }

/* 테마 토글 버튼 스타일 */
.btn-icon-theme {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #e2e8f0;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-icon-theme:hover { background: rgba(255, 255, 255, 0.1); }
.light-mode .btn-icon-theme { border-color: #cbd5e0; color: #4a5568; }
.light-mode .btn-icon-theme:hover { background: #edf2f7; }
`;

export default function App() {
  const [activeTab, setActiveTab] = useState("agent"); // 에이전트 탭 기본 표시

  // 시스템 & AI
  const [apiKeys, setApiKeys] = useState([
    {
      id: 1,
      name: "klever one",
      value: "sk-live-a1b2c3d4e5f6g7h8i9j0",
      date: "2026-04-07",
      character: "", // 🚀 기본 선택 해제
      voice: "",     // 🚀 기본 목소리 선택 해제
      language: "ko"
    }
  ]);
  const [selectedAgentId, setSelectedAgentId] = useState(1); // 🚀 현재 설정 중인 에이전트 ID
  const [llmType, setLlmType] = useState(""); // 🚀 기본 상태를 아무것도 선택되지 않음으로 변경
  const [ragType, setRagType] = useState("none"); // 🚀 RAG 설정 상태 (none, native, external)

  // 🚀 입력값 상태 추가 (유효성 검사용)
  const [customLlmUrl, setCustomLlmUrl] = useState("");
  const [nativeRagId, setNativeRagId] = useState("");
  const [externalRagUrl, setExternalRagUrl] = useState("");

  // 위젯 설정
  const [layout, setLayout] = useState("bottom-right");
  const [autoOff, setAutoOff] = useState(15);
  const [autoOffSec, setAutoOffSec] = useState(0);

  // RAG 학습 데이터 상태
  const [ragInput, setRagInput] = useState("");
  const [ragFiles, setRagFiles] = useState([]);
  const [ragTexts, setRagTexts] = useState([]);
  const [isDragging, setIsDragging] = useState(false); // 🚀 드래그 상태 추가

  // 🚀 파일 입력을 위한 참조 추가
  const fileInputRef = useRef(null);

  // 🚀 MCP 리스트 상태 관리
  const [mcpList, setMcpList] = useState([
    { id: "web_search", name: "웹 검색 (Web Search)", desc: "실시간 웹 검색 결과를 기반으로 최신 정보를 반영합니다.", type: "built-in", active: true },
    { id: "calculator", name: "수학 및 코드 실행기", desc: "복잡한 수식이나 코드를 실행하여 정확한 결과값을 도출합니다.", type: "built-in", active: false },
    { id: "custom_1", name: "사내 예약 시스템 연동", desc: "https://api.company.com/mcp/booking", type: "custom", active: true }
  ]);

  // =========================================================
  // 🚀 누락되었던 드래그 앤 드롭 및 파일 업로드 핸들러 복구
  // =========================================================
  
  // 파일 첨부 버튼 클릭 시 (숨겨진 input 실행)
  const handleFileAttach = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // 실제 파일이 선택되었을 때 실행되는 함수
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const newFiles = files.map((file) => ({
        id: Date.now() + Math.random(), // 고유 ID 생성
        name: file.name,
      }));
      setRagFiles([...ragFiles, ...newFiles]);
    }
    // 동일한 파일을 연속으로 선택할 수 있도록 value 초기화
    e.target.value = null;
  };

  // 첨부된 파일 삭제
  const removeFile = (id) => {
    setRagFiles(ragFiles.filter((f) => f.id !== id));
  };

  // 드래그 앤 드롭 이벤트 핸들러
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const newFiles = files.map((file) => ({
        id: Date.now() + Math.random(),
        name: file.name,
      }));
      setRagFiles([...ragFiles, ...newFiles]);
    }
  };

  // RAG 텍스트/URL 추가 로직
  const handleAddRag = () => {
    if (!ragInput.trim()) return;
    
    // URL인지 단순 텍스트인지 판별
    const isUrl = ragInput.startsWith("http://") || ragInput.startsWith("https://");
    
    const newItem = {
      id: Date.now(),
      type: isUrl ? 'url' : 'text',
      content: ragInput.trim()
    };
    
    setRagTexts([...ragTexts, newItem]);
    setRagInput(""); // 입력창 초기화
  };

  // 추가된 텍스트/URL 삭제 로직
  const removeRagText = (id) => {
    setRagTexts(ragTexts.filter((item) => item.id !== id));
  };

  // 엔터키 입력 감지
  const handleRagKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // 기본 엔터(줄바꿈) 방지
      handleAddRag();
    }
  };
  // =========================================================

  // 태그 프롬프팅 상태 (분리된 태그들 기본 활성화)
  const [selectedTags, setSelectedTags] = useState(["no_politics", "no_religion", "no_social_controversy", "no_profanity", "polite_tone"]);
  const [promptMode, setPromptMode] = useState("tag"); // 🚀 "tag" | "manual"
  const [customTags, setCustomTags] = useState([]); // 🚀 직접 추가한 태그 목록
  const [customTagInput, setCustomTagInput] = useState(""); // 🚀 입력 중인 태그 텍스트
  const [manualPrompt, setManualPrompt] = useState(""); // 🚀 직접 입력 프롬프트

  // 🚀 모달 상태 관리
  const [isModalOpen, setIsModalOpen] = useState(false); // 저장 모달
  const [isExitModalOpen, setIsExitModalOpen] = useState(false); // 나가기 모달
  const [isNewKeyModalOpen, setIsNewKeyModalOpen] = useState(false); // 🚀 신규 키 발급 모달
  const [newKeyNameInput, setNewKeyNameInput] = useState(""); // 🚀 신규 키 이름 입력

  // 🚀 신규 MCP 추가 팝업 상태
  const [isMcpModalOpen, setIsMcpModalOpen] = useState(false);
  const [newMcpName, setNewMcpName] = useState("");
  const [newMcpUrl, setNewMcpUrl] = useState("");

  const [isDarkMode, setIsDarkMode] = useState(true); // 🚀 다크/라이트 모드 상태 관리

  // 🚀 브라우저 기본 Alert/Confirm 대체용 모달 상태
  const [alertMessage, setAlertMessage] = useState("");
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [reissueTargetId, setReissueTargetId] = useState(null);

  // 🚀 ESC 키를 눌렀을 때 모달 닫기
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsModalOpen(false);
        setIsExitModalOpen(false);
        setIsNewKeyModalOpen(false);
        setIsMcpModalOpen(false);
        setAlertMessage("");
        setDeleteTargetId(null);
        setReissueTargetId(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // 🚀 LLM 엔진이 변경될 때 RAG 옵션이 호환되지 않으면 초기화
  useEffect(() => {
    if (ragType === "native" && llmType === "custom") {
      setRagType("none");
    }
  }, [llmType, ragType]);

  // 🚀 선택된 에이전트가 삭제되었을 때 기본값으로 폴백
  useEffect(() => {
    if (!apiKeys.find(a => a.id === selectedAgentId) && apiKeys.length > 0) {
      setSelectedAgentId(apiKeys[0].id);
    }
  }, [apiKeys, selectedAgentId]);

  // 🚀 현재 설정 중인 에이전트 객체 가져오기
  const activeAgent = apiKeys.find(a => a.id === selectedAgentId) || apiKeys[0];

  // 🚀 폼 유효성 검사 로직 (필수 설정이 모두 되었는지 확인)
  const isFormValid = 
    apiKeys.length > 0 && // 에이전트 키가 최소 1개 이상 존재해야 함
    llmType !== "" && // 🚀 인공지능 엔진이 선택되어야 함
    (llmType !== "custom" || customLlmUrl.trim() !== "") && // 커스텀 LLM 선택 시 URL 필수
    (ragType !== "external" || externalRagUrl.trim() !== "") && // 외부 RAG 선택 시 URL 필수
    (ragType !== "native" || nativeRagId.trim() !== "" || ragFiles.length > 0 || ragTexts.length > 0) && // 네이티브 RAG 선택 시 ID 또는 파일/텍스트 업로드 필수
    activeAgent?.character && activeAgent?.language && activeAgent?.voice; // 에이전트 설정값이 있어야 함

  // 🚀 현재 에이전트의 속성(캐릭터, 언어 등) 업데이트 함수
  const updateCurrentAgent = (key, value) => {
    setApiKeys(apiKeys.map(agent => 
      agent.id === activeAgent.id ? { ...agent, [key]: value } : agent
    ));
  };

  // 🚀 초기화 버튼 클릭 시 실행되는 함수
  const handleReset = () => {
    setApiKeys([
      {
        id: 1,
        name: "klever one",
        value: import.meta.env.VITE_KLEVER_API_KEY,
        date: "2026-04-07",
        character: "", // 🚀 기본 선택 해제
        voice: "",     // 🚀 기본 목소리 선택 해제
        language: "ko"
      }
    ]);
    setSelectedAgentId(1);
    setLlmType(""); // 🚀 초기화 시에도 아무것도 선택되지 않은 상태로 변경
    setRagType("none");
    setLayout("bottom-right");
    setAutoOff(15);
    setAutoOffSec(0);
    setSelectedTags(["no_politics", "no_religion", "no_social_controversy", "no_profanity", "polite_tone"]);
    setPromptMode("tag");
    setCustomTags([]);
    setCustomTagInput("");
    setManualPrompt("");
  };

  // 🚀 특정 API 키 복사
  const handleCopySpecificKey = (value) => {
    try {
      const textArea = document.createElement("textarea");
      textArea.value = value;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setAlertMessage("API 키가 클립보드에 복사되었습니다!");
    } catch (err) {
      console.error("복사 실패", err);
    }
  };

  // 🚀 신규 API 키 발급 모달 열기
  const handleGenerateNewKey = () => {
    setNewKeyNameInput(`신규 에이전트 키 #${apiKeys.length + 1}`);
    setIsNewKeyModalOpen(true);
  };

  // 🚀 이름 입력 후 실제 키 발급 실행
  const confirmGenerateNewKey = () => {
    if (!newKeyNameInput.trim()) {
      return; // 이름이 비어있으면 실행하지 않음
    }

    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let newKey = "sk-live-";
    for (let i = 0; i < 24; i++) {
      newKey += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    // 현재 날짜 구하기 (YYYY-MM-DD)
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    const newKeyObj = {
      id: Date.now(),
      name: newKeyNameInput.trim(),
      value: newKey,
      date: dateStr,
      character: "",           // 🚀 신규 발급 시에도 기본 선택 해제
      voice: "",               // 🚀 신규 발급 시에도 기본 목소리 선택 해제
      language: "ko"           // 기본 언어 할당
    };
    
    // 새 키를 리스트 맨 앞에 추가하고, 바로 해당 에이전트를 선택 상태로 변경
    setApiKeys([newKeyObj, ...apiKeys]);
    setSelectedAgentId(newKeyObj.id);
    setIsNewKeyModalOpen(false);
  };

  // 🚀 특정 API 키 재발급 신청 (모달 열기)
  const handleReissueKey = (id) => {
    setReissueTargetId(id);
  };

  // 🚀 특정 API 키 삭제 (모달 열기)
  const handleDeleteKey = (id) => {
    if (apiKeys.length === 1) {
      setAlertMessage("최소 1개의 API 키는 유지해야 합니다.");
      return;
    }
    setDeleteTargetId(id);
  };

  // 🚀 실제 재발급 실행
  const confirmReissueKey = () => {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let newKey = "sk-live-";
    for (let i = 0; i < 24; i++) {
      newKey += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    setApiKeys(apiKeys.map(keyObj => 
      keyObj.id === reissueTargetId ? { ...keyObj, value: newKey, date: dateStr } : keyObj
    ));
    
    setReissueTargetId(null);
    setAlertMessage("API 키 재발급 요청이 정상적으로 접수되었습니다.");
  };

  // 🚀 실제 삭제 실행
  const confirmDeleteKey = () => {
    setApiKeys(apiKeys.filter(k => k.id !== deleteTargetId));
    setDeleteTargetId(null);
  };

  // 🚀 MCP 서버 추가 실행
  const confirmAddMcp = () => {
    if (!newMcpName.trim() || !newMcpUrl.trim()) {
      setAlertMessage("서버 이름과 URL을 모두 입력해주세요.");
      return;
    }
    const newMcp = {
      id: `custom_mcp_${Date.now()}`,
      name: newMcpName.trim(),
      desc: newMcpUrl.trim(),
      type: "custom",
      active: true
    };
    setMcpList([...mcpList, newMcp]);
    setIsMcpModalOpen(false);
    setNewMcpName("");
    setNewMcpUrl("");
  };

  // 🚀 변경사항 저장 클릭 -> 모달 열기
  const handleSaveClick = () => {
    setIsModalOpen(true);
  };

  // 🚀 모달에서 적용 클릭
  const confirmSave = () => {
    setIsModalOpen(false);
    setAlertMessage("성공적으로 적용되었습니다!"); 
  };

  // 🚀 모달에서 취소 클릭
  const cancelSave = () => {
    setIsModalOpen(false);
  };

  // 🚀 나가기 클릭 -> 모달 열기
  const handleExitClick = () => {
    setIsExitModalOpen(true);
  };

  // 🚀 나가기 모달 - 나가기 클릭
  const confirmExit = () => {
    setIsExitModalOpen(false);
    window.open('https://www.klever-one.com/', '_blank'); // 보안 환경을 우회하여 새 창으로 클레버원 웹사이트 열기
  };

  // 🚀 나가기 모달 - 취소 클릭
  const cancelExit = () => {
    setIsExitModalOpen(false);
  };

  // 🚀 위젯 삽입 코드 생성
  const getEmbedCode = () => {
    const totalSeconds = (parseInt(autoOff) || 0) * 60 + (parseInt(autoOffSec) || 0);
    return `<script 
  src="https://cdn.klever-one.com/widget.js" 
  data-layout="${layout}" 
  data-auto-off="${totalSeconds}"
></script>`;
  };

  // 🚀 삽입 코드 복사 로직
  const handleCopyEmbedCode = () => {
    try {
      const textArea = document.createElement("textarea");
      textArea.value = getEmbedCode();
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setAlertMessage("삽입 코드가 클립보드에 복사되었습니다!");
    } catch (err) {
      console.error("복사 실패", err);
    }
  };

  // 🚀 LLM 엔진에 따른 동적 RAG 옵션 생성
  const getRagOptions = () => {
    const options = [{ value: "none", label: "사용 안 함" }];
    
    if (llmType === "gpt") {
      options.push({ value: "native", label: "OpenAI Vector Store" });
    } else if (llmType === "gemini") {
      options.push({ value: "native", label: "Google AI Studio RAG" });
    } else if (llmType === "llamon") {
      options.push({ value: "native", label: "LLaMON RAG AI" });
    }
    
    options.push({ value: "external", label: "외부 연동 API" });
    return options;
  };

  // 🚀 태그 프롬프팅 토글 함수
  const togglePromptTag = (tagId) => {
    if (selectedTags.includes(tagId)) {
      setSelectedTags(selectedTags.filter(id => id !== tagId));
    } else {
      setSelectedTags([...selectedTags, tagId]);
    }
  };

  // 🚀 커스텀 태그 추가 함수
  const handleAddCustomTag = () => {
    const trimmed = customTagInput.trim();
    if (!trimmed) return;
    
    // 고유 ID 생성
    const tagId = `custom_${Date.now()}`;
    const newTag = { id: tagId, label: trimmed };
    
    setCustomTags([...customTags, newTag]);
    setSelectedTags([...selectedTags, tagId]); // 추가 시 바로 활성화 상태로 만듦
    setCustomTagInput(""); // 입력창 초기화
  };

  const handleCustomTagKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddCustomTag();
    }
  };

  // 🚀 커스텀 태그 삭제 함수
  const handleRemoveCustomTag = (e, tagId) => {
    e.stopPropagation(); // 클릭 시 태그 선택 토글이 작동하지 않도록 방지
    setCustomTags(customTags.filter(tag => tag.id !== tagId));
    setSelectedTags(selectedTags.filter(id => id !== tagId));
  };

  const promptTagOptions = [
    { id: "no_politics", label: "정치" },
    { id: "no_religion", label: "종교" },
    { id: "no_social_controversy", label: "사회적 논란" },
    { id: "no_profanity", label: "비속어 및 혐오 표현" },
    { id: "no_competitors", label: "경쟁사 언급" },
    { id: "no_personal_info", label: "개인정보 요구" },
    { id: "polite_tone", label: "존댓말" },
    { id: "require_citation", label: "출처 표기" },
    { id: "empathy_first", label: "공감과 위로" },
  ];

  const digitalHumans = [
    {
      id: "yuri",
      name: "유리 (Yuri)",
      desc: "단정하고 신뢰감 있는 안내원 스타일",
      bg: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
      num:5
    },
    {
      id: "chanu",
      name: "차누 (Chanu)",
      desc: "전문적이고 논리적인 컨설턴트 스타일",
      bg: "linear-gradient(135deg, #2b5876 0%, #4e4376 100%)",
      num:2

    },
    {
      id: "Michael",
      name: "마이클 (Michael)", // 선생님이 요청하신 마이클!
      desc: "밝고 캐주얼한 일상 대화 스타일",
      bg: "linear-gradient(135deg, #3a1c71 0%, #d76d77 50%, #ffaf7b 100%)",
      num:4
    },
    {
      id: "kris",
      name: "크리스 (Kris)",
      desc: "글로벌 서비스에 적합한 외국인 모델",
      bg: "linear-gradient(135deg, #141e30 0%, #243b55 100%)",
      num:3
    },
    {
      id: "custom1",
      name: "나의 커스텀 1",
      desc: "KLEVER 스튜디오에서 연동된 모델",
      bg: "linear-gradient(135deg, #4b6cb7 0%, #182848 100%)",
      num:0
    },
    {
      id: "custom2",
      name: "나의 커스텀 2",
      desc: "KLEVER 스튜디오에서 연동된 모델",
      bg: "linear-gradient(135deg, #614385 0%, #516395 100%)",
      num:0
    },
  ];

  // 5가지 위젯 레이아웃
  const layoutOptions = [
    { id: "bottom-right", label: "우측 하단 (기본)", boxClass: "br" },
    { id: "bottom-left", label: "좌측 하단", boxClass: "bl" },
    { id: "center", label: "화면 중앙 팝업", boxClass: "center" },
    { id: "top-right", label: "우측 상단", boxClass: "tr" },
    { id: "top-left", label: "좌측 상단", boxClass: "tl" },
  ];

  const selectedHuman = digitalHumans.find(human => human.id === activeAgent.character);
  const currentAvatarNum = selectedHuman ? selectedHuman.num : 0;

  return (
    <div className={`app-root ${!isDarkMode ? "light-mode" : ""}`}>
      {/* 🚀 CSS를 싱글 파일 내부에 직접 주입합니다 */}
      <style>{styles}</style>
      
      <div className="agent-settings-container">
        {/* 상단 헤더 */}
        <div className="view-header">
          <div className="title-area">
            <h1 className="main-title">
              <span className="highlight">KLEVER ONE</span>
            </h1>
            <p className="sub-title">디지털휴먼 및 AI 에이전트 통합 제어 환경</p>
          </div>
          <div className="header-buttons">
            <button 
              className="btn-icon-theme" 
              onClick={() => setIsDarkMode(!isDarkMode)}
              title={isDarkMode ? "라이트 모드로 전환" : "다크 모드로 전환"}
            >
              {isDarkMode ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
              )}
            </button>
            <button className="btn-outline" onClick={handleReset}>초기화</button>
            <button 
              className="btn-primary" 
              onClick={handleSaveClick}
              disabled={!isFormValid}
              title={!isFormValid ? "모든 필수 설정을 완료해야 저장할 수 있습니다." : ""}
            >
              변경사항 저장
            </button>
            <button 
              className="btn-icon-back" 
              onClick={handleExitClick}
              title="나가기"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
            </button>
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <div className="settings-tabs">
          <button
            className={`tab-btn ${activeTab === "system" ? "active" : ""}`}
            onClick={() => setActiveTab("system")}
          >
            ⚙️ 시스템 및 AI 연결
          </button>
          <button
            className={`tab-btn ${activeTab === "agent" ? "active" : ""}`}
            onClick={() => setActiveTab("agent")}
          >
            🤖 에이전트 (캐릭터/음성)
          </button>
          <button
            className={`tab-btn ${activeTab === "widget" ? "active" : ""}`}
            onClick={() => setActiveTab("widget")}
          >
            🖥️ 챗봇 UI 및 동작
          </button>
        </div>

        <div className="tab-content-area">
          {/* =========================================
              탭 1: 시스템 및 AI 연결
          ========================================= */}
          {activeTab === "system" && (
            <div className="tab-pane fade-in">
              <div className="setting-card">
                <div className="card-header-flex" style={{ marginBottom: "16px" }}>
                  <div>
                    <h3 className="card-title">API 키 관리</h3>
                    <p className="card-desc" style={{ marginBottom: 0 }}>
                      여러 에이전트 연동을 위한 인증 키를 발급하고 관리하세요.
                    </p>
                  </div>
                  <button className="btn-klever-sync" onClick={handleGenerateNewKey}>
                    + 신규 키 발급
                  </button>
                </div>
                
                <div className="api-key-list">
                  {apiKeys.map((keyObj) => (
                    <div key={keyObj.id} className="api-key-item">
                      <div className="api-key-info">
                        <div className="api-key-name-wrap">
                          <span className="api-key-name">{keyObj.name}</span>
                          <span className="api-key-date">{keyObj.date}</span>
                        </div>
                        <input
                          type="text"
                          className="api-key-value"
                          value={keyObj.value}
                          readOnly
                        />
                      </div>
                      <div className="api-key-actions">
                        <button 
                          className="btn-icon" 
                          onClick={() => handleCopySpecificKey(keyObj.value)} 
                          title="키 복사"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                          </svg>
                        </button>
                        <button 
                          className="btn-text-reissue" 
                          onClick={() => handleReissueKey(keyObj.id)} 
                        >
                          재발급
                        </button>
                        <button 
                          className="btn-icon danger" 
                          onClick={() => handleDeleteKey(keyObj.id)} 
                          title="키 삭제"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="setting-card">
                <h3 className="card-title">인공지능(LLM) 엔진 연결</h3>
                <p className="card-desc" style={{ marginBottom: "16px" }}>
                  에이전트의 두뇌 역할을 할 기본 언어 모델을 선택하세요.
                </p>
                <div className="radio-group">
                  <label
                    className={`radio-card ${llmType === "gpt" ? "active" : ""}`}
                  >
                    <input
                      type="radio"
                      value="gpt"
                      checked={llmType === "gpt"}
                      onChange={(e) => setLlmType(e.target.value)}
                    />
                    <span className="radio-label">OpenAI GPT-4o</span>
                  </label>
                  <label
                    className={`radio-card ${
                      llmType === "gemini" ? "active" : ""
                    }`}
                  >
                    <input
                      type="radio"
                      value="gemini"
                      checked={llmType === "gemini"}
                      onChange={(e) => setLlmType(e.target.value)}
                    />
                    <span className="radio-label">Google Gemini 1.5 Pro</span>
                  </label>
                  <label
                    className={`radio-card ${
                      llmType === "llamon" ? "active" : ""
                    }`}
                  >
                    <input
                      type="radio"
                      value="llamon"
                      checked={llmType === "llamon"}
                      onChange={(e) => setLlmType(e.target.value)}
                    />
                    <span className="radio-label">LLaMON</span>
                  </label>
                  <label
                    className={`radio-card ${
                      llmType === "custom" ? "active" : ""
                    }`}
                  >
                    <input
                      type="radio"
                      value="custom"
                      checked={llmType === "custom"}
                      onChange={(e) => setLlmType(e.target.value)}
                    />
                    <span className="radio-label">직접 연결 (Custom)</span>
                  </label>
                </div>
                
                {llmType === "custom" && (
                  <div className="custom-endpoint-box">
                    <label>API 엔드포인트 URL (Webhook)</label>
                    <input
                      type="text"
                      className="custom-input mt-2"
                      placeholder="https://your-server.com/api/chat"
                      value={customLlmUrl}
                      onChange={(e) => setCustomLlmUrl(e.target.value)}
                    />
                  </div>
                )}

                {llmType !== "" && (
                  <>
                    <hr className="card-divider" />

                    <h3 className="card-title">해당 엔진의 지식저장소 (RAG) 설정</h3>
                    <p className="card-desc" style={{ marginBottom: "16px" }}>
                      선택한 엔진이 답변 시 참고할 지식 기반(Knowledge Base)을 연결합니다.
                    </p>
                    
                    <div className="radio-group" style={{ gridTemplateColumns: `repeat(${getRagOptions().length}, 1fr)` }}>
                      {getRagOptions().map((option) => (
                        <label
                          key={option.value}
                          className={`radio-card ${ragType === option.value ? "active" : ""}`}
                        >
                          <input
                            type="radio"
                            value={option.value}
                            checked={ragType === option.value}
                            onChange={(e) => setRagType(e.target.value)}
                          />
                          <span className="radio-label">{option.label}</span>
                        </label>
                      ))}
                    </div>

                    {ragType === "native" && (llmType === "gpt" || llmType === "gemini" || llmType === "llamon") && (
                      <div className="custom-endpoint-box" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                        {(llmType === "gpt" || llmType === "gemini") && (
                          <div>
                            <label>
                              {llmType === "gpt" ? "Vector Store ID (또는 Assistant ID)" : 
                               llmType === "gemini" ? "Corpus Name 또는 문서 연동 ID" : 
                               "저장소 (Knowledge Base) ID"}
                            </label>
                            <input
                              type="text"
                              className="custom-input mt-2"
                              placeholder={llmType === "gpt" ? "예: vs_abc123def456 (기존 저장소 연결 시)" : 
                                           llmType === "gemini" ? "예: corpora/abc-123 (기존 저장소 연결 시)" : 
                                           "예: kb_789xyz (기존 저장소 연결 시)"}
                              value={nativeRagId}
                              onChange={(e) => setNativeRagId(e.target.value)}
                            />
                          </div>
                        )}

                        <div>
                          <label style={{ display: "block", marginBottom: "8px" }}>
                            신규 데이터 학습 (텍스트, URL, 파일)
                          </label>
                          <div 
                            className={`unified-rag-box ${isDragging ? "drag-active" : ""}`}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                          >
                            <textarea
                              className="unified-rag-textarea"
                              placeholder="학습할 텍스트나 URL을 붙여넣거나, 문서를 드래그 앤 드롭하세요. 해당 저장소로 바로 전송됩니다."
                              value={ragInput}
                              onChange={(e) => setRagInput(e.target.value)}
                              onKeyDown={handleRagKeyDown}
                            ></textarea>
                            
                            <input 
                              type="file" 
                              ref={fileInputRef}
                              style={{ display: "none" }}
                              accept=".pdf,.txt,.doc,.docx" 
                              multiple
                              onChange={handleFileChange}
                            />

                            {(ragFiles.length > 0 || ragTexts.length > 0) && (
                              <div className="rag-files-preview">
                                {ragTexts.map((item) => (
                                  <div key={item.id} className="file-chip">
                                    {item.type === 'url' ? (
                                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                                      </svg>
                                    ) : (
                                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                                      </svg>
                                    )}
                                    <span title={item.content}>{item.content}</span>
                                    <button type="button" onClick={() => removeRagText(item.id)} title="삭제">
                                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="18" y1="6" x2="6" y2="18"></line>
                                        <line x1="6" y1="6" x2="18" y2="18"></line>
                                      </svg>
                                    </button>
                                  </div>
                                ))}

                                {ragFiles.map((file) => (
                                  <div key={file.id} className="file-chip">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                                      <polyline points="13 2 13 9 20 9"></polyline>
                                    </svg>
                                    <span>{file.name}</span>
                                    <button type="button" onClick={() => removeFile(file.id)} title="삭제">
                                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="18" y1="6" x2="6" y2="18"></line>
                                        <line x1="6" y1="6" x2="18" y2="18"></line>
                                      </svg>
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}

                            <div className="unified-rag-actions">
                              <button className="btn-attach" onClick={handleFileAttach}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
                                </svg>
                                파일 첨부
                              </button>
                              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <button className="btn-add-rag" onClick={handleAddRag}>업로드</button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {ragType === "external" && (
                      <div className="custom-endpoint-box">
                        <label>외부 RAG API 엔드포인트 URL</label>
                        <input
                          type="text"
                          className="custom-input mt-2"
                          placeholder="https://your-rag-server.com/api/retrieve"
                          value={externalRagUrl}
                          onChange={(e) => setExternalRagUrl(e.target.value)}
                        />
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* 🚀 외부 도구 연동 (MCP) 카드 - 엔진이 선택되었을 때만 표시 */}
              {llmType !== "" && (
                <div className="setting-card fade-in">
                  <div className="card-header-flex" style={{ marginBottom: "16px" }}>
                    <div>
                      <h3 className="card-title">외부 도구 연동 (MCP)</h3>
                      <p className="card-desc" style={{ marginBottom: 0 }}>
                        에이전트가 특정 작업을 수행할 수 있도록 기본 도구나 커스텀 API(Model Context Protocol)를 연결하세요.
                      </p>
                    </div>
                    <button 
                      className="btn-klever-sync" 
                      onClick={() => setIsMcpModalOpen(true)}
                    >
                      + MCP 서버 추가
                    </button>
                  </div>

                  <div className="mcp-list-wrap">
                    {mcpList.map(mcp => (
                      <div key={mcp.id} className="mcp-item">
                        <div className="mcp-info">
                          <div className="mcp-name">
                            {mcp.name}
                            <span className={`mcp-badge ${mcp.type === 'built-in' ? 'built-in' : ''}`}>
                              {mcp.type === 'built-in' ? '기본 제공' : 'Custom URL'}
                            </span>
                          </div>
                          <div className="mcp-desc">{mcp.desc}</div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          {mcp.type === 'custom' && (
                            <button 
                              className="btn-icon danger" 
                              title="서버 삭제" 
                              onClick={() => setMcpList(mcpList.filter(m => m.id !== mcp.id))}
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                              </svg>
                            </button>
                          )}
                          <input
                            type="checkbox"
                            className="toggle-switch"
                            checked={mcp.active}
                            onChange={() => {
                              setMcpList(mcpList.map(m => m.id === mcp.id ? { ...m, active: !m.active } : m));
                            }}
                            title={mcp.active ? "비활성화" : "활성화"}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 🚀 에이전트 행동 지침 (태그/직접 프롬프팅) 카드 - 엔진이 선택되었을 때만 표시 */}
              {llmType !== "" && (
                <div className="setting-card fade-in">
                  <div className="card-header-flex" style={{ marginBottom: '24px' }}>
                    <div>
                      <h3 className="card-title">에이전트 행동 지침 (프롬프팅)</h3>
                      <p className="card-desc" style={{ marginBottom: '8px' }}>
                        에이전트가 답변 시 지켜야 할 핵심 규칙이나 페르소나를 설정하세요.
                      </p>
                    </div>
                    <div className="mode-toggle-group">
                      <button
                        className={`mode-toggle-btn ${promptMode === 'tag' ? 'active' : ''}`}
                        onClick={() => setPromptMode('tag')}
                      >
                        태그 모드
                      </button>
                      <button
                        className={`mode-toggle-btn ${promptMode === 'manual' ? 'active' : ''}`}
                        onClick={() => setPromptMode('manual')}
                      >
                        직접 입력
                      </button>
                    </div>
                  </div>
                  
                  {promptMode === 'tag' && (
                    <div className="prompt-tags-wrap">
                      {/* 기본 제공 태그 렌더링 */}
                      {promptTagOptions.map((tag) => {
                        const isActive = selectedTags.includes(tag.id);
                        return (
                          <div
                            key={tag.id}
                            className={`prompt-tag ${isActive ? "active" : ""}`}
                            onClick={() => togglePromptTag(tag.id)}
                          >
                            {isActive ? (
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12"></polyline>
                              </svg>
                            ) : (
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                              </svg>
                            )}
                            {tag.label}
                          </div>
                        );
                      })}

                      {/* 커스텀 추가된 태그 렌더링 */}
                      {customTags.map((tag) => {
                        const isActive = selectedTags.includes(tag.id);
                        return (
                          <div
                            key={tag.id}
                            className={`prompt-tag ${isActive ? "active" : ""}`}
                            onClick={() => togglePromptTag(tag.id)}
                          >
                            {isActive ? (
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12"></polyline>
                              </svg>
                            ) : (
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                              </svg>
                            )}
                            {tag.label}
                            <button 
                              type="button" 
                              className="prompt-tag-remove" 
                              onClick={(e) => handleRemoveCustomTag(e, tag.id)}
                              title="태그 삭제"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                              </svg>
                            </button>
                          </div>
                        );
                      })}

                      {/* 직접 태그 추가 인풋 */}
                      <div className="custom-tag-input-wrap">
                        <span style={{color: '#718096', fontSize: '13px'}}>+</span>
                        <input 
                          type="text" 
                          className="custom-tag-input" 
                          placeholder="태그 직접 입력" 
                          value={customTagInput}
                          onChange={(e) => setCustomTagInput(e.target.value)}
                          onKeyDown={handleCustomTagKeyDown}
                        />
                        <button className="btn-add-tag" onClick={handleAddCustomTag}>추가</button>
                      </div>
                    </div>
                  )}

                  {promptMode === 'manual' && (
                    <textarea
                      className="manual-prompt-textarea"
                      placeholder="당신은 KLEVER ONE의 안내 에이전트입니다..."
                      value={manualPrompt}
                      onChange={(e) => setManualPrompt(e.target.value)}
                    />
                  )}
                </div>
              )}
            </div>
          )}

          {/* =========================================
              탭 2: 에이전트 설정
          ========================================= */}
          {activeTab === "agent" && (
            <div className="tab-pane fade-in">
              <div className="setting-card" style={{ padding: "24px 28px 32px" }}>
                <div className="card-header-flex">
                  <div>
                    <h3 className="card-title">디지털휴먼 모델 선택</h3>
                    <p className="card-desc">
                      위젯에 표시될 KLEVER ONE 디지털휴먼의 외형을 선택하세요.
                    </p>
                  </div>
                  <button className="btn-klever-sync" onClick={() => window.open('https://www.klever-one.com/studio', '_blank')}>아바타 생성 및 수정</button>
                </div>

                {/* 🚀 에이전트(API 키) 선택 UI 추가 */}
                <div className="agent-select-box">
                  <label>
                    설정할 에이전트(API 키) 선택
                  </label>
                  <select
                    className="custom-select"
                    value={activeAgent.id}
                    onChange={(e) => setSelectedAgentId(Number(e.target.value))}
                  >
                    {apiKeys.map(key => (
                      <option key={key.id} value={key.id}>
                        {key.name} ({key.value.substring(0, 16)}...)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="character-grid">
                  {digitalHumans.map((human) => (
                    <div
                      key={human.id}
                      className={`character-card ${
                        activeAgent.character === human.id ? "selected" : ""
                      }`}
                      onClick={() => updateCurrentAgent("character", human.id)}
                    >
                      <div
                        className="character-bg"
                        style={{
                          background: human.image
                            ? `url('${human.image}') center top / cover no-repeat`
                            : human.bg,
                        }}
                      ></div>
                      <div className="character-overlay">
                        <div className="character-text">
                          <h4>{human.name}</h4>
                          <p>{human.desc}</p>
                        </div>
                        <button className="btn-character">
                          {activeAgent.character === human.id ? "선택됨" : "선택하기"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 🚀 언어 및 목소리 설정 카드 추가 */}
              <div className="setting-card">
                <h3 className="card-title">언어 및 목소리 설정</h3>
                <p className="card-desc">
                  해당 에이전트가 주로 구사할 언어와 음성(TTS) 톤을 선택하세요.
                </p>

                <div className="form-group-row" style={{ marginTop: "16px", flexWrap: "wrap" }}>
                  <div className="form-group" style={{ minWidth: "200px" }}>
                    <label>언어 설정</label>
                    <select
                      className="custom-select mt-2"
                      value={activeAgent.language || "ko"}
                      onChange={(e) => updateCurrentAgent("language", e.target.value)}
                    >
                      <option value="ko">한국어 (Korean)</option>
                      <option value="en">영어 (English)</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ minWidth: "200px" }}>
                    <label>에이전트 목소리 (Klever TTS)</label>
                    <select
                      className="custom-select mt-2"
                      value={activeAgent.voice || ""}
                      onChange={(e) => updateCurrentAgent("voice", e.target.value)}
                      disabled={!activeAgent.character}
                    >
                      <option value="" disabled>
                        {!activeAgent.character ? "디지털 휴먼을 먼저 선택해주세요" : "목소리를 선택해주세요"}
                      </option>
                      <option value="michael_basic">마이클(기본)</option>
                      <option value="michael_bright">마이클(밝은 목소리)</option>
                      <option value="michael_soft">마이클(부드러운 목소리)</option>
                      <option value="yuri_basic">유리(기본)</option>
                      <option value="yuri_bright">유리(밝은 목소리)</option>
                      <option value="yuri_soft">유리(부드러운 목소리)</option>
                      <option value="jennie_basic">제니 (기본)</option>
                      <option value="jennie_bright">제니 (밝은 목소리)</option>
                      <option value="jennie_soft">제니 (부드러운 목소리)</option>
                      <option value="chanu_basic">차누 (기본)</option>
                      <option value="chanu_bright">차누 (밝은 목소리)</option>
                      <option value="chanu_passionate">차누 (열정적인 목소리)</option>
                      <option value="kris_basic">크리스(기본)</option>
                      <option value="kris_bright">크리스(밝은 목소리)</option>
                      <option value="kris_soft">크리스(부드러운 목소리)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =========================================
              탭 3: 챗봇 화면 배치
          ========================================= */}
          {activeTab === "widget" && (
            <div className="tab-pane fade-in">
              <div className="setting-card">
                <h3 className="card-title">챗봇 화면 배치</h3>
                <p className="card-desc">
                  사용자 웹사이트에서 위젯이 표시될 위치를 선택하세요.
                </p>

                <div className="layout-selector">
                  {layoutOptions.map((option) => (
                    <div
                      key={option.id}
                      className={`layout-item ${
                        layout === option.id ? "selected" : ""
                      }`}
                      onClick={() => setLayout(option.id)}
                    >
                      <div className="layout-preview">
                        <div className="browser-mockup">
                          <div className={`widget-box ${option.boxClass}`}></div>
                        </div>
                      </div>
                      <span>{option.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="setting-card">
                <h3 className="card-title">동작 설정</h3>
                <div className="form-group mt-2" style={{ maxWidth: "350px" }}>
                  <label>자동 꺼짐 시간 (미사용 시)</label>
                  <div style={{ display: "flex", gap: "16px", width: "100%" }} className="mt-2">
                    <div className="input-with-unit" style={{ flex: 1 }}>
                      <input
                        type="number"
                        className="custom-input"
                        value={autoOff}
                        onChange={(e) => setAutoOff(e.target.value)}
                        min="0"
                      />
                      <span className="unit" style={{ whiteSpace: "nowrap" }}>분</span>
                    </div>
                    <div className="input-with-unit" style={{ flex: 1 }}>
                      <input
                        type="number"
                        className="custom-input"
                        value={autoOffSec}
                        onChange={(e) => setAutoOffSec(e.target.value)}
                        min="0"
                        max="59"
                      />
                      <span className="unit" style={{ whiteSpace: "nowrap" }}>초</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="setting-card">
                <h3 className="card-title">웹사이트 삽입 코드</h3>
                <p className="card-desc">
                  아래 코드를 복사하여 웹사이트의 <code>&lt;head&gt;</code> 또는 <code>&lt;body&gt;</code> 태그 내에 붙여넣으세요. 설정하신 값들이 적용된 위젯이 즉시 표시됩니다.
                </p>
                <div className="code-container">
                  <button className="btn-copy-code" onClick={handleCopyEmbedCode}>복사하기</button>
                  <pre>{getEmbedCode()}</pre>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <BasicChatbot 
        unrealurl = {import.meta.env.VITE_MATCHMAKER}
        layout={layout}
        autoOff={autoOff * 60 + autoOffSec}
        avatarnum={currentAvatarNum}
      />

      {/* 🚀 저장 확인 커스텀 모달 */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h2 className="modal-title">저장하시겠습니까?</h2>
            <p className="modal-desc">
              설정하신 에이전트 및 위젯 정보가<br/>라이브 서버에 즉시 적용됩니다.
            </p>
            <div className="modal-buttons">
              <button className="btn-outline" onClick={cancelSave}>취소</button>
              <button className="btn-primary" onClick={confirmSave}>적용</button>
            </div>
          </div>
        </div>
      )}

      {/* 🚀 나가기 확인 커스텀 모달 */}
      {isExitModalOpen && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-logo">
              <span>KLEVER ONE</span>
            </div>
            <p className="modal-desc">
              클레버원 홈페이지로 돌아가시겠어요?<br/>저장하지 않은 변경사항은 사라질 수 있습니다.
            </p>
            <div className="modal-buttons">
              <button className="btn-outline" onClick={cancelExit}>취소</button>
              <button className="btn-danger" onClick={confirmExit}>나가기</button>
            </div>
          </div>
        </div>
      )}

      {/* 🚀 신규 키 발급 확인 모달 */}
      {isNewKeyModalOpen && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h2 className="modal-title">신규 키 발급</h2>
            <p className="modal-desc" style={{ marginBottom: "16px" }}>
              새로 발급할 에이전트 키의 이름을 지정하세요.
            </p>
            <input
              type="text"
              className="custom-input"
              style={{ marginBottom: "24px", textAlign: "center" }}
              value={newKeyNameInput}
              onChange={(e) => setNewKeyNameInput(e.target.value)}
              placeholder="예: 영업용 챗봇 키"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") confirmGenerateNewKey();
              }}
            />
            <div className="modal-buttons">
              <button className="btn-outline" onClick={() => setIsNewKeyModalOpen(false)}>취소</button>
              <button className="btn-primary" onClick={confirmGenerateNewKey}>발급하기</button>
            </div>
          </div>
        </div>
      )}

      {/* 🚀 신규 MCP 서버 추가 모달 */}
      {isMcpModalOpen && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h2 className="modal-title">MCP 서버 추가</h2>
            <p className="modal-desc" style={{ marginBottom: "16px" }}>
              연동할 외부 커스텀 서버의 정보를 입력하세요.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px", textAlign: "left" }}>
              <div>
                <label style={{ fontSize: "12px", color: "#a0aec0", marginBottom: "4px", display: "block" }}>서버 이름</label>
                <input
                  type="text"
                  className="custom-input"
                  value={newMcpName}
                  onChange={(e) => setNewMcpName(e.target.value)}
                  placeholder="예: 사내 예약 시스템"
                  autoFocus
                />
              </div>
              <div>
                <label style={{ fontSize: "12px", color: "#a0aec0", marginBottom: "4px", display: "block" }}>서버 URL</label>
                <input
                  type="text"
                  className="custom-input"
                  value={newMcpUrl}
                  onChange={(e) => setNewMcpUrl(e.target.value)}
                  placeholder="https://api.company.com/mcp"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") confirmAddMcp();
                  }}
                />
              </div>
            </div>
            <div className="modal-buttons">
              <button className="btn-outline" onClick={() => setIsMcpModalOpen(false)}>취소</button>
              <button className="btn-primary" onClick={confirmAddMcp}>추가하기</button>
            </div>
          </div>
        </div>
      )}

      {/* 🚀 공통 Alert 모달 */}
      {alertMessage && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h2 className="modal-title">알림</h2>
            <p className="modal-desc" style={{ marginBottom: "24px" }}>
              {alertMessage}
            </p>
            <div className="modal-buttons">
              <button className="btn-primary" onClick={() => setAlertMessage("")}>확인</button>
            </div>
          </div>
        </div>
      )}

      {/* 🚀 삭제 확인 모달 */}
      {deleteTargetId && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h2 className="modal-title">키 삭제</h2>
            <p className="modal-desc" style={{ marginBottom: "24px" }}>
              이 API 키를 삭제하시겠습니까?<br/>연결된 에이전트가 작동하지 않을 수 있습니다.
            </p>
            <div className="modal-buttons">
              <button className="btn-outline" onClick={() => setDeleteTargetId(null)}>취소</button>
              <button className="btn-danger" onClick={confirmDeleteKey}>삭제</button>
            </div>
          </div>
        </div>
      )}

      {/* 🚀 재발급 확인 모달 */}
      {reissueTargetId && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h2 className="modal-title">키 재발급</h2>
            <p className="modal-desc" style={{ marginBottom: "24px" }}>
              이 API 키의 재발급을 신청하시겠습니까?<br/>새로운 키가 발급되면 기존 키로 연결된 에이전트는 더 이상 작동하지 않습니다.
            </p>
            <div className="modal-buttons">
              <button className="btn-outline" onClick={() => setReissueTargetId(null)}>취소</button>
              <button className="btn-primary" onClick={confirmReissueKey}>재발급</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}