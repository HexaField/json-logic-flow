# JSON Logic Flow Editor Implementation Plan

## 1. Layout
- **Node Palette** (left): drag‑and‑drop nodes  
- **Canvas** (center): connect nodes into a graph  
- **Inspector & Preview** (right): edit node data and view live JSON Logic

## 2. Node Types
- **Root**: entry point, single input handle  
- **Value**: literals (`number|string|boolean`), 0 inputs, 1 output, data: `{ type, value }`  
- **Var**: variable lookup, 0 inputs, 1 output, data: `{ path: string[] }`  
- **Op**: built‑in operators (`+`, `-`, `*`, `/`, `==`, `!=`, `and`, `or`, `!`, `in`, etc.), N inputs, 1 output, data: `{ op: string }`  
- **If**: conditional, 3 inputs (cond, then, else), 1 output  
- **Custom**: extension ops (`merge`, `append`, `set`, etc.), M inputs, 1 output, data: `{ name, argCount }`

## 3. Node Palette
- **Literal**: prompt for type & default value  
- **Variable**: prompt for JSON Logic path (e.g. `state.userID`)  
- **Operator**: select built‑in op  
- **Conditional**: `if` node  
- **Custom**: register your own ops

## 4. Graph → JSON Logic
1. Build a map of node IDs → child node IDs from edges  
2. Recursively generate JSON Logic:
   - **Value** → raw literal  
   - **Var** → `{ "var": pathArray }`  
   - **Op** → `{ opName: [ ...childValues ] }`  
   - **If** → `{ "if": [ cond, then, else ] }`  
   - **Custom** → `{ name: [ ...childValues ] }`

## 5. Inspector & Live Preview
- **Node selection**: show/edit `node.data` (literal value, var path, op type)  
- **Live Preview**: display full JSON Logic, “Copy to clipboard” button  
- **Validation**: highlight nodes with input arity mismatches or missing data

## 6. Core Implementation
- **Node data interfaces**: define `NodeData` variants for each node type  
- **Register node types**: map your React Flow nodeType keys to React components  
- **Handle changes**:
  - `onConnect` → `addEdge`
  - `onNodesChange`, `onEdgesChange` → update graph state  
  - `addNode` → palette drag/drop  
- **JSON Logic builder**: implement `buildJsonLogic(nodes, edges)` per §4  
- **Props panel**: bind selected node → form inputs → update `node.data`

## 7. Next Steps
- Flesh out the Inspector: value editors, path autocompletion, op dropdown  
- Add undo/redo & node deletion confirmation  
- Create prebuilt graphs for your two examples  
- Integrate `json-logic-js` to execute & validate transforms on sample data  
