import { Node, Edge } from 'reactflow';

// Node types
export enum NodeType {
  ROOT = 'root',
  VALUE = 'value',
  VAR = 'var',
  OP = 'op',
  IF = 'if',
  CUSTOM = 'custom',
}

// Base node data interface
export interface BaseNodeData {
  label?: string;
}

// Root node data
export interface RootNodeData extends BaseNodeData {
  type: NodeType.ROOT;
}

// Value node data
export interface ValueNodeData extends BaseNodeData {
  type: NodeType.VALUE;
  valueType: 'string' | 'number' | 'boolean';
  value: string | number | boolean;
}

// Variable node data
export interface VarNodeData extends BaseNodeData {
  type: NodeType.VAR;
  path: string[];
}

// Operator node data
export interface OpNodeData extends BaseNodeData {
  type: NodeType.OP;
  op: string;
}

// If node data
export interface IfNodeData extends BaseNodeData {
  type: NodeType.IF;
}

// Custom node data
export interface CustomNodeData extends BaseNodeData {
  type: NodeType.CUSTOM;
  name: string;
  argCount: number;
}

// Union type for all node data
export type NodeData =
  | RootNodeData
  | ValueNodeData
  | VarNodeData
  | OpNodeData
  | IfNodeData
  | CustomNodeData;

// Typed Node
export type JsonLogicNode = Node<NodeData>;

// Typed Edge
export type JsonLogicEdge = Edge;

// JSON Logic Flow props
export interface JsonLogicFlowProps {
  nodes?: JsonLogicNode[];
  edges?: JsonLogicEdge[];
  onNodesChange?: (changes: any) => void;
  onEdgesChange?: (changes: any) => void;
  onConnect?: (params?: any) => void;
  onNodeSelect?: (node: JsonLogicNode | null) => void;
  readOnly?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

// JSON Logic result
export interface JsonLogicResult {
  jsonLogic: any;
  isValid: boolean;
  errors?: string[];
}
