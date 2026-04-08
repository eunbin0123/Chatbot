import { useState } from 'react'
import './App.css'
import React from 'react';
import Customize from './Customize'
import FloatingWidget from './FloatingWidget';

export default function App() {
  return (
    <div className="app-container">
      {/* 2. UI 설정을 위한 Customize 컴포넌트 */}
      <div className="customize-layer">
        <Customize />
      </div>

      {/* 3. 항상 위에 떠 있는 FloatingWidget */}
      <FloatingWidget />
    </div>
  );
}