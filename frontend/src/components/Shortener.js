import { useState } from "react";
import { API_URL } from "../App";

export default function Shortener({ onShorten }) {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShorten = async () => {
    setError(""); setResult(null); setCopied(false);
    if (!url.trim()) return setError("Please enter a URL");
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      return setError("URL must start with http:// or https://");
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/shorten`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to shorten");
      setResult(data);
      setUrl("");
      onShorten();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const copy = () => {
    navigator.clipboard.writeText(result.short_url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <h1 style={{ fontSize: "22px", fontWeight: "600", color: "#1c2833", marginBottom: "6px" }}>
        Shorten a URL
      </h1>
      <p style={{ color: "#5d6d7e", fontSize: "14px", marginBottom: "24px" }}>
        Paste any long URL and get a short link instantly
      </p>

      {/* Input */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
        <input
          value={url}
          onChange={e => setUrl(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleShorten()}
          placeholder="https://example.com/very/long/url"
          style={{
            flex: 1, padding: "12px 14px", borderRadius: "8px",
            border: "0.5px solid #d0d5db", fontSize: "14px",
            outline: "none", background: "#fff",
          }}
        />
        <button
          onClick={handleShorten}
          disabled={loading}
          style={{
            padding: "12px 22px", borderRadius: "8px", border: "none",
            background: loading ? "#aaa" : "#1a5276", color: "#fff",
            fontWeight: "600", fontSize: "14px", cursor: loading ? "not-allowed" : "pointer",
            whiteSpace: "nowrap",
          }}
        >
          {loading ? "Shortening..." : "Shorten"}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          padding: "10px 14px", borderRadius: "8px",
          background: "#faece7", color: "#712b13",
          fontSize: "13px", marginBottom: "16px"
        }}>
          {error}
        </div>
      )}

      {/* Result */}
      {result && (
        <div style={{
          background: "#fff", border: "0.5px solid #d0d5db",
          borderRadius: "12px", padding: "20px",
        }}>
          <p style={{ fontSize: "12px", color: "#5d6d7e", marginBottom: "8px", textTransform: "uppercase", letterSpacing: ".05em" }}>
            Your short link
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
            <a href={result.short_url} target="_blank" rel="noreferrer"
              style={{ fontSize: "18px", fontWeight: "600", color: "#1a5276", textDecoration: "none" }}>
              {result.short_url}
            </a>
            <button onClick={copy} style={{
              padding: "4px 12px", borderRadius: "6px", border: "0.5px solid #d0d5db",
              background: copied ? "#e1f5ee" : "#fff", color: copied ? "#085041" : "#555",
              fontSize: "12px", cursor: "pointer",
            }}>
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <div style={{ fontSize: "13px", color: "#5d6d7e" }}>
            <span style={{ fontWeight: "500", color: "#1c2833" }}>Original: </span>
            <span style={{
              display: "inline-block", maxWidth: "420px",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              verticalAlign: "bottom"
            }}>
              {result.long_url}
            </span>
          </div>
          <div style={{
            marginTop: "12px", padding: "8px 12px", borderRadius: "6px",
            background: "#f4f6f8", fontSize: "12px", color: "#5d6d7e"
          }}>
            Short code: <strong style={{ color: "#1c2833" }}>{result.code}</strong>
            {" · "}
            View stats: <a href={`${API_URL}/stats/${result.code}`} target="_blank" rel="noreferrer"
              style={{ color: "#1a5276" }}>
              /stats/{result.code}
            </a>
          </div>
        </div>
      )}

      {/* Info cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "10px", marginTop: "28px" }}>
        {[
          ["⚡", "Serverless", "Runs on AWS Lambda — zero servers"],
          ["📊", "Analytics", "Tracks clicks, devices, countries"],
          ["🔗", "Permanent", "Links stored in DynamoDB forever"],
        ].map(([icon, title, desc]) => (
          <div key={title} style={{
            background: "#fff", border: "0.5px solid #e0e0e0",
            borderRadius: "10px", padding: "14px",
          }}>
            <div style={{ fontSize: "20px", marginBottom: "6px" }}>{icon}</div>
            <p style={{ fontWeight: "600", fontSize: "13px", color: "#1c2833", marginBottom: "3px" }}>{title}</p>
            <p style={{ fontSize: "12px", color: "#5d6d7e" }}>{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}