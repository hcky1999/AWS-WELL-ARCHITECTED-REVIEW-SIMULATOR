import React, { useState, useEffect } from "react";
import { Tabs, Tab, Button, Spinner, Alert } from "react-bootstrap";

// Local fallback questions
const LOCAL_QUESTIONS = {
  "Operational Excellence": [
    {
      "id": "OE1",
      "question": "How do you monitor your systems?",
      "options": [
        "We do not monitor",
        "Basic metrics only",
        "Detailed monitoring with alarms and logs"
      ],
      "recommendation": "Implement centralized logging with CloudWatch and set up actionable alerts."
    }
  ],
  "Security": [
    {
      "id": "SEC1",
      "question": "Do you enforce least privilege access?",
      "options": [
        "No, all users have admin access",
        "Some restrictions exist",
        "Access is scoped by role using IAM policies"
      ],
      "recommendation": "Use IAM roles with least privilege and enforce MFA for sensitive actions."
    }
  ],
  "Reliability": [
    {
      "id": "REL1",
      "question": "How do you handle failures?",
      "options": [
        "Manual intervention required",
        "Some automated recovery",
        "Fully automated failure recovery"
      ],
      "recommendation": "Implement automated backup and recovery procedures."
    }
  ],
  "Performance Efficiency": [
    {
      "id": "PERF1",
      "question": "How do you select compute resources?",
      "options": [
        "Fixed instance types",
        "Some optimization",
        "Data-driven selection with monitoring"
      ],
      "recommendation": "Use performance monitoring to right-size resources."
    }
  ],
  "Cost Optimization": [
    {
      "id": "COST1",
      "question": "How do you monitor costs?",
      "options": [
        "No cost monitoring",
        "Monthly billing review",
        "Real-time cost monitoring with alerts"
      ],
      "recommendation": "Implement cost monitoring with AWS Cost Explorer and budgets."
    }
  ]
};

const API_BASE = "https://p42h1zyc8i.execute-api.us-east-1.amazonaws.com/Prod";

const QuestionForm = () => {
  const [questions, setQuestions] = useState({});
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("Operational Excellence");

  useEffect(() => {
    // Try to load from API first, fallback to local questions
    fetch(`${API_BASE}/questions`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: Failed to load questions from API`);
        }
        return res.json();
      })
      .then((data) => {
        console.log("Questions loaded from API:", data);
        setQuestions(data);
        setLoading(false);
      })
      .catch((err) => {
        console.warn("API failed, using local questions:", err.message);
        setError(`API unavailable: ${err.message}. Using local questions.`);
        setQuestions(LOCAL_QUESTIONS);
        setLoading(false);
      });
  }, []);

  const handleChange = (pillar, qid, answer) => {
    setAnswers((prev) => ({
      ...prev,
      [qid]: { pillar, answer },
    }));
  };

  const handleSubmit = () => {
    console.log("Submitting answers:", answers);

    fetch(`${API_BASE}/submit-review`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ answers })
    })
      .then((res) => {
        console.log("Response status:", res.status);
        if (!res.ok) {
          return res.text().then(text => {
            throw new Error(`HTTP ${res.status}: ${text}`);
          });
        }
        return res.json();
      })
      .then((data) => {
        console.log("Success:", data);
        alert("Review submitted! ID: " + data.review_id);
      })
      .catch((error) => {
        console.error("Submission failed:", error);
        alert("Failed to submit review: " + error.message);
      });
  };

  if (loading) return <Spinner animation="border" />;

  return (
    <div className="container mt-4">
      <h3>AWS Well-Architected Review Simulator</h3>
      
      {error && (
        <Alert variant="warning" className="mb-3">
          {error}
        </Alert>
      )}

      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-3"
      >
        {Object.keys(questions).map((pillar) => (
          <Tab eventKey={pillar} title={pillar} key={pillar}>
            {questions[pillar].map((q) => (
              <div key={q.id} className="mb-3">
                <h5>{q.question}</h5>
                {q.options.map((opt, i) => (
                  <div key={i} className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      id={`${q.id}_${i}`}
                      name={q.id}
                      value={opt}
                      checked={answers[q.id]?.answer === opt}
                      onChange={() => handleChange(pillar, q.id, opt)}
                    />
                    <label htmlFor={`${q.id}_${i}`} className="form-check-label ms-2">
                      {opt}
                    </label>
                  </div>
                ))}
                <small className="text-muted">
                  💡 {q.recommendation}
                </small>
                <hr />
              </div>
            ))}
          </Tab>
        ))}
      </Tabs>

      <Button onClick={handleSubmit} variant="primary">
        Submit Review
      </Button>
    </div>
  );
};

export default QuestionForm;