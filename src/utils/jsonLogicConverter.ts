import { Node, Edge } from 'reactflow';
import { 
  JsonLogicNode, 
  JsonLogicEdge, 
  NodeType, 
  NodeData,
  ValueNodeData,
  VarNodeData,
  OpNodeData,
  IfNodeData,
  CustomNodeData,
  JsonLogicResult
} from '../types';

// Build a map of node IDs to their child nodes based on edges
const buildNodeChildrenMap = (nodes: JsonLogicNode[], edges: JsonLogicEdge[]): Record<string, string[]> => {
  const nodeMap: Record<string, string[]> = {};
  
  // Initialize all nodes with empty children arrays
  nodes.forEach(node => {
    nodeMap[node.id] = [];
  });
  
  // Add children based on edges
  edges.forEach(edge => {
    const sourceId = edge.source;
    const targetId = edge.target;
    
    // Add the target as a child of the source
    if (nodeMap[sourceId]) {
      nodeMap[sourceId].push(targetId);
    }
  });
  
  return nodeMap;
};

// Find the root node in the graph
const findRootNode = (nodes: JsonLogicNode[]): JsonLogicNode | undefined => {
  return nodes.find(node => node.type === NodeType.ROOT);
};

// Recursively build JSON Logic from a node and its children
const buildJsonLogicFromNode = (
  nodeId: string,
  nodes: Record<string, JsonLogicNode>,
  childrenMap: Record<string, string[]>,
  visited: Set<string> = new Set()
): any => {
  // Prevent infinite recursion
  if (visited.has(nodeId)) {
    return null;
  }
  
  visited.add(nodeId);
  
  const node = nodes[nodeId];
  if (!node) return null;
  
  const children = childrenMap[nodeId] || [];
  const childValues = children.map(childId => 
    buildJsonLogicFromNode(childId, nodes, childrenMap, visited)
  ).filter(Boolean);
  
  switch (node.data.type) {
    case NodeType.ROOT:
      // Root node should have exactly one child
      return childValues[0] || null;
      
    case NodeType.VALUE:
      // Value nodes return their raw value
      const valueData = node.data as ValueNodeData;
      return valueData.value;
      
    case NodeType.VAR:
      // Variable nodes return { "var": path }
      const varData = node.data as VarNodeData;
      return { "var": varData.path.length === 1 ? varData.path[0] : varData.path };
      
    case NodeType.OP:
      // Operator nodes return { op: [childValues] }
      const opData = node.data as OpNodeData;
      return { [opData.op]: childValues };
      
    case NodeType.IF:
      // If nodes return { "if": [condition, then, else] }
      return { "if": childValues };
      
    case NodeType.CUSTOM:
      // Custom nodes return { name: [childValues] }
      const customData = node.data as CustomNodeData;
      return { [customData.name]: childValues };
      
    default:
      return null;
  }
};

// Convert ReactFlow graph to JSON Logic
export const graphToJsonLogic = (nodes: JsonLogicNode[], edges: JsonLogicEdge[]): JsonLogicResult => {
  try {
    // Create a map of node IDs to nodes for quick lookup
    const nodeMap: Record<string, JsonLogicNode> = {};
    nodes.forEach(node => {
      nodeMap[node.id] = node;
    });
    
    // Build a map of node IDs to their child nodes
    const childrenMap = buildNodeChildrenMap(nodes, edges);
    
    // Find the root node
    const rootNode = findRootNode(nodes);
    if (!rootNode) {
      return {
        jsonLogic: null,
        isValid: false,
        errors: ['No root node found in the graph']
      };
    }
    
    // Build JSON Logic starting from the root node
    const jsonLogic = buildJsonLogicFromNode(rootNode.id, nodeMap, childrenMap);
    
    return {
      jsonLogic,
      isValid: !!jsonLogic,
      errors: jsonLogic ? undefined : ['Invalid JSON Logic structure']
    };
  } catch (error) {
    return {
      jsonLogic: null,
      isValid: false,
      errors: [(error as Error).message]
    };
  }
};

// Convert JSON Logic to ReactFlow graph
export const jsonLogicToGraph = (jsonLogic: any): { nodes: JsonLogicNode[], edges: JsonLogicEdge[] } => {
  const nodes: JsonLogicNode[] = [];
  const edges: JsonLogicEdge[] = [];
  let nodeIdCounter = 0;
  
  // Create a root node
  const rootNodeId = `node_${nodeIdCounter++}`;
  nodes.push({
    id: rootNodeId,
    type: NodeType.ROOT,
    position: { x: 250, y: 50 },
    data: { type: NodeType.ROOT }
  });
  
  // Recursively process JSON Logic and create nodes and edges
  const processJsonLogic = (logic: any, parentNodeId: string, handleId: string = '0'): string => {
    if (logic === null || logic === undefined) {
      return parentNodeId;
    }
    
    // Handle primitive values (string, number, boolean)
    if (typeof logic !== 'object') {
      const nodeId = `node_${nodeIdCounter++}`;
      const valueType = typeof logic as 'string' | 'number' | 'boolean';
      
      nodes.push({
        id: nodeId,
        type: NodeType.VALUE,
        position: { x: 100, y: 100 + nodeIdCounter * 50 },
        data: {
          type: NodeType.VALUE,
          valueType,
          value: logic
        }
      });
      
      edges.push({
        id: `edge_${parentNodeId}_${nodeId}`,
        source: nodeId,
        target: parentNodeId,
        targetHandle: `input-${handleId}`
      });
      
      return nodeId;
    }
    
    // Handle objects (operators, variables, etc.)
    const keys = Object.keys(logic);
    if (keys.length === 0) {
      return parentNodeId;
    }
    
    const operator = keys[0];
    const args = logic[operator];
    
    if (operator === 'var') {
      // Handle variable nodes
      const nodeId = `node_${nodeIdCounter++}`;
      const path = Array.isArray(args) ? args : [args];
      
      nodes.push({
        id: nodeId,
        type: NodeType.VAR,
        position: { x: 100, y: 100 + nodeIdCounter * 50 },
        data: {
          type: NodeType.VAR,
          path
        }
      });
      
      edges.push({
        id: `edge_${parentNodeId}_${nodeId}`,
        source: nodeId,
        target: parentNodeId,
        targetHandle: `input-${handleId}`
      });
      
      return nodeId;
    } else if (operator === 'if') {
      // Handle if nodes
      const nodeId = `node_${nodeIdCounter++}`;
      
      nodes.push({
        id: nodeId,
        type: NodeType.IF,
        position: { x: 100, y: 100 + nodeIdCounter * 50 },
        data: {
          type: NodeType.IF
        }
      });
      
      edges.push({
        id: `edge_${parentNodeId}_${nodeId}`,
        source: nodeId,
        target: parentNodeId,
        targetHandle: `input-${handleId}`
      });
      
      // Process condition, then, and else branches
      if (Array.isArray(args)) {
        for (let i = 0; i < Math.min(args.length, 3); i++) {
          processJsonLogic(args[i], nodeId, String(i));
        }
      }
      
      return nodeId;
    } else {
      // Handle operator and custom nodes
      const nodeId = `node_${nodeIdCounter++}`;
      const isBuiltInOperator = ['+', '-', '*', '/', '%', '==', '===', '!=', '!==', '>', '>=', '<', '<=', 'and', 'or', '!', 'in', 'cat', 'substr', 'merge'].includes(operator);
      
      if (isBuiltInOperator) {
        nodes.push({
          id: nodeId,
          type: NodeType.OP,
          position: { x: 100, y: 100 + nodeIdCounter * 50 },
          data: {
            type: NodeType.OP,
            op: operator
          }
        });
      } else {
        nodes.push({
          id: nodeId,
          type: NodeType.CUSTOM,
          position: { x: 100, y: 100 + nodeIdCounter * 50 },
          data: {
            type: NodeType.CUSTOM,
            name: operator,
            argCount: Array.isArray(args) ? args.length : 1
          }
        });
      }
      
      edges.push({
        id: `edge_${parentNodeId}_${nodeId}`,
        source: nodeId,
        target: parentNodeId,
        targetHandle: `input-${handleId}`
      });
      
      // Process arguments
      if (Array.isArray(args)) {
        for (let i = 0; i < args.length; i++) {
          processJsonLogic(args[i], nodeId, String(i));
        }
      } else {
        processJsonLogic(args, nodeId, '0');
      }
      
      return nodeId;
    }
  };
  
  // Start processing from the root
  if (jsonLogic !== null && jsonLogic !== undefined) {
    processJsonLogic(jsonLogic, rootNodeId);
  }
  
  return { nodes, edges };
};
