import React from 'react';
import { NodeProps } from 'reactflow';
import { NodeData, NodeType, ValueNodeData } from '../../types';
import BaseNode from './BaseNode';

const ValueNode: React.FC<NodeProps<NodeData>> = (props) => {
  const data = props.data as ValueNodeData;
  
  return (
    <BaseNode
      {...props}
      inputHandles={0}
      outputHandles={1}
      color="#f0f5ff"
    >
      <div>
        <div style={{ fontSize: '0.8em', color: '#666' }}>
          {data.valueType}
        </div>
        <div style={{ fontWeight: 'bold' }}>
          {typeof data.value === 'string' 
            ? `"${data.value}"` 
            : String(data.value)}
        </div>
      </div>
    </BaseNode>
  );
};

export default ValueNode;
