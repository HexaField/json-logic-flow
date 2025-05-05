# JSON Logic Flow

A React library that creates a ReactFlow interface for json-logic-js with TypeScript support.

## Features

- Visual editor for creating and editing JSON Logic rules
- Drag-and-drop interface for building complex logic
- Live preview of the generated JSON Logic
- TypeScript support
- Customizable node types
- Import/export JSON Logic

## Installation

```bash
npm install json-logic-flow
```

## Usage

```tsx
import React, { useState, useCallback } from 'react';
import { JsonLogicFlow, JsonLogicNode, JsonLogicEdge } from 'json-logic-flow';
import 'reactflow/dist/style.css';

const App: React.FC = () => {
  const [nodes, setNodes] = useState<JsonLogicNode[]>([]);
  const [edges, setEdges] = useState<JsonLogicEdge[]>([]);

  const handleNodesChange = useCallback((updatedNodes: JsonLogicNode[]) => {
    setNodes(updatedNodes);
  }, []);

  const handleEdgesChange = useCallback((updatedEdges: JsonLogicEdge[]) => {
    setEdges(updatedEdges);
  }, []);

  return (
    <div style={{ width: '100%', height: '600px' }}>
      <JsonLogicFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
      />
    </div>
  );
};

export default App;
```

## Node Types

JSON Logic Flow supports the following node types:

- **Root**: Entry point for the JSON Logic rule
- **Value**: Literal values (string, number, boolean)
- **Var**: Variable references from the data object
- **Op**: Built-in operators (+, -, *, /, ==, etc.)
- **If**: Conditional logic (if-then-else)
- **Custom**: Custom operations

## Components

### JsonLogicFlow

The main component that provides the visual editor.

#### Props

- `nodes`: Array of JsonLogicNode objects
- `edges`: Array of JsonLogicEdge objects
- `onNodesChange`: Callback when nodes change
- `onEdgesChange`: Callback when edges change
- `onConnect`: Callback when nodes are connected
- `onNodeSelect`: Callback when a node is selected
- `readOnly`: Whether the editor is read-only
- `className`: Additional CSS class name
- `style`: Additional CSS styles

### NodePalette

A component that displays a palette of available nodes.

### Inspector

A component that displays and allows editing of the selected node's properties.

## Utilities

### graphToJsonLogic

Converts a ReactFlow graph to JSON Logic.

```tsx
import { graphToJsonLogic } from 'json-logic-flow';

const result = graphToJsonLogic(nodes, edges);
console.log(result.jsonLogic);
```

### jsonLogicToGraph

Converts JSON Logic to a ReactFlow graph.

```tsx
import { jsonLogicToGraph } from 'json-logic-flow';

const { nodes, edges } = jsonLogicToGraph(jsonLogic);
```

## Example

See the `example` directory for a complete example of how to use JSON Logic Flow.

## License

MIT
