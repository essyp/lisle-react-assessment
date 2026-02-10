import { useState } from "react";
import { validateAndSummarise } from "./utils/validateAnalyze";

function App() {
  const [input, setInput] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);

  const handleProcess = () => {
    setErrors([]);
    setSummary(null);

    try {
      const parsed = JSON.parse(input);
      const result = validateAndSummarise(parsed);

      if (result.errors.length > 0) {
        setErrors(result.errors.map(e => `Item ${e.index}: ${e.message}`));
      } else if (result.summary) {
        setSummary(result.summary);
      }
    } catch {
      setErrors(["Invalid JSON"]);
    }
  };

  return (
    <div className="container my-5">
      <h1 className="mb-4 text-center">Event Validator</h1>

      <div className="mb-3">
        <label htmlFor="jsonInput" className="form-label">
          Paste JSON array of events
        </label>
        <textarea
          id="jsonInput"
          className="form-control"
          rows={10}
          placeholder='[{"timestamp":"2026-01-28T10:15:00Z","vehicleId":"ABC123","type":"IGNITION_ON","value":1}]'
          value={input}
          onChange={e => setInput(e.target.value)}
        />
      </div>

      <button className="btn btn-primary mb-4" onClick={handleProcess}>
        Validate
      </button>

      {errors.length > 0 && (
        <div className="alert alert-danger" role="alert">
          <h5 className="alert-heading">Errors</h5>
          <ul className="mb-0">
            {errors.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </div>
      )}

      {summary && (
        <div className="card">
          <div className="card-header">Summary</div>
          <div className="card-body">
            <ul className="list-unstyled mb-3">
              <li>
                <strong>Total events:</strong> {summary.totalEvents}
              </li>
              <li>
                <strong>Unique vehicles:</strong> {summary.uniqueVehicleCount}
              </li>
              <li>
                <strong>Earliest:</strong> {summary.earliestTimestamp}
              </li>
              <li>
                <strong>Latest:</strong> {summary.latestTimestamp}
              </li>
            </ul>

            <h6>Count per type</h6>
            <ul className="list-group">
              {Object.entries(summary.countPerType).map(([type, count]) => (
                <li key={type} className="list-group-item d-flex justify-content-between align-items-center">
                  {type}
                  <span className="badge bg-primary rounded-pill">{count}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
