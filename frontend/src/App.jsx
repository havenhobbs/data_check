import { useState } from "react";
import "./App.css";
import ValidationPage from "./pages/ValidationPage.jsx";
import Rules from './pages/Rules.jsx';
import Issues from './pages/Issues.jsx';
import Overview from './pages/Overview.jsx';
import Home from './pages/Home.jsx';

const pageIndex = {
  home: 0,
  overview: 1,
  issues: 2,
  rules: 3,
  validation: 4,
};

function App() {
  const [currentPage, setCurrentPage] = useState("home");

  return (
    <div className="app">
      <header className="page-header">
        <div>
          <h1>data_check</h1>        
        </div>

      <div className="data-notice">
        SYNTHETIC DATA ONLY — NO PHI
      </div>

        <nav className="main-nav" aria-label="Main navigation">
          <span
            className="nav-indicator"
            style={{ "--active-index": pageIndex[currentPage] }}
            aria-hidden="true"
          />
          <button
            className={currentPage === "home" ? "nav-link is-active" : "nav-link"}
            onClick={() => setCurrentPage("home")}
            >Home
          </button>

          <button
            className={currentPage === "overview" ? "nav-link is-active" : "nav-link"}
            onClick={() => setCurrentPage("overview")}
          >Overview
          </button>

          <button
            className={currentPage === "issues" ? "nav-link is-active" : "nav-link"}
            onClick={() => setCurrentPage("issues")}
          >Issues
          </button>

          <button
            className={currentPage === "rules" ? "nav-link is-active" : "nav-link"}
            onClick={() => setCurrentPage("rules")}
          >Rules
          </button>

          <button
            className={currentPage === "validation" ? "nav-link is-active" : "nav-link"}
            onClick={() => setCurrentPage("validation")}
          >Validation
          </button>
        </nav>
      </header>

      <main>
        {currentPage === "validation" && <ValidationPage />}
        {currentPage === "rules" && <Rules />}
        {currentPage === "issues" && <Issues />}
        {currentPage === "overview" && <Overview />}
        {currentPage === "home" && <Home onNavigate={setCurrentPage} />}
        
      </main>
    </div>
  );
}


export default App;