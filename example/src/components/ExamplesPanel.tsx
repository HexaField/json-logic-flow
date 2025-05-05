import React from 'react';
import { Example } from '../examples';
import './ExamplesPanel.css';

interface ExamplesPanelProps {
  examples: Example[];
  onSelectExample: (example: Example) => void;
}

const ExamplesPanel: React.FC<ExamplesPanelProps> = ({ examples, onSelectExample }) => {
  return (
    <div className="examples-panel">
      <h3>Example Rules</h3>
      <div className="examples-list">
        {examples.map((example) => (
          <div 
            key={example.id} 
            className="example-item"
            onClick={() => onSelectExample(example)}
          >
            <h4>{example.name}</h4>
            <p>{example.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExamplesPanel;
