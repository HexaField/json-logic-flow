import React, { useState, useCallback, useRef, useEffect } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  NodeChange,
  EdgeChange,
  ReactFlowInstance,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { nodeTypes } from './nodes';
import NodePalette, { NodePaletteItem } from './NodePalette';
import Inspector from './Inspector';
import { JsonLogicNode, JsonLogicEdge, NodeType, NodeData, JsonLogicFlowProps } from '../types';
import { graphToJsonLogic } from '../utils';

// Default palette items
const defaultPaletteItems: NodePaletteItem[] = [
  { type: NodeType.VALUE, label: 'Value', description: 'A literal value (string, number, boolean)' },
  { type: NodeType.VAR, label: 'Variable', description: 'Reference a variable from data' },
  { type: NodeType.OP, label: 'Operator', description: 'Built-in operators (+, -, *, /, ==, etc.)' },
  { type: NodeType.IF, label: 'Conditional', description: 'If-then-else logic' },
  { type: NodeType.CUSTOM, label: 'Custom', description: 'Custom operation' },
];

// Default nodes with a root node
const defaultNodes: JsonLogicNode[] = [
  {
    id: 'root',
    type: NodeType.ROOT,
    position: { x: 250, y: 50 },
    data: { type: NodeType.ROOT },
  },
];

const JsonLogicFlow: React.FC<JsonLogicFlowProps> = ({
  nodes: initialNodes,
  edges: initialEdges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onNodeSelect,
  readOnly = false,
  className,
  style,
}) => {
  // ReactFlow states
  const [nodes, setNodes, onNodesChangeInternal] = useNodesState<NodeData>(initialNodes || defaultNodes);
  const [edges, setEdges, onEdgesChangeInternal] = useEdgesState<{}>(initialEdges || []);
  const [selectedNode, setSelectedNode] = useState<JsonLogicNode | null>(null);
  const [jsonLogic, setJsonLogic] = useState<any>(null);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);

  // Get references to the initial props
  const initialNodesRef = useRef(initialNodes);
  const initialEdgesRef = useRef(initialEdges);

  // Update internal state when props change
  useEffect(() => {
    if (initialNodes !== initialNodesRef.current) {
      initialNodesRef.current = initialNodes;
      if (initialNodes && initialNodes.length > 0) {
        setNodes(initialNodes);
      }
    }
  }, [initialNodes]);

  useEffect(() => {
    if (initialEdges !== initialEdgesRef.current) {
      initialEdgesRef.current = initialEdges;
      if (initialEdges && initialEdges.length > 0) {
        setEdges(initialEdges);
      }
    }
  }, [initialEdges]);

  // Update JSON Logic when nodes or edges change
  useEffect(() => {
    const result = graphToJsonLogic(nodes, edges);
    setJsonLogic(result.jsonLogic);
  }, [nodes, edges]);

  // Handle node changes
  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      onNodesChangeInternal(changes);
      if (onNodesChange) {
        onNodesChange(nodes);
      }
    },
    [nodes, onNodesChange, onNodesChangeInternal]
  );

  // Handle edge changes
  const handleEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      onEdgesChangeInternal(changes);
      if (onEdgesChange) {
        onEdgesChange(edges);
      }
    },
    [edges, onEdgesChange, onEdgesChangeInternal]
  );

  // Handle connections between nodes
  const handleConnect = useCallback(
    (connection: Connection) => {
      const newEdge = { ...connection, id: `edge_${connection.source}_${connection.target}` };
      setEdges((eds) => addEdge(newEdge, eds));
      if (onConnect) {
        onConnect(connection);
      }
    },
    [setEdges, onConnect]
  );

  // Handle node selection
  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      setSelectedNode(node as JsonLogicNode);
      if (onNodeSelect) {
        onNodeSelect(node as JsonLogicNode);
      }
    },
    [onNodeSelect]
  );

  // Handle node data changes from the inspector
  const handleNodeDataChange = useCallback(
    (nodeId: string, data: NodeData) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              data,
            };
          }
          return node;
        })
      );
    },
    [setNodes]
  );

  // Handle drag and drop from palette
  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      if (!reactFlowWrapper.current || !reactFlowInstance) return;

      const nodeType = event.dataTransfer.getData('application/reactflow/type') as NodeType;
      if (!nodeType) return;

      // Get the position where the node was dropped
      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      // Create a new node based on the type
      let newNode: JsonLogicNode;

      switch (nodeType) {
        case NodeType.VALUE:
          newNode = {
            id: `node_${Date.now()}`,
            type: nodeType,
            position,
            data: {
              type: NodeType.VALUE,
              valueType: 'string',
              value: '',
            },
          };
          break;
        case NodeType.VAR:
          newNode = {
            id: `node_${Date.now()}`,
            type: nodeType,
            position,
            data: {
              type: NodeType.VAR,
              path: [''],
            },
          };
          break;
        case NodeType.OP:
          newNode = {
            id: `node_${Date.now()}`,
            type: nodeType,
            position,
            data: {
              type: NodeType.OP,
              op: '+',
            },
          };
          break;
        case NodeType.IF:
          newNode = {
            id: `node_${Date.now()}`,
            type: nodeType,
            position,
            data: {
              type: NodeType.IF,
            },
          };
          break;
        case NodeType.CUSTOM:
          newNode = {
            id: `node_${Date.now()}`,
            type: nodeType,
            position,
            data: {
              type: NodeType.CUSTOM,
              name: 'custom',
              argCount: 1,
            },
          };
          break;
        default:
          return;
      }

      setNodes((nds) => [...nds, newNode]);
    },
    [reactFlowInstance, setNodes]
  );

  // Handle drag start from palette
  const onDragStart = (event: React.DragEvent<HTMLDivElement>, nodeType: NodeType) => {
    event.dataTransfer.setData('application/reactflow/type', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className={`json-logic-flow ${className || ''}`} style={{ display: 'flex', height: '100%', ...style }}>
      {!readOnly && (
        <div className="json-logic-flow-sidebar" style={{ width: '200px', padding: '10px' }}>
          <NodePalette items={defaultPaletteItems} onDragStart={onDragStart} />
        </div>
      )}

      <div className="json-logic-flow-main" style={{ flex: 1, position: 'relative' }}>
        <div ref={reactFlowWrapper} style={{ width: '100%', height: '100%' }}>
          <ReactFlowProvider>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={handleNodesChange}
              onEdgesChange={handleEdgesChange}
              onConnect={handleConnect}
              onNodeClick={handleNodeClick}
              onInit={setReactFlowInstance}
              onDrop={onDrop}
              onDragOver={onDragOver}
              nodeTypes={nodeTypes}
              fitView
              attributionPosition="bottom-right"
            >
              <Controls />
              <MiniMap />
              <Background color="#aaa" gap={16} />
            </ReactFlow>
          </ReactFlowProvider>
        </div>
      </div>

      {!readOnly && (
        <div className="json-logic-flow-inspector" style={{ width: '300px', padding: '10px' }}>
          <Inspector
            selectedNode={selectedNode}
            onNodeDataChange={handleNodeDataChange}
            jsonLogic={jsonLogic}
          />
        </div>
      )}
    </div>
  );
};

export default JsonLogicFlow;
