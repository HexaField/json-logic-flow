import React, { useState, useCallback, useEffect } from 'react';
import { JsonLogicNode, JsonLogicEdge } from 'json-logic-flow';
import JsonLogicFlow from '../../src/components/JsonLogicFlow';
import jsonLogic from 'json-logic-js';
import ExamplePanel from './components/ExamplePanel';
import ExamplesPanel from './components/ExamplesPanel';
import { examples, exampleFlows } from './examples';
import {
  forceSimulation,
  forceManyBody,
  forceCenter,
  forceLink,
  SimulationNodeDatum
} from 'd3-force';
import './App.css';

// Interface for nodes in the force simulation
interface ForceNode extends SimulationNodeDatum {
  id: string;
  originalIndex: number;
}

const App: React.FC = () => {
  const [nodes, setNodes] = useState<JsonLogicNode[]>([]);
  const [edges, setEdges] = useState<JsonLogicEdge[]>([]);
  const [testData, setTestData] = useState<string>(JSON.stringify(examples[0].testData, null, 2));
  const [jsonLogicResult, setJsonLogicResult] = useState<any>(examples[0].jsonLogic);
  const [evaluationResult, setEvaluationResult] = useState<any>(null);
  const [selectedExample, setSelectedExample] = useState(examples[0]);
  const [forceSimulationKey, setForceSimulationKey] = useState(0); // Used to trigger force simulation

  const handleNodesChange = useCallback((changes: any) => {
    // ReactFlow's onNodesChange passes NodeChange[] not the updated nodes array
    console.log('Node changes received:', changes);
    // Apply the changes to our nodes using applyNodeChanges from ReactFlow
    setNodes((nds) => {
      // For position changes, we need to update the node positions
      if (Array.isArray(changes)) {
        const newNodes = [...nds];
        changes.forEach((change: any) => {
          if (change.type === 'position' && 'position' in change && change.position) {
            // Handle position changes
            const nodeIndex = newNodes.findIndex(n => n.id === change.id);
            if (nodeIndex !== -1) {
              newNodes[nodeIndex] = {
                ...newNodes[nodeIndex],
                position: change.position
              };
            }
          }
        });
        return newNodes;
      }
      return nds;
    });
  }, []);

  const handleEdgesChange = useCallback((changes: any) => {
    // Handle edge changes from ReactFlow
    console.log('Edge changes received:', changes);
    // Apply changes to edges
    setEdges(prevEdges => {
      // For simplicity, we'll just let JsonLogicFlow handle this internally
      return prevEdges;
    });
  }, []);

  const handleConnect = useCallback(() => {
    // This is handled internally by JsonLogicFlow
    console.log('Connection handled by JsonLogicFlow');
  }, []);

  // Load example flow when selected example changes
  useEffect(() => {
    const exampleFlow = exampleFlows.find(flow => flow.id === selectedExample.id);
    console.log('Selected example:', selectedExample.id);
    console.log('Example flow found:', !!exampleFlow);

    if (exampleFlow && exampleFlow.flow) {
      console.log('Original nodes:', exampleFlow.flow.nodes);
      console.log('Original edges:', exampleFlow.flow.edges);

      // Make a deep copy of nodes and ensure they have valid positions
      const validatedNodes = exampleFlow.flow.nodes.map(node => ({
        ...node,
        // Ensure each node has a valid position
        position: {
          x: typeof node.position.x === 'number' ? node.position.x : 100,
          y: typeof node.position.y === 'number' ? node.position.y : 100
        }
      }));

      // Set the nodes and edges from the example
      setNodes(validatedNodes);
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

  // Function to run the force simulation
  const runForceSimulation = useCallback(() => {
    console.log('Running force simulation, nodes count:', nodes.length);
    if (nodes.length === 0) return;

    try {
      // Create force nodes from ReactFlow nodes
      const forceNodes: ForceNode[] = nodes.map((node, index) => ({
        id: node.id,
        originalIndex: index,
        // Initialize with current positions if available
        x: node.position.x,
        y: node.position.y,
        // Add any other properties needed by d3-force
        fx: null,
        fy: null
      }));

      console.log('Force nodes created:', forceNodes.length);

      // Create links from edges for the force simulation
      // Make sure we only include links where both source and target nodes exist
      const links = edges
        .filter(edge =>
          forceNodes.some(node => node.id === edge.source) &&
          forceNodes.some(node => node.id === edge.target)
        )
        .map(edge => ({
          source: edge.source,
          target: edge.target
        }));

      // Create the simulation with more moderate forces
      const simulation = forceSimulation<ForceNode>(forceNodes)
        .force('charge', forceManyBody().strength(-200)) // More moderate repulsion
        .force('center', forceCenter(400, 200)); // Center more towards the top

      // Only add link force if there are valid links
      if (links.length > 0) {
        simulation.force('link',
          forceLink(links)
            .id((d: any) => d.id)
            .distance(100) // More moderate distance between connected nodes
        );
      }

      // Run the simulation for a moderate number of ticks
      simulation.stop();
      simulation.tick(100); // Fewer ticks for more stability

      // Update the node positions based on the simulation
      // Ensure positions are within reasonable bounds
      const updatedNodes = nodes.map((node, i) => {
        const simulatedNode = forceNodes[i];
        if (simulatedNode && simulatedNode.x !== undefined && simulatedNode.y !== undefined) {
          // Ensure positions are within reasonable bounds (0-800 for x, 0-600 for y)
          const x = Math.max(0, Math.min(800, simulatedNode.x));
          const y = Math.max(0, Math.min(600, simulatedNode.y));

          return {
            ...node,
            position: { x, y }
          };
        }
        return node;
      });

      console.log('Updated nodes with new positions:', updatedNodes);
      setNodes(updatedNodes);
      console.log('Nodes state updated');
    } catch (error) {
      console.error("Force simulation error:", error);
      // Continue without applying force simulation
    }
  }, [nodes, edges]);

  // Apply force simulation when nodes change or when manually triggered
  useEffect(() => {
    // Delay the force simulation to ensure nodes are properly rendered first
    const timer = setTimeout(() => {
      console.log('Running delayed force simulation');
      runForceSimulation();
    }, 500);

    return () => clearTimeout(timer);
  }, [runForceSimulation, selectedExample, forceSimulationKey]);

  // Handler for the re-run simulation button
  const handleRerunSimulation = useCallback(() => {
    console.log('Re-running force simulation');
    // Increment the key to trigger the useEffect
    setForceSimulationKey(prev => prev + 1);
    // Also run the simulation directly for immediate feedback
    setTimeout(() => {
      runForceSimulation();
    }, 10);
  }, [runForceSimulation]);

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
          <div className="button-container">
            <button
              onClick={handleRerunSimulation}
              className="rearrange-button"
            >
              Re-arrange Nodes
            </button>
          </div>
          <JsonLogicFlow
            nodes={nodes.length > 0 ? nodes : undefined}
            edges={edges.length > 0 ? edges : undefined}
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
