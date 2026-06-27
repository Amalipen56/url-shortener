import { useState, useEffect } from "react";
import { API_URL } from "../App";

export default function Dashboard({ refresh }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_URL}/stats`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [refresh]);

  const loadStats = async (code) => {
    setSelected(code); setStats(null);
    const res = await fetch(`${API_URL}/stats/${code}`);
    const d = await res.json();
    setStats(d);
  };

  if (loading) return (
    <div style={{ textAlign: "center", padding: "60px", color: "#5d6d7e" }}>
      Loading dashboard...
    </div>
  );

  if (!data || data.total_urls === 0) return (
    <div style={{
      textAlign: "center", padding: "60px",
      background: "#fff", borderRadius: "12px",
      border: "0.5px solid #e0e0e0",
    }}>
      <p style={{ fontSize: "32px", marginBottom: "12px" }}>🔗</p>
      <p style={{ color: "#1c2833", fontWeight: "500", marginBottom: "6px" }}>No links yet</p>
      <p style={{ color: "#5d6d7e", fontSize: "14px" }}>Go to Shorten to create your first link</p>
    </div>
  );

  return (
    <div>
      <h1 style={{ fontSize: "22px", fontWeight: "600", color: "#1c2833", marginBottom: "6px" }}>
        Analytics Dashboard
      </h1>
      <p style={{ color: "#5d6d7e", fontSize: "14px", marginBottom: "24px" }}>
        Click any link to see detailed stats
      </p>

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: "10px", marginBottom: "20px" }}>
        {[
          ["Total Links", data.total_urls],
          ["Total Clicks", data.total_clicks],
        ].map(([label, value]) => (
          <div key={label} style={{
            background: "#fff", border: "0.5px solid #e0e0e0",
            borderRadius: "10px", padding: "18px 20px",
          }}>
            <p style={{ fontSize: "12px", color: "#5d6d7e", marginBottom: "4px", textTransform: "uppercase", letterSpacing: ".05em" }}>
              {label}
            </p>
            <p style={{ fontSize: "28px", fontWeight: "600", color: "#1a5276" }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Links list */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "20px" }}>
        {data.urls.map(u => (
          <div key={u.code}
            onClick={() => loadStats(u.code)}
            style={{
              background: "#fff", border: `0.5px solid ${selected === u.code ? "#1a5276" : "#e0e0e0"}`,
              borderRadius: "10px", padding: "14px 16px", cursor: "pointer",
              transition: "border-color .15s",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: "600", color: "#1a5276", fontSize: "14px", marginBottom: "3px" }}>
                  /{u.code}
                </p>
                <p style={{
                  fontSize: "12px", color: "#5d6d7e",
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                  {u.long_url}
                </p>
              </div>
              <div style={{ textAlign: "right", marginLeft: "16px", flexShrink: 0 }}>
                <p style={{ fontWeight: "600", color: "#1c2833", fontSize: "18px" }}>{u.click_count}</p>
                <p style={{ fontSize: "11px", color: "#5d6d7e" }}>clicks</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed stats panel */}
      {selected && (
        <div style={{
          background: "#fff", border: "0.5px solid #e0e0e0",
          borderRadius: "12px", padding: "20px",
        }}>
          <p style={{ fontWeight: "600", color: "#1c2833", marginBottom: "14px", fontSize: "15px" }}>
            Stats for /{selected}
          </p>

          {!stats ? (
            <p style={{ color: "#5d6d7e", fontSize: "13px" }}>Loading...</p>
          ) : (
            <div>
              {/* Device breakdown */}
              {Object.keys(stats.devices || {}).length > 0 && (
                <div style={{ marginBottom: "16px" }}>
                  <p style={{ fontSize: "12px", color: "#5d6d7e", marginBottom: "8px", textTransform: "uppercase", letterSpacing: ".05em" }}>
                    Devices
                  </p>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {Object.entries(stats.devices).map(([device, count]) => (
                      <div key={device} style={{
                        padding: "6px 14px", borderRadius: "20px",
                        background: "#e6f1fb", color: "#0c447c", fontSize: "13px"
                      }}>
                        {device}: <strong>{count}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Country breakdown */}
              {Object.keys(stats.countries || {}).length > 0 && (
                <div style={{ marginBottom: "16px" }}>
                  <p style={{ fontSize: "12px", color: "#5d6d7e", marginBottom: "8px", textTransform: "uppercase", letterSpacing: ".05em" }}>
                    Countries
                  </p>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {Object.entries(stats.countries).map(([country, count]) => (
                      <div key={country} style={{
                        padding: "6px 14px", borderRadius: "20px",
                        background: "#eaf3de", color: "#27500a", fontSize: "13px"
                      }}>
                        {country}: <strong>{count}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent clicks */}
              {stats.recent_clicks?.length > 0 && (
                <div>
                  <p style={{ fontSize: "12px", color: "#5d6d7e", marginBottom: "8px", textTransform: "uppercase", letterSpacing: ".05em" }}>
                    Recent clicks
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    {stats.recent_clicks.map((c, i) => (
                      <div key={i} style={{
                        display: "flex", justifyContent: "space-between",
                        fontSize: "12px", padding: "6px 10px",
                        background: "#f4f6f8", borderRadius: "6px",
                      }}>
                        <span style={{ color: "#5d6d7e" }}>
                          {new Date(c.clicked_at).toLocaleString()}
                        </span>
                        <span style={{ color: "#1c2833" }}>
                          {c.device} · {c.country}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {stats.total_clicks === 0 && (
                <p style={{ color: "#5d6d7e", fontSize: "13px" }}>
                  No clicks yet — share the short link to see analytics here
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}