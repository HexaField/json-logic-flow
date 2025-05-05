import RootNode from './RootNode';
import ValueNode from './ValueNode';
import VarNode from './VarNode';
import OpNode from './OpNode';
import IfNode from './IfNode';
import CustomNode from './CustomNode';
import { NodeType } from '../../types';

export const nodeTypes = {
  [NodeType.ROOT]: RootNode,
  [NodeType.VALUE]: ValueNode,
  [NodeType.VAR]: VarNode,
  [NodeType.OP]: OpNode,
  [NodeType.IF]: IfNode,
  [NodeType.CUSTOM]: CustomNode,
};

export {
  RootNode,
  ValueNode,
  VarNode,
  OpNode,
  IfNode,
  CustomNode,
};
