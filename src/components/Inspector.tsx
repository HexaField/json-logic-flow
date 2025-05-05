import React, { useState, useEffect } from 'react';
import { JsonLogicNode, NodeType, NodeData, ValueNodeData, VarNodeData, OpNodeData, CustomNodeData } from '../types';

export interface InspectorProps {
  selectedNode: JsonLogicNode | null;
  onNodeDataChange: (nodeId: string, data: NodeData) => void;
  jsonLogic: any;
}

const Inspector: React.FC<InspectorProps> = ({ selectedNode, onNodeDataChange, jsonLogic }) => {
  const [nodeData, setNodeData] = useState<NodeData | null>(null);

  useEffect(() => {
    if (selectedNode) {
      setNodeData(selectedNode.data);
    } else {
      setNodeData(null);
    }
  }, [selectedNode]);

  const handleDataChange = (updatedData: NodeData) => {
    if (selectedNode) {
      setNodeData(updatedData);
      onNodeDataChange(selectedNode.id, updatedData);
    }
  };

  const renderValueNodeEditor = (data: ValueNodeData) => {
    return (
      <div>
        <div className="form-group">
          <label>Value Type</label>
          <select
            value={data.valueType}
            onChange={(e) => {
              const valueType = e.target.value as 'string' | 'number' | 'boolean';
              let value: string | number | boolean = '';
              
              // Convert the current value to the new type
              if (valueType === 'string') {
                value = String(data.value);
              } else if (valueType === 'number') {
                value = Number(data.value) || 0;
              } else if (valueType === 'boolean') {
                value = Boolean(data.value);
              }
              
              handleDataChange({
                ...data,
                valueType,
                value,
              });
            }}
          >
            <option value="string">String</option>
            <option value="number">Number</option>
            <option value="boolean">Boolean</option>
          </select>
        </div>
        
        <div className="form-group">
          <label>Value</label>
          {data.valueType === 'string' && (
            <input
              type="text"
              value={data.value as string}
              onChange={(e) => handleDataChange({ ...data, value: e.target.value })}
            />
          )}
          {data.valueType === 'number' && (
            <input
              type="number"
              value={data.value as number}
              onChange={(e) => handleDataChange({ ...data, value: Number(e.target.value) })}
            />
          )}
          {data.valueType === 'boolean' && (
            <select
              value={String(data.value)}
              onChange={(e) => handleDataChange({ ...data, value: e.target.value === 'true' })}
            >
              <option value="true">True</option>
              <option value="false">False</option>
            </select>
          )}
        </div>
      </div>
    );
  };

  const renderVarNodeEditor = (data: VarNodeData) => {
    return (
      <div className="form-group">
        <label>Variable Path</label>
        <input
          type="text"
          value={data.path.join('.')}
          onChange={(e) => {
            const path = e.target.value.split('.');
            handleDataChange({ ...data, path });
          }}
          placeholder="e.g. user.name"
        />
      </div>
    );
  };

  const renderOpNodeEditor = (data: OpNodeData) => {
    const operators = [
      '+', '-', '*', '/', '%',
      '==', '===', '!=', '!==',
      '>', '>=', '<', '<=',
      'and', 'or', '!',
      'in', 'cat', 'substr',
      'merge', 'if'
    ];

    return (
      <div className="form-group">
        <label>Operator</label>
        <select
          value={data.op}
          onChange={(e) => handleDataChange({ ...data, op: e.target.value })}
        >
          {operators.map((op) => (
            <option key={op} value={op}>
              {op}
            </option>
          ))}
        </select>
      </div>
    );
  };

  const renderCustomNodeEditor = (data: CustomNodeData) => {
    return (
      <div>
        <div className="form-group">
          <label>Name</label>
          <input
            type="text"
            value={data.name}
            onChange={(e) => handleDataChange({ ...data, name: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Argument Count</label>
          <input
            type="number"
            min="0"
            value={data.argCount}
            onChange={(e) => handleDataChange({ ...data, argCount: Number(e.target.value) })}
          />
        </div>
      </div>
    );
  };

  const renderNodeEditor = () => {
    if (!nodeData) return null;

    switch (nodeData.type) {
      case NodeType.VALUE:
        return renderValueNodeEditor(nodeData as ValueNodeData);
      case NodeType.VAR:
        return renderVarNodeEditor(nodeData as VarNodeData);
      case NodeType.OP:
        return renderOpNodeEditor(nodeData as OpNodeData);
      case NodeType.CUSTOM:
        return renderCustomNodeEditor(nodeData as CustomNodeData);
      default:
        return <div>No editable properties for this node type.</div>;
    }
  };

  return (
    <div className="json-logic-flow-inspector">
      <div className="json-logic-flow-inspector-node">
        <h3>Node Inspector</h3>
        {selectedNode ? (
          <div>
            <div className="form-group">
              <label>Node ID</label>
              <input type="text" value={selectedNode.id} disabled />
            </div>
            <div className="form-group">
              <label>Node Type</label>
              <input type="text" value={selectedNode.type} disabled />
            </div>
            {renderNodeEditor()}
          </div>
        ) : (
          <div>No node selected</div>
        )}
      </div>
      
      <div className="json-logic-flow-inspector-preview">
        <h3>JSON Logic Preview</h3>
        <pre style={{ 
          backgroundColor: '#f5f5f5', 
          padding: '10px', 
          borderRadius: '4px',
          overflow: 'auto',
          maxHeight: '200px'
        }}>
          {JSON.stringify(jsonLogic, null, 2)}
        </pre>
        <button
          onClick={() => {
            navigator.clipboard.writeText(JSON.stringify(jsonLogic));
          }}
        >
          Copy to Clipboard
        </button>
      </div>
    </div>
  );
};

export default Inspector;
