import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { NodeData } from '../../types';

export interface BaseNodeProps extends NodeProps<NodeData> {
  inputHandles?: number;
  outputHandles?: number;
  color?: string;
  children?: React.ReactNode;
}

const BaseNode: React.FC<BaseNodeProps> = ({
  id,
  data,
  selected,
  inputHandles = 1,
  outputHandles = 1,
  color = '#fff',
  children,
}) => {
  return (
    <div
      style={{
        padding: '10px',
        borderRadius: '5px',
        backgroundColor: color,
        border: selected ? '2px solid #1a192b' : '1px solid #ddd',
        width: '150px',
      }}
    >
      {/* Input handles */}
      {Array.from({ length: inputHandles }).map((_, index) => (
        <Handle
          key={`input-${index}`}
          type="target"
          position={Position.Top}
          id={`input-${index}`}
          style={{ 
            left: `${(index + 1) * (100 / (inputHandles + 1))}%`,
            top: 0,
          }}
        />
      ))}

      {/* Node content */}
      <div style={{ textAlign: 'center' }}>
        {data.label || id}
        {children}
      </div>

      {/* Output handles */}
      {Array.from({ length: outputHandles }).map((_, index) => (
        <Handle
          key={`output-${index}`}
          type="source"
          position={Position.Bottom}
          id={`output-${index}`}
          style={{ 
            left: `${(index + 1) * (100 / (outputHandles + 1))}%`,
            bottom: 0,
          }}
        />
      ))}
    </div>
  );
};

export default BaseNode;
