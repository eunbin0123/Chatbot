import { useState } from "react";

export function PasswordInput({ value, onChange, placeholder, style = {} }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
      <input
        type={show ? "text" : "password"}
        className="custom-input"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        style={{
          backgroundColor: "rgba(255,255,255,0.02)",
          border: "1px solid #4a5568",
          borderRadius: "12px",
          color: "#cbd5e0",
          padding: "10px 44px 10px 14px",
          width: "100%",
          height: "48px",
          fontSize: "13px",
          outline: "none",
          boxSizing: "border-box",
          ...style,
        }}
      />
      <button
        type="button"
        onClick={() => setShow((prev) => !prev)}
        style={{ position: "absolute", right: "12px", background: "none", border: "none", cursor: "pointer", color: show ? "#00c6ff" : "#718096", display: "flex", alignItems: "center", padding: 0, transition: "color 0.2s" }}
      >
        {show ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
            <line x1="1" y1="1" x2="23" y2="23"/>
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
        )}
      </button>
    </div>
  );
}
