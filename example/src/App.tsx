import React, { useState, useCallback, useEffect } from 'react';
import { JsonLogicNode, JsonLogicEdge } from 'json-logic-flow';
import JsonLogicFlow from '../../src/components/JsonLogicFlow';
import jsonLogic from 'json-logic-js';
import ExamplePanel from './components/ExamplePanel';
import ExamplesPanel from './components/ExamplesPanel';
import { examples, exampleFlows } from './examples';
import './App.css';

const App: React.FC = () => {
  const [nodes, setNodes] = useState<JsonLogicNode[]>([]);
  const [edges, setEdges] = useState<JsonLogicEdge[]>([]);
  const [testData, setTestData] = useState<string>(JSON.stringify(examples[0].testData, null, 2));
  const [jsonLogicResult, setJsonLogicResult] = useState<any>(examples[0].jsonLogic);
  const [evaluationResult, setEvaluationResult] = useState<any>(null);
  const [selectedExample, setSelectedExample] = useState(examples[0]);

  const handleNodesChange = useCallback((updatedNodes: JsonLogicNode[]) => {
    setNodes(updatedNodes);
  }, []);

  const handleEdgesChange = useCallback((updatedEdges: JsonLogicEdge[]) => {
    setEdges(updatedEdges);
  }, []);

  const handleConnect = useCallback((params: any) => {
    // This is handled internally by JsonLogicFlow
  }, []);

  // Load example flow when selected example changes
  useEffect(() => {
    const exampleFlow = exampleFlows.find(flow => flow.id === selectedExample.id);

    if (exampleFlow && exampleFlow.flow) {
      // Set the nodes and edges from the example
      setNodes(exampleFlow.flow.nodes);
      setEdges(exampleFlow.flow.edges);

      setJsonLogicResult(selectedExample.jsonLogic);
      setTestData(JSON.stringify(selectedExample.testData, null, 2));

      // Evaluate the example
      try {
        const result = jsonLogic.apply(selectedExample.jsonLogic, selectedExample.testData);
        setEvaluationResult(result);
      } catch (error) {
        setEvaluationResult(`Error: ${(error as Error).message}`);
      }
    }
  }, [selectedExample]);

  // Handle selecting an example
  const handleSelectExample = useCallback((example: typeof examples[0]) => {
    setSelectedExample(example);
  }, []);

  const handleTestDataChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTestData(e.target.value);
  }, []);

  const handleEvaluate = useCallback(() => {
    if (!jsonLogicResult) return;

    try {
      const data = JSON.parse(testData);
      const result = jsonLogic.apply(jsonLogicResult, data);
      setEvaluationResult(result);
    } catch (error) {
      setEvaluationResult(`Error: ${(error as Error).message}`);
    }
  }, [jsonLogicResult, testData]);

  return (
    <div className="app">
      <header className="app-header">
        <h1>JSON Logic Flow Example</h1>
      </header>

      <main className="app-content">
        <div className="sidebar">
          <ExamplesPanel
            examples={examples}
            onSelectExample={handleSelectExample}
          />
        </div>

        <div className="flow-container">
          <JsonLogicFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={handleNodesChange}
            onEdgesChange={handleEdgesChange}
            onConnect={handleConnect}
          />
        </div>

        <div className="example-panel">
          <ExamplePanel
            testData={testData}
            onTestDataChange={handleTestDataChange}
            onEvaluate={handleEvaluate}
            evaluationResult={evaluationResult}
            jsonLogic={jsonLogicResult}
          />
        </div>
      </main>
    </div>
  );
};

export default App;
