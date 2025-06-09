import { useState, useEffect } from "react";
import { Loader, Icon } from "lucide-react";
import { soccerBall, soccerPitch } from "@lucide/lab";
import "./style.css";

function FileBrowser() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError("");
    fetch(`/api/list`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((data) => {
        setItems(data.items || []);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, []);

  function openImage(key) {
    setPreview(key);
  }
  function closePreview() {
    setPreview(null);
  }

  return (
    <div className="soccer-browser">
      <h1>
        <span className="soccer-icon" style={{ verticalAlign: "middle", marginRight: "10px" }}>
          <Icon iconNode={soccerBall} size={48} />
        </span>
        Futi 2.0
      </h1>
      <h2>
        Reservas na Orla
      </h2>
      {preview && (
        <div className="modal-overlay" onClick={closePreview}>
          <div className="modal-content">
            <img src={`/api/image?key=${encodeURIComponent(preview)}`} alt={preview} />
          </div>
        </div>
      )}
      <div className="soccer-container">
        {loading && (
          <div className="loading">
            <Loader size={32} style={{ marginRight: 8 }} /> Carregando...
          </div>
        )}
        {error && <div className="error">{error}</div>}

        {/* Images as thumbnails grid */}
        <div className="image-grid">
          {items
            .filter((i) => i.type === "file")
            .map((item) => (
              <div key={item.key} className="image-card" onClick={() => openImage(item.key)}>
                <div className="image-preview">
                  <img
                    src={`/api/image?key=${encodeURIComponent(item.key)}`}
                    alt={item.name}
                    loading="lazy"
                  />
                </div>
                <div className="image-info">
                  <Icon iconNode={soccerPitch} size={32} />
                  {item.name}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

function App() {
  return <FileBrowser />;
}

export default App;
