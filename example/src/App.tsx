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

  const handleEdgesChange = useCallback((_changes: any) => {
    // Handle edge changes from ReactFlow
    // Apply changes to edges
    setEdges(prevEdges => {
      // For simplicity, we'll just let JsonLogicFlow handle this internally
      return prevEdges;
    });
  }, []);

  const handleConnect = useCallback(() => {
    // This is handled internally by JsonLogicFlow
  }, []);

  // Load example flow when selected example changes
  useEffect(() => {
    const exampleFlow = exampleFlows.find(flow => flow.id === selectedExample.id);
    console.log('Selected example:', selectedExample.id);
    console.log('Example flow found:', !!exampleFlow);

    if (exampleFlow && exampleFlow.flow) {
      console.log('Loading example flow:', exampleFlow.id);

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
  // Takes nodes and edges as parameters instead of using from state
  // This prevents unnecessary recreation of the function when nodes/edges change
  const runForceSimulation = useCallback((nodesToLayout: JsonLogicNode[], edgesToLayout: JsonLogicEdge[]) => {
    console.log('Running force simulation, nodes count:', nodesToLayout.length);
    if (nodesToLayout.length === 0) return nodesToLayout;

    try {
      // Create force nodes from ReactFlow nodes
      const forceNodes: ForceNode[] = nodesToLayout.map((node, index) => ({
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
      const links = edgesToLayout
        .filter(edge =>
          forceNodes.some(node => node.id === edge.source) &&
          forceNodes.some(node => node.id === edge.target)
        )
        .map(edge => {
          return {
            source: edge.source,
            target: edge.target,
            // Store the source and target handles for untangling
            sourceHandle: edge.sourceHandle,
            targetHandle: edge.targetHandle
          };
        });

      // Create a map of node IDs to their connection types
      // This helps us understand which nodes are primarily sources vs targets
      const nodeConnectionTypes: Record<string, { isSource: boolean, isTarget: boolean }> = {};

      // Initialize all nodes
      forceNodes.forEach(node => {
        nodeConnectionTypes[node.id] = { isSource: false, isTarget: false };
      });

      // Analyze connections
      links.forEach(link => {
        if (nodeConnectionTypes[link.source]) {
          nodeConnectionTypes[link.source].isSource = true;
        }
        if (nodeConnectionTypes[link.target]) {
          nodeConnectionTypes[link.target].isTarget = true;
        }
      });

      // Calculate graph structure metrics to help with layout
      const calculateGraphMetrics = () => {
        // Create a map to track node depths (distance from root)
        const nodeDepths: Record<string, number> = {};

        // Find root nodes (nodes that are only sources, not targets)
        const rootNodeIds = Object.entries(nodeConnectionTypes)
          .filter(([_, type]) => type.isSource && !type.isTarget)
          .map(([id]) => id);

        // If no clear root nodes, use nodes with more outgoing than incoming connections
        if (rootNodeIds.length === 0) {
          // Count incoming and outgoing connections for each node
          const connectionCounts: Record<string, { incoming: number, outgoing: number }> = {};

          forceNodes.forEach(node => {
            connectionCounts[node.id] = { incoming: 0, outgoing: 0 };
          });

          links.forEach(link => {
            if (connectionCounts[link.source]) connectionCounts[link.source].outgoing++;
            if (connectionCounts[link.target]) connectionCounts[link.target].incoming++;
          });

          // Find nodes with more outgoing than incoming connections
          Object.entries(connectionCounts).forEach(([id, counts]) => {
            if (counts.outgoing > counts.incoming) {
              rootNodeIds.push(id);
            }
          });

          // If still no root nodes, just use the first node
          if (rootNodeIds.length === 0 && forceNodes.length > 0) {
            rootNodeIds.push(forceNodes[0].id);
          }
        }

        // Initialize all nodes with depth -1 (unvisited)
        forceNodes.forEach(node => {
          nodeDepths[node.id] = -1;
        });

        // Set root nodes to depth 0
        rootNodeIds.forEach(id => {
          nodeDepths[id] = 0;
        });

        // Breadth-first traversal to assign depths
        let currentDepth = 0;
        let nodesToProcess = [...rootNodeIds];
        let nextNodesToProcess: string[] = [];

        // Continue until we've processed all reachable nodes
        while (nodesToProcess.length > 0 && currentDepth < 100) { // Prevent infinite loops
          currentDepth++;

          // Process all nodes at the current depth
          nodesToProcess.forEach(nodeId => {
            // Find all targets of this node
            links.forEach(link => {
              if (link.source === nodeId && nodeDepths[link.target] === -1) {
                nodeDepths[link.target] = currentDepth;
                nextNodesToProcess.push(link.target);
              }
            });
          });

          // Move to the next depth level
          nodesToProcess = nextNodesToProcess;
          nextNodesToProcess = [];
        }

        // For any unvisited nodes, assign a middle depth
        const maxDepth = Math.max(...Object.values(nodeDepths).filter(d => d >= 0), 0);
        forceNodes.forEach(node => {
          if (nodeDepths[node.id] === -1) {
            nodeDepths[node.id] = Math.floor(maxDepth / 2);
          }
        });

        return { nodeDepths, maxDepth };
      };

      // Get graph metrics
      const { nodeDepths, maxDepth } = calculateGraphMetrics();

      // Create the simulation with stronger forces
      const simulation = forceSimulation<ForceNode>(forceNodes)
        .force('charge', forceManyBody().strength(-9000)) // Strong repulsion to avoid overlaps
        .force('center', forceCenter(400, 300)) // Center in the middle

      // Add a force to position nodes based on their depth in the graph
      simulation.force('depth', (alpha: number) => {
        forceNodes.forEach(node => {
          const depth = nodeDepths[node.id];
          if (depth !== undefined) {
            // Calculate target Y position based on depth
            // Normalize to spread evenly across the canvas height
            const targetY = 100 + (depth / Math.max(1, maxDepth)) * 600;
            // Apply force towards target position
            node.y = (node.y || 0) + ((targetY - (node.y || 0)) * alpha * 0.3);
          }
        });
      });

      // Only add link force if there are valid links
      if (links.length > 0) {
        simulation.force('link',
          forceLink(links)
            .id((d: any) => d.id)
            .distance(250) // Increased distance between connected nodes
        );

        // Add a data-driven directional force based on the flow direction
        simulation.force('flowDirection', (alpha: number) => {
          // Apply forces based on the flow direction (source to target)
          for (const link of links) {
            const source = forceNodes.find(n => n.id === link.source);
            const target = forceNodes.find(n => n.id === link.target);

            if (!source || !target) continue;

            // Determine the direction of the connection based on handles
            let sourceIsTop = false;
            let targetIsTop = false;

            // Check source handle position (top or bottom)
            if (link.sourceHandle) {
              sourceIsTop = typeof link.sourceHandle === 'string' && link.sourceHandle.includes('top');
            }

            // Check target handle position (top or bottom)
            if (link.targetHandle) {
              targetIsTop = typeof link.targetHandle === 'string' && link.targetHandle.includes('top');
            }

            // Calculate vertical force strength based on handle positions
            const verticalForceStrength = 5 * alpha;

            // Apply vertical forces based on the connection direction
            // If source connects from bottom, push it up in the layout
            // If target connects at top, push it down in the layout
            if (!sourceIsTop) { // Source connects from bottom
              source.y = (source.y || 0) - verticalForceStrength;
            }

            if (!targetIsTop) { // Target connects at bottom
              target.y = (target.y || 0) + verticalForceStrength;
            }

            // Apply horizontal separation force when nodes are at similar vertical positions
            if (Math.abs((source.y || 0) - (target.y || 0)) < 80) {
              const horizontalForceStrength = 3 * alpha;
              source.x = (source.x || 0) - horizontalForceStrength;
              target.x = (target.x || 0) + horizontalForceStrength;
            }
          }
        });

        // Add a force to spread nodes horizontally at the same depth level
        simulation.force('spreadHorizontally', (alpha: number) => {
          // Group nodes by depth
          const nodesByDepth: Record<number, ForceNode[]> = {};

          forceNodes.forEach(node => {
            const depth = nodeDepths[node.id];
            if (depth !== undefined) {
              if (!nodesByDepth[depth]) {
                nodesByDepth[depth] = [];
              }
              nodesByDepth[depth].push(node);
            }
          });

          // For each depth level, spread nodes horizontally
          Object.entries(nodesByDepth).forEach(([_, nodesAtDepth]) => {
            if (nodesAtDepth.length <= 1) return;

            // Calculate target positions to spread nodes evenly
            const totalWidth = 800; // Available width
            const nodeSpacing = totalWidth / (nodesAtDepth.length + 1);

            // Sort nodes by their current x position to maintain relative ordering
            const sortedNodes = [...nodesAtDepth].sort((a, b) => (a.x || 0) - (b.x || 0));

            sortedNodes.forEach((node, index) => {
              const targetX = (index + 1) * nodeSpacing;
              // Apply a gentle force towards the target position
              // Use a stronger force for horizontal positioning
              node.x = (node.x || 0) + ((targetX - (node.x || 0)) * alpha * 0.2);
            });
          });
        });
      }

      // Run the simulation for enough ticks to allow untangling
      simulation.stop();
      simulation.tick(2000); // Run for more ticks to ensure stable layout

      // Update the node positions based on the simulation
      // Apply the simulated positions directly
      const updatedNodes = nodesToLayout.map((node) => {
        const simulatedNode = forceNodes.find(n => n.id === node.id);
        if (simulatedNode && simulatedNode.x !== undefined && simulatedNode.y !== undefined) {
          // Use the simulated positions directly without bounds restriction
          return {
            ...node,
            position: {
              x: simulatedNode.x,
              y: simulatedNode.y
            }
          };
        }
        return node;
      });

      console.log('Simulation completed with updated node positions');
      return updatedNodes;
    } catch (error) {
      console.error("Force simulation error:", error);
      // Return original nodes if simulation fails
      return nodesToLayout;
    }
  }, []);

  // Apply force simulation only when explicitly triggered
  // This prevents constant re-rendering
  const applyForceSimulation = useCallback(() => {
    if (nodes.length === 0) return;

    console.log('Applying force simulation to current nodes');
    const updatedNodes = runForceSimulation(nodes, edges);
    setNodes(updatedNodes);
  }, [nodes, edges, runForceSimulation]);

  // Run simulation when example changes or when manually triggered
  useEffect(() => {
    // Only run if we have nodes to layout
    if (nodes.length === 0) return;

    // Delay the force simulation to ensure nodes are properly rendered first
    const timer = setTimeout(() => {
      console.log('Running delayed force simulation after example change');
      applyForceSimulation();
    }, 500);

    return () => clearTimeout(timer);
    // Only depend on selectedExample and forceSimulationKey, not on nodes/edges
    // This prevents infinite update loops
  }, [selectedExample, forceSimulationKey, applyForceSimulation]);

  // Handler for the re-run simulation button
  const handleRerunSimulation = useCallback(() => {
    console.log('Re-running force simulation');
    // Increment the key to trigger the useEffect
    setForceSimulationKey(prev => prev + 1);
    // Also run the simulation directly for immediate feedback
    setTimeout(() => {
      applyForceSimulation();
    }, 10);
  }, [applyForceSimulation]);

  // Handle selecting an example
  const handleSelectExample = useCallback((example: typeof examples[0]) => {
    setSelectedExample(example);
    // Trigger force simulation after example change
    setForceSimulationKey(prev => prev + 1);
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
