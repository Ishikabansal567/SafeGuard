import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function CaseDetails() {
  const { caseId } = useParams();
  const navigate = useNavigate();

  const [caseData, setCaseData] = useState(null);
  const [evidence, setEvidence] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  if (loading) {
    return (
      <div className="case-details-loading">
        Loading investigation...
      </div>
    );
  }

  if (error) {
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

        <section className="evidence-section">
          <div className="section-heading">
            <div>
              <h2>Evidence</h2>
              <p>
                Screenshots, messages, links and files connected
                to this investigation.
              </p>
            </div>

            <button className="new-case-btn">
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
            </div>
          ) : (
            <div className="evidence-list">
              {evidence.map((item) => (
                <div
                  className="evidence-card"
                  key={item.evidence_id}
                >
                  <div>
                    <span className="evidence-type">
                      {item.type}
                    </span>

                    {item.content && (
                      <p>{item.content}</p>
                    )}

                    {item.file_path && (
                      <p>
                        📎 {item.file_path}
                      </p>
                    )}
                  </div>

                  <small>
                    {new Date(
                      item.created_at
                    ).toLocaleString()}
                  </small>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default CaseDetails;