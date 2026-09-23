
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function CaseDetails() {
  const { caseId } = useParams();
  const navigate = useNavigate();

  const [caseData, setCaseData] = useState(null);
  const [evidence, setEvidence] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showEvidenceForm, setShowEvidenceForm] = useState(false);
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [files, setFiles] = useState([]);
  const [addingEvidence, setAddingEvidence] = useState(false);

  useEffect(() => {
    const fetchCase = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:5000/api/cases/${caseId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          setError(data.message || "Failed to load case");
          return;
        }

        setCaseData(data.case);
        setEvidence(data.evidence);
      } catch (error) {
        setError("Unable to connect to server");
      } finally {
        setLoading(false);
      }
    };

    fetchCase();
  }, [caseId, navigate]);

  const handleAddEvidence = async (e) => {
    e.preventDefault();

    if (!text.trim() && !url.trim() && files.length === 0) {
      return;
    }

    const token = localStorage.getItem("token");
    const formData = new FormData();

    if (text.trim()) {
      formData.append("text", text);
    }

    if (url.trim()) {
      formData.append("url", url);
    }

    files.forEach((file) => {
      formData.append("files", file);
    });

    setAddingEvidence(true);
    setError("");

    try {
      const response = await fetch(
        `http://localhost:5000/api/cases/${caseId}/evidence`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to add evidence");
        return;
      }

      setEvidence((prevEvidence) => [
        ...prevEvidence,
        ...data.evidence,
      ]);

      setText("");
      setUrl("");
      setFiles([]);
      setShowEvidenceForm(false);
    } catch (error) {
      setError("Unable to connect to server");
    } finally {
      setAddingEvidence(false);
    }
  };

  if (loading) {
    return (
      <div className="case-details-loading">
        Loading investigation...
      </div>
    );
  }

  if (error && !caseData) {
    return (
      <div className="case-details-loading">
        <p>{error}</p>

        <button onClick={() => navigate("/dashboard")}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="case-details">
      <nav className="dashboard-nav">
        <div className="dashboard-logo">
          <span className="logo-mark">S</span>
          <span>SafeGuard</span>
        </div>

        <button
          className="logout-btn"
          onClick={() => {
            localStorage.removeItem("token");
            navigate("/login");
          }}
        >
          Logout
        </button>
      </nav>

      <main className="case-details-content">
        <button
          className="back-btn"
          onClick={() => navigate("/dashboard")}
        >
          ← Back to investigations
        </button>

        <section className="case-header">
          <div>
            <span className="case-status">
              {caseData.status}
            </span>

            <h1>{caseData.title}</h1>

            <p>
              {caseData.description ||
                "No description provided."}
            </p>
          </div>

          <div className="case-date">
            Created{" "}
            {new Date(
              caseData.created_at
            ).toLocaleDateString()}
          </div>
        </section>

        {error && (
          <div className="dashboard-error">
            {error}
          </div>
        )}

        <section className="evidence-section">
          <div className="section-heading">
            <div>
              <h2>Evidence</h2>

              <p>
                {evidence.length}{" "}
                {evidence.length === 1
                  ? "item"
                  : "items"}{" "}
                connected to this investigation.
              </p>
            </div>

            <button
              className="new-case-btn"
              onClick={() => setShowEvidenceForm(true)}
            >
              + Add Evidence
            </button>
          </div>

          {evidence.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">+</div>

              <h2>No evidence added yet</h2>

              <p>
                Add screenshots, messages, URLs or documents
                to begin the investigation.
              </p>

              <button
                className="new-case-btn"
                onClick={() => setShowEvidenceForm(true)}
              >
                Add Evidence
              </button>
            </div>
          ) : (
            <div className="investigation-timeline">
            {evidence.map((item) => {
               const extracted = item.extracted_data;

               return (
                  <div
                  className="timeline-item"
                  key={item.evidence_id}
                  >
                  <div className="timeline-dot" />

                  <div className="timeline-content">
                     <div className="timeline-top">
                        <span className="evidence-type">
                        {item.type}
                        </span>

                        <span className="timeline-date">
                        {new Date(item.created_at).toLocaleString()}
                        </span>
                     </div>

                     {item.content && (
                        <p className="timeline-text">
                        {item.content}
                        </p>
                     )}

                     {item.file_path && (
                        <p className="file-name">
                        📎 {item.file_path.split("\\").pop()}
                        </p>
                     )}

                     {extracted && (
                        <div className="extracted-info">
                        <h4>AI extracted information</h4>

                        {extracted.companies?.length > 0 && (
                           <p>
                              <strong>Companies:</strong>{" "}
                              {extracted.companies.join(", ")}
                           </p>
                        )}

                        {extracted.people?.length > 0 && (
                           <p>
                              <strong>People:</strong>{" "}
                              {extracted.people.join(", ")}
                           </p>
                        )}

                        {extracted.amounts?.length > 0 && (
                           <p>
                              <strong>Amounts:</strong>{" "}
                              {extracted.amounts.join(", ")}
                           </p>
                        )}

                        {extracted.dates?.length > 0 && (
                           <p>
                              <strong>Dates:</strong>{" "}
                              {extracted.dates.join(", ")}
                           </p>
                        )}

                        {extracted.claims?.length > 0 && (
                           <div>
                              <strong>Claims:</strong>

                              <ul>
                              {extracted.claims.map((claim, index) => (
                                 <li key={index}>{claim}</li>
                              ))}
                              </ul>
                           </div>
                        )}

                        {extracted.urls?.length > 0 && (
                           <p>
                              <strong>URLs:</strong>{" "}
                              {extracted.urls.join(", ")}
                           </p>
                        )}
                        </div>
                     )}
                  </div>
                  </div>
               );
            })}
            </div>
          )}
        </section>
      </main>

      {showEvidenceForm && (
        <div
          className="modal-overlay"
          onClick={() => setShowEvidenceForm(false)}
        >
          <div
            className="case-modal evidence-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <p className="modal-eyebrow">
                  CASE EVIDENCE
                </p>

                <h2>Add Evidence</h2>

                <p>
                  Add anything that may help understand
                  what happened.
                </p>
              </div>

              <button
                className="modal-close"
                onClick={() => setShowEvidenceForm(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAddEvidence}>
              <label>Message or text</label>

              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste a suspicious message, email or other text..."
                rows="5"
              />

              <label>URL</label>

              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
              />

              <label>Screenshots or files</label>

              <input
                type="file"
                multiple
                onChange={(e) =>
                  setFiles(Array.from(e.target.files))
                }
              />

              {files.length > 0 && (
                <div className="selected-files">
                  {files.map((file) => (
                    <span key={file.name}>
                      {file.name}
                    </span>
                  ))}
                </div>
              )}

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowEvidenceForm(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="create-btn"
                  disabled={addingEvidence}
                >
                  {addingEvidence
                    ? "Adding..."
                    : "Add Evidence"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CaseDetails;

