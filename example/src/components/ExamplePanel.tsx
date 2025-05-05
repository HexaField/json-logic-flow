import React from 'react';
import './ExamplePanel.css';

interface ExamplePanelProps {
  testData: string;
  onTestDataChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onEvaluate: () => void;
  evaluationResult: any;
}

const ExamplePanel: React.FC<ExamplePanelProps> = ({
  testData,
  onTestDataChange,
  onEvaluate,
  evaluationResult,
}) => {
  return (
    <div className="example-panel-container">
      <h3>Test Data</h3>
      <textarea
        className="test-data-input"
        value={testData}
        onChange={onTestDataChange}
        placeholder="Enter JSON test data..."
      />
      
      <button className="evaluate-button" onClick={onEvaluate}>
        Evaluate
      </button>
      
      <h3>Result</h3>
      <div className="evaluation-result">
        <pre>{JSON.stringify(evaluationResult, null, 2)}</pre>
      </div>
    </div>
  );
};

export default ExamplePanel;
