"use client";

import { useState, useEffect } from "react";
import "./guide.css";

interface GuideClientProps {
  content: string;
}

export default function GuideClient({ content }: GuideClientProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // 檢查認證狀態
  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const res = await fetch("/api/guide");
      const data = await res.json();
      setIsAuthenticated(data.authenticated);
    } catch {
      setIsAuthenticated(false);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/guide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (data.success) {
        setIsAuthenticated(true);
      } else {
        setError(data.error || "密碼錯誤");
      }
    } catch {
      setError("登入失敗，請稍後再試");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/guide", { method: "DELETE" });
    setIsAuthenticated(false);
    setPassword("");
  }

  // 載入中
  if (isAuthenticated === null) {
    return (
      <div className="guide-loading">
        <div className="guide-spinner"></div>
      </div>
    );
  }

  // 未認證 - 顯示登入表單
  if (!isAuthenticated) {
    return (
      <div className="guide-login">
        <div>
          <div className="guide-login-card">
            <div className="guide-login-icon">
              <svg
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h1 className="guide-login-title">系統說明書</h1>
            <p className="guide-login-subtitle">請輸入密碼以查看內容</p>

            <form onSubmit={handleLogin}>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="請輸入密碼"
                className="guide-login-input"
                autoFocus
              />

              {error && (
                <p className="guide-login-error">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading || !password}
                className="guide-login-button"
              >
                {loading ? "驗證中..." : "進入"}
              </button>
            </form>
          </div>

          <p className="guide-login-footer">
            MB Packaging 內部文件
          </p>
        </div>
      </div>
    );
  }

  // 已認證 - 顯示說明書內容
  return (
    <div className="guide-container">
      {/* 頂部導航 */}
      <header className="guide-header">
        <div className="guide-header-inner">
          <div className="guide-header-left">
            <a href="/" className="guide-header-back">
              ← 返回首頁
            </a>
            <span className="guide-header-divider">|</span>
            <h1 className="guide-header-title">系統說明書</h1>
          </div>
          <button
            onClick={handleLogout}
            className="guide-header-logout"
          >
            登出
          </button>
        </div>
      </header>

      {/* 內容區域 */}
      <main className="guide-main">
        <article
          className="guide-content"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </main>

      {/* 底部 */}
      <footer className="guide-footer">
        <div className="guide-footer-inner">
          <p>MB Packaging 系統說明書</p>
          <p>最後更新：2025/11/26</p>
        </div>
      </footer>
    </div>
  );
}
