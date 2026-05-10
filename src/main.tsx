import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/tokens.css";
import "./styles.css";
import "./styles/today.css";

// 깜빡임 방지: React mount 전에 저장된 테마를 적용한다.
try {
  const saved = window.localStorage.getItem("awm-theme");
  if (saved === "dark" || saved === "light") {
    document.documentElement.setAttribute("data-theme", saved);
  }
} catch {
  // localStorage 불가 환경 — 무음
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
