import React from 'react';
import { NodeProps } from 'reactflow';
import { NodeData, NodeType, RootNodeData } from '../../types';
import BaseNode from './BaseNode';

const RootNode: React.FC<NodeProps<NodeData>> = (props) => {
  return (
    <BaseNode
      {...props}
      inputHandles={1}
      outputHandles={0}
      color="#e6f7ff"
    >
      <div>Root</div>
    </BaseNode>
  );
};

export default RootNode;
