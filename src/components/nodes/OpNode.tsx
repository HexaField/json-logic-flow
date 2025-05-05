import React from 'react';
import { NodeProps } from 'reactflow';
import { NodeData, NodeType, OpNodeData } from '../../types';
import BaseNode from './BaseNode';

// Map of operators to their input handle count
const operatorInputMap: Record<string, number> = {
  '+': 2,
  '-': 2,
  '*': 2,
  '/': 2,
  '%': 2,
  '==': 2,
  '===': 2,
  '!=': 2,
  '!==': 2,
  '>': 2,
  '>=': 2,
  '<': 2,
  '<=': 2,
  'and': 2,
  'or': 2,
  '!': 1,
  'in': 2,
  'cat': 2,
  'substr': 3,
  'merge': 2,
  'if': 3,
  // Add more operators as needed
};

const OpNode: React.FC<NodeProps<NodeData>> = (props) => {
  const data = props.data as OpNodeData;
  const inputHandles = operatorInputMap[data.op] || 2;
  
  return (
    <BaseNode
      {...props}
      inputHandles={inputHandles}
      outputHandles={1}
      color="#fff7e6"
    >
      <div>
        <div style={{ fontSize: '0.8em', color: '#666' }}>
          Operator
        </div>
        <div style={{ fontWeight: 'bold' }}>
          {data.op}
        </div>
      </div>
    </BaseNode>
  );
};

export default OpNode;
