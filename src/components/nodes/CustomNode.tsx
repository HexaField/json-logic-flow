import React from 'react';
import { NodeProps } from 'reactflow';
import { NodeData, NodeType, CustomNodeData } from '../../types';
import BaseNode from './BaseNode';

const CustomNode: React.FC<NodeProps<NodeData>> = (props) => {
  const data = props.data as CustomNodeData;
  
  return (
    <BaseNode
      {...props}
      inputHandles={data.argCount}
      outputHandles={1}
      color="#f9f0ff"
    >
      <div>
        <div style={{ fontSize: '0.8em', color: '#666' }}>
          Custom
        </div>
        <div style={{ fontWeight: 'bold' }}>
          {data.name}
        </div>
      </div>
    </BaseNode>
  );
};

export default CustomNode;
