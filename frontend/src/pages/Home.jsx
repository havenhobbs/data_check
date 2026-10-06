function Home({ onNavigate }) {
  return (
    <section className="home-page">
      <section className="home-hero">
        <div className="home-hero__content">

          <h1>Healthcare Data Quality Validator</h1>

          <p className="home-hero__lead">
            Schedulign and registration data drives clinic operations, and errors in
            it cause misattributed visits, patient-matching risk, and bad reporting.
            This project simulates that data, injects known defects, and builds
            validation rules and a review queue to find and triage them.
          </p>

          <p className="home-hero__copy">
            The application generates patient, provider, and encounter data;
            introduces controlled defects; evaluates records against validation
            rules; and presents prioritized findings through a Flask API and
            React dashboard.
          </p>

          <div className="home-hero__actions">
            <button
              className="button button--primary"
              type="button"
              onClick={() => onNavigate("overview")}
            >
              Explore Overview
            </button>

            <button
              className="button button--secondary"
              type="button"
              onClick={() => onNavigate("issues")}
            >
              Review Issues
            </button>
          </div>
        </div>

        <aside
          className="home-result-card"
          aria-label="Validation result summary"
        >
          <p className="home-result-card__label">Controlled test result</p>

          <strong className="home-result-card__value">190 / 190</strong>

          <p className="home-result-card__copy">
            Expected issue instances detected with zero false positives and
            zero false negatives.
          </p>

          <div className="home-result-card__metrics">
            <div>
              <span>Precision</span>
              <strong>100%</strong>
            </div>

            <div>
              <span>Recall</span>
              <strong>100%</strong>
            </div>
          </div>
        </aside>
      </section>

      <section className="home-section">
        <div className="home-section__heading">
          <p className="eyebrow">Project scope</p>
          <h2>What does this application demonstrate?</h2>
          <p>
            A reproducible workflow for testing, detecting, reviewing, and
            evaluating healthcare data-quality issues.
          </p>
        </div>

        <div className="home-capability-grid">
          <article className="home-capability-card">
            <span className="home-capability-card__number">01</span>
            <h3>Synthetic Data Generation</h3>
            <p>
              Produces patient, provider, and encounter records for repeatable
              validation testing.
            </p>
          </article>

          <article className="home-capability-card">
            <span className="home-capability-card__number">02</span>
            <h3>Controlled Error Injection</h3>
            <p>
              Introduces known defects to create a measurable ground-truth
              answer key.
            </p>
          </article>

          <article className="home-capability-card">
            <span className="home-capability-card__number">03</span>
            <h3>Validation Rules</h3>
            <p>
              Detects completeness, validity, uniqueness, consistency,
              relationship, date, and business-rule issues.
            </p>
          </article>

          <article className="home-capability-card">
            <span className="home-capability-card__number">04</span>
            <h3>Review and Evaluation</h3>
            <p>
              Serves results through Flask and supports filtering, triage, and
              rule-level performance review in React.
            </p>
          </article>
        </div>
      </section>

      <section className="home-section home-workflow">
        <div className="home-section__heading">
          <p className="eyebrow">Workflow</p>
          <h2>How does the validation process work?</h2>
          <p>
            Each controlled defect is recorded as ground truth, making the
            validator measurable rather than a black-box data check.
          </p>
        </div>

        <div className="workflow-steps" aria-label="Validation workflow">
          <div className="workflow-step">
            <span>01</span>
            <p>Synthetic Records</p>
          </div>

          <div className="workflow-arrow" aria-hidden="true">
            →
          </div>

          <div className="workflow-step">
            <span>02</span>
            <p>Controlled Defects</p>
          </div>

          <div className="workflow-arrow" aria-hidden="true">
            →
          </div>

          <div className="workflow-step">
            <span>03</span>
            <p>Validation Rules</p>
          </div>

          <div className="workflow-arrow" aria-hidden="true">
            →
          </div>

          <div className="workflow-step">
            <span>04</span>
            <p>Detected Findings</p>
          </div>

          <div className="workflow-arrow" aria-hidden="true">
            →
          </div>

          <div className="workflow-step">
            <span>05</span>
            <p>Ground-Truth Evaluation</p>
          </div>
        </div>
      </section>

      <section className="home-section home-explore">
        <div className="home-section__heading">
          <p className="eyebrow">Application guide</p>
          <h2>Explain the workflow?</h2>
          <p>
            Each section focuses on a different part of the data-quality review
            process.
          </p>
        </div>

        <div className="home-page-grid">
          <button
            className="home-page-card"
            type="button"
            onClick={() => onNavigate("overview")}
          >
            <span className="home-page-card__label">01</span>
            <h3>Overview</h3>
            <p>
              Review current findings by severity, quality dimension, record
              type, and validation performance.
            </p>
            <span className="home-page-card__link">Open overview →</span>
          </button>

          <button
            className="home-page-card"
            type="button"
            onClick={() => onNavigate("issues")}
          >
            <span className="home-page-card__label">02</span>
            <h3>Issues</h3>
            <p>
              Filter individual findings by severity, dimension, rule, record
              type, or keyword.
            </p>
            <span className="home-page-card__link">Review issues →</span>
          </button>

          <button
            className="home-page-card"
            type="button"
            onClick={() => onNavigate("rules")}
          >
            <span className="home-page-card__label">03</span>
            <h3>Rules</h3>
            <p>
              Review each validation check, its quality dimension, severity,
              and recommended remediation.
            </p>
            <span className="home-page-card__link">View rules →</span>
          </button>

          <button
            className="home-page-card"
            type="button"
            onClick={() => onNavigate("validation")}
          >
            <span className="home-page-card__label">04</span>
            <h3>Validation</h3>
            <p>
              Compare detected findings to controlled ground truth overall and
              by rule.
            </p>
            <span className="home-page-card__link">View validation →</span>
          </button>
        </div>
      </section>
    </section>
  );
}


export default Home;