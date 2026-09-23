
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const fetchCases = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await fetch(
          "http://localhost:5000/api/cases",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          setError(data.message || "Failed to load investigations");
          return;
        }

        setCases(data.cases);
      } catch (error) {
        setError("Unable to connect to server");
      } finally {
        setLoading(false);
      }
    };

    fetchCases();
  }, [navigate]);

  const handleCreateCase = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    if (!title.trim()) {
      return;
    }

    setCreating(true);
    setError("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/cases",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title,
            description,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to create investigation");
        return;
      }

      setCases((prevCases) => [data.case, ...prevCases]);

      setTitle("");
      setDescription("");
      setShowForm(false);
    } catch (error) {
      setError("Unable to connect to server");
    } finally {
      setCreating(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="dashboard">
      <nav className="dashboard-nav">
        <div className="dashboard-logo">
          <span className="logo-mark">S</span>
          <span>SafeGuard</span>
        </div>

        <button
          onClick={handleLogout}
          className="logout-btn"
        >
          Logout
        </button>
      </nav>

      <main className="dashboard-content">
        <section className="dashboard-header">
          <div>
            <p className="dashboard-eyebrow">
              INVESTIGATION WORKSPACE
            </p>

            <h1>Your Investigations</h1>

            <p className="dashboard-description">
              Organize suspicious activity, review evidence,
              and understand what happened.
            </p>
          </div>

          <button
            className="new-case-btn"
            onClick={() => setShowForm(true)}
          >
            <span>+</span>
            New Investigation
          </button>
        </section>

        {error && (
          <div className="dashboard-error">
            {error}
          </div>
        )}

        {loading && (
          <div className="dashboard-loading">
            Loading your investigations...
          </div>
        )}

        {!loading && !error && cases.length === 0 && (
          <section className="empty-state">
            <div className="empty-icon">
              +
            </div>

            <h2>Start your first investigation</h2>

            <p>
              Create an investigation and bring screenshots,
              messages, links and documents together in one place.
            </p>

            <button
              className="new-case-btn"
              onClick={() => setShowForm(true)}
            >
              Create Investigation
            </button>
          </section>
        )}

        {!loading && cases.length > 0 && (
          <section>
            <div className="section-heading">
              <h2>Recent investigations</h2>

              <span>
                {cases.length}{" "}
                {cases.length === 1 ? "case" : "cases"}
              </span>
            </div>

            <div className="case-grid">
              {cases.map((item) => (
                <article
                  className="case-card"
                  key={item.case_id}
                  onClick={() => navigate(`/cases/${item.case_id}`)}
                >
                  <div className="case-card-top">
                    <span className="case-status">
                      {item.status}
                    </span>

                    <span className="case-arrow">
                      →
                    </span>
                  </div>

                  <h3>{item.title}</h3>

                  <p>
                    {item.description ||
                      "No description provided."}
                  </p>

                  <div className="case-card-footer">
                    <span>
                      Created{" "}
                      {new Date(
                        item.created_at
                      ).toLocaleDateString()}
                    </span>

                    <span>
                      Investigation
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </main>

      {showForm && (
        <div
          className="modal-overlay"
          onClick={() => setShowForm(false)}
        >
          <div
            className="case-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <p className="modal-eyebrow">
                  NEW CASE
                </p>

                <h2>Create Investigation</h2>

                <p>
                  Start by giving your investigation a name
                  and some context.
                </p>
              </div>

              <button
                className="modal-close"
                onClick={() => setShowForm(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateCase}>
              <label>Investigation title</label>

              <input
                type="text"
                value={title}
                onChange={(e) =>
                  setTitle(e.target.value)
                }
                placeholder="e.g. Suspicious payment request"
                required
              />

              <label>Description</label>

              <textarea
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
                }
                placeholder="Briefly describe what happened..."
                rows="5"
              />

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="create-btn"
                  disabled={creating}
                >
                  {creating
                    ? "Creating..."
                    : "Create Investigation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;

