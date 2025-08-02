import React, { useState, useEffect } from "react";
import { Tabs, Tab, Button, Spinner } from "react-bootstrap";

// ✅ Use your actual API Gateway base URL here
const API_BASE = "https://o14jesaum9.execute-api.us-east-1.amazonaws.com/Prod";

const QuestionForm = () => {
  const [questions, setQuestions] = useState({});
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Operational Excellence");

  // ✅ Load questions on initial render
  useEffect(() => {
    fetch(`${API_BASE}/questions`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to load questions.");
        }
        return res.json();
      })
      .then((data) => {
        setQuestions(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching questions:", err);
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
