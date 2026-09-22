import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";

function Home() {
  return (
    <div className="app">
      <nav className="navbar">
        <div className="logo">SafeGuard</div>

        <div className="nav-actions">
          <a href="/login" className="login-btn">
            Login
          </a>

          <a href="/register" className="primary-btn">
            Get Started
          </a>
        </div>
      </nav>

      <main>
        <section className="hero">
          <span className="hero-badge">
            AI-powered scam investigation
          </span>

          <h1>
            Investigate suspicious
            <br />
            messages with confidence.
          </h1>

          <p>
            Bring screenshots, messages, links, invoices and
            payment requests together into one clear investigation.
          </p>

          <a href="/register" className="hero-btn">
            Start an Investigation
          </a>
        </section>

        <section className="features">
          <div className="features-header">
            <h2>From scattered evidence to a clear story.</h2>

            <p>
              SafeGuard helps you organize suspicious activity,
              understand what happened, and identify what should
              be verified next.
            </p>
          </div>

          <div className="feature-grid">
            <div className="feature-card">
              <span className="feature-number">01</span>
              <h3>Collect</h3>
              <p>
                Add screenshots, messages, URLs and documents
                to one investigation.
              </p>
            </div>

            <div className="feature-card">
              <span className="feature-number">02</span>
              <h3>Connect</h3>
              <p>
                Keep related evidence together and build a
                chronological investigation timeline.
              </p>
            </div>

            <div className="feature-card">
              <span className="feature-number">03</span>
              <h3>Understand</h3>
              <p>
                Identify suspicious signals and understand
                what you should verify next.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;