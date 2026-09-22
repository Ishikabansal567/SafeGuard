import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
          setError(data.message || "Failed to load cases");
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="dashboard">
      <nav className="dashboard-nav">
        <div className="logo">SafeGuard</div>

        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </nav>

      <main className="dashboard-content">
        <div className="dashboard-header">
          <div>
            <h1>Your Investigations</h1>
            <p>
              Manage and investigate your suspicious cases.
            </p>
          </div>

          <button className="new-case-btn">
            + New Investigation
          </button>
        </div>

        {loading && <p>Loading investigations...</p>}

        {error && <p className="auth-error">{error}</p>}

        {!loading && !error && cases.length === 0 && (
          <div className="empty-state">
            <h2>No investigations yet</h2>
            <p>
              Create your first investigation to start analyzing
              suspicious evidence.
            </p>

            <button className="new-case-btn">
              Create Investigation
            </button>
          </div>
        )}

        {!loading && cases.length > 0 && (
          <div className="case-grid">
            {cases.map((item) => (
              <div className="case-card" key={item.case_id}>
                <span>{item.status}</span>

                <h2>{item.title}</h2>

                <p>
                  {item.description || "No description provided."}
                </p>

                <small>
                  Created{" "}
                  {new Date(item.created_at).toLocaleDateString()}
                </small>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Dashboard;