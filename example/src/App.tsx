import React, { useState, useCallback } from 'react';
import { JsonLogicFlow, JsonLogicNode, JsonLogicEdge } from 'json-logic-flow';
import jsonLogic from 'json-logic-js';
import ExamplePanel from './components/ExamplePanel';
import './App.css';

const App: React.FC = () => {
  const [nodes, setNodes] = useState<JsonLogicNode[]>([]);
  const [edges, setEdges] = useState<JsonLogicEdge[]>([]);
  const [testData, setTestData] = useState<string>('{"user": {"name": "John", "age": 30}, "items": [1, 2, 3]}');
  const [jsonLogicResult, setJsonLogicResult] = useState<any>(null);
  const [evaluationResult, setEvaluationResult] = useState<any>(null);

  const handleNodesChange = useCallback((updatedNodes: JsonLogicNode[]) => {
    setNodes(updatedNodes);
  }, []);

  const handleEdgesChange = useCallback((updatedEdges: JsonLogicEdge[]) => {
    setEdges(updatedEdges);
  }, []);

  const handleConnect = useCallback((params: any) => {
    // This is handled internally by JsonLogicFlow
  }, []);

  const handleJsonLogicChange = useCallback((logic: any) => {
    setJsonLogicResult(logic);
    
    try {
      const data = JSON.parse(testData);
      const result = jsonLogic.apply(logic, data);
      setEvaluationResult(result);
    } catch (error) {
      setEvaluationResult(`Error: ${(error as Error).message}`);
    }
  }, [testData]);

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
          />
        </div>
      </main>
    </div>
  );
};

export default App;
