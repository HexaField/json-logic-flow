import React from 'react';
import { NodeProps } from 'reactflow';
import { NodeData, NodeType, IfNodeData } from '../../types';
import BaseNode from './BaseNode';

const IfNode: React.FC<NodeProps<NodeData>> = (props) => {
  return (
    <BaseNode
      {...props}
      inputHandles={3}
      outputHandles={1}
      color="#fff1f0"
    >
      <div>
        <div style={{ fontSize: '0.8em', color: '#666' }}>
          Conditional
        </div>
        <div style={{ fontWeight: 'bold' }}>
          if-then-else
        </div>
      </div>
    </BaseNode>
  );
};

export default IfNode;
