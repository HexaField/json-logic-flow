import React from 'react';
import { NodeType } from '../types';

export interface NodePaletteItem {
  type: NodeType;
  label: string;
  description?: string;
}

export interface NodePaletteProps {
  items: NodePaletteItem[];
  onDragStart: (event: React.DragEvent<HTMLDivElement>, nodeType: NodeType) => void;
}

const NodePalette: React.FC<NodePaletteProps> = ({ items, onDragStart }) => {
  return (
    <div className="json-logic-flow-palette">
      <h3>Node Palette</h3>
      <div className="json-logic-flow-palette-items">
        {items.map((item) => (
          <div
            key={item.type}
            className="json-logic-flow-palette-item"
            draggable
            onDragStart={(event) => onDragStart(event, item.type)}
            style={{
              padding: '8px',
              margin: '4px 0',
              backgroundColor: '#f5f5f5',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: 'grab',
            }}
          >
            <div style={{ fontWeight: 'bold' }}>{item.label}</div>
            {item.description && (
              <div style={{ fontSize: '0.8em', color: '#666' }}>{item.description}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default NodePalette;
