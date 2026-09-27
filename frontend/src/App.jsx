import { useState } from "react";
import "./App.css";
import ValidationPage from "./pages/ValidationPage.jsx";
import Rules from './pages/Rules.jsx';
import Issues from './pages/Issues.jsx';


function App() {
  const [currentPage, setCurrentPage] = useState("validation");

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

        {currentPage == "overview" && (
          <>
            <header className="page-title">
              <h2>Overview</h2>
              <p>High-level summary of the current data-quality validation run.</p>
            </header>

            <section className="empty-slate">
              <p>Working on this one!</p>
            </section>
          </>
        )}
        
      </main>
    </div>
  );
}


export default App;