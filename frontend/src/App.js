import { useState, useEffect } from "react";
import Shortener from "./components/Shortener";
import Dashboard from "./components/Dashboard";
import "./App.css";

const API_URL = "https://2m585qklnc.execute-api.us-east-1.amazonaws.com";

export { API_URL };

function App() {
  const [tab, setTab] = useState("shorten");
  const [refresh, setRefresh] = useState(0);

  const triggerRefresh = () => setRefresh(r => r + 1);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f4f6f8",
      fontFamily: "system-ui, -apple-system, sans-serif",
    }}>
      {/* Header */}
      <div style={{
        background: "#1a5276",
        padding: "0 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: "56px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "20px" }}>⚡</span>
          <span style={{ color: "#fff", fontWeight: "600", fontSize: "16px" }}>
            URL Shortener
          </span>
          <span style={{
            fontSize: "11px", padding: "2px 8px", borderRadius: "20px",
            background: "#154360", color: "#85c1e9", marginLeft: "4px"
          }}>
            AWS Serverless
          </span>
        </div>
        <div style={{ display: "flex", gap: "4px" }}>
          {["shorten", "dashboard"].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: "6px 16px", borderRadius: "6px", border: "none",
              cursor: "pointer", fontSize: "13px", fontWeight: "500",
              background: tab === t ? "#fff" : "transparent",
              color: tab === t ? "#1a5276" : "#aed6f1",
              transition: "all .15s",
            }}>
              {t === "shorten" ? "Shorten" : "Dashboard"}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "32px 20px" }}>
        {tab === "shorten"
          ? <Shortener onShorten={triggerRefresh} />
          : <Dashboard refresh={refresh} />
        }
      </div>

      <p style={{
        textAlign: "center", fontSize: "12px", color: "#aaa",
        paddingBottom: "24px"
      }}>
        Built by Amali Emmanuel · Lambda · API Gateway · DynamoDB
      </p>
    </div>
  );
}

export default App;