import React from 'react';
import { NodeProps } from 'reactflow';
import { NodeData, NodeType, VarNodeData } from '../../types';
import BaseNode from './BaseNode';

const VarNode: React.FC<NodeProps<NodeData>> = (props) => {
  const data = props.data as VarNodeData;
  
  return (
    <BaseNode
      {...props}
      inputHandles={0}
      outputHandles={1}
      color="#f6ffed"
    >
      <div>
        <div style={{ fontSize: '0.8em', color: '#666' }}>
          Variable
        </div>
        <div style={{ fontWeight: 'bold' }}>
          {data.path.join('.')}
        </div>
      </div>
    </BaseNode>
  );
};

export default VarNode;
