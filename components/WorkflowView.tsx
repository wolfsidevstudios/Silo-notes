import React, { useState, useEffect, useRef } from 'react';
import { Board, Space } from '../types';
import { BackIcon, HashtagIcon, PlusIcon, ConnectIcon } from './icons';

type NodeType = 'process' | 'decision';

interface WorkflowNode {
  id: string;
  text: string;
  type: NodeType;
  position: { x: number; y: number };
}

interface WorkflowEdge {
    id: string;
    source: string;
    target: string;
}

const NODE_SIZES = {
    process: { width: 160, height: 80 },
    decision: { width: 120, height: 120 },
}

const WorkflowNodeComponent: React.FC<{
  node: WorkflowNode;
  onMouseDown: (e: React.MouseEvent, nodeId: string) => void;
  onDoubleClick: (nodeId: string) => void;
  onClick: (nodeId: string) => void;
  isSelected: boolean;
}> = ({ node, onMouseDown, onDoubleClick, onClick, isSelected }) => {
  const { width, height } = NODE_SIZES[node.type];
  
  return (
    <g
      transform={`translate(${node.position.x}, ${node.position.y})`}
      onMouseDown={(e) => onMouseDown(e, node.id)}
      onDoubleClick={() => onDoubleClick(node.id)}
      onClick={() => onClick(node.id)}
      className="cursor-pointer group"
    >
      {node.type === 'process' && 
        <rect width={width} height={height} rx={8} className={`fill-white stroke-2 ${isSelected ? 'stroke-black' : 'stroke-gray-300 group-hover:stroke-gray-500'}`} />
      }
      {node.type === 'decision' &&
         <path d={`M ${width/2} 0 L ${width} ${height/2} L ${width/2} ${height} L 0 ${height/2} Z`} className={`fill-white stroke-2 ${isSelected ? 'stroke-black' : 'stroke-gray-300 group-hover:stroke-gray-500'}`} />
      }
      <foreignObject width={width} height={height} className="pointer-events-none">
        <div className="w-full h-full flex items-center justify-center p-2">
            <p className="text-center text-sm font-medium text-gray-800 break-words">{node.text}</p>
        </div>
      </foreignObject>
    </g>
  );
};

interface WorkflowViewProps {
  board: Board;
  space: Space;
  onBack: () => void;
}

const WorkflowView: React.FC<WorkflowViewProps> = ({ board, space, onBack }) => {
  const [nodes, setNodes] = useState<WorkflowNode[]>([]);
  const [edges, setEdges] = useState<WorkflowEdge[]>([]);
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, w: 1200, h: 800 });
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  
  const [isDraggingNode, setIsDraggingNode] = useState(false);
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  const [isPanning, setIsPanning] = useState(false);
  const [panStartPoint, setPanStartPoint] = useState({ x: 0, y: 0 });
  
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStartNodeId, setConnectionStartNodeId] = useState<string|null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string|null>(null);

  useEffect(() => {
    try {
        const savedData = localStorage.getItem(`workflow-${board.id}`);
        if (savedData) {
            const { nodes: savedNodes, edges: savedEdges } = JSON.parse(savedData);
            setNodes(savedNodes || []);
            setEdges(savedEdges || []);
        } else {
            setNodes([{
                id: 'root',
                text: 'Start',
                type: 'process',
                position: { x: 500, y: 100 },
            }]);
            setEdges([]);
        }
    } catch (e) { console.error("Failed to parse workflow data", e) }
  }, [board.id]);

  useEffect(() => {
    localStorage.setItem(`workflow-${board.id}`, JSON.stringify({ nodes, edges }));
  }, [nodes, edges, board.id]);
  
  useEffect(() => {
    const updateSize = () => {
        if (containerRef.current) {
            const { clientWidth, clientHeight } = containerRef.current;
            setContainerSize({ width: clientWidth, height: clientHeight });
            setViewBox(prev => ({...prev, w: clientWidth, h: clientHeight}));
        }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const getSVGPoint = (e: React.MouseEvent | React.WheelEvent): { x: number; y: number } => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const pt = svgRef.current.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const screenCTM = svgRef.current.getScreenCTM();
    return screenCTM ? pt.matrixTransform(screenCTM.inverse()) : { x: 0, y: 0 };
  };

  const addNode = (type: NodeType) => {
    const {width, height} = NODE_SIZES[type];
    const newNode: WorkflowNode = {
      id: new Date().toISOString(),
      text: type === 'process' ? 'New Step' : 'Condition?',
      type,
      position: { 
          x: viewBox.x + viewBox.w / 2 - width / 2,
          y: viewBox.y + viewBox.h / 2 - height / 2,
      },
    };
    setNodes(prev => [...prev, newNode]);
  };

  const handleNodeClick = (nodeId: string) => {
    if (isConnecting && connectionStartNodeId && connectionStartNodeId !== nodeId) {
        setEdges(prev => [...prev, { id: `${connectionStartNodeId}->${nodeId}`, source: connectionStartNodeId, target: nodeId }]);
        setIsConnecting(false);
        setConnectionStartNodeId(null);
    } else if (isConnecting) {
        setConnectionStartNodeId(nodeId);
    } else {
        setSelectedNodeId(nodeId);
    }
  };

  const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    if (isConnecting) return;
    setIsDraggingNode(true); setDraggedNodeId(nodeId);
    const point = getSVGPoint(e);
    const node = nodes.find(n => n.id === nodeId);
    if (node) setDragOffset({ x: point.x - node.position.x, y: point.y - node.position.y });
  };
  
  const handleSvgMouseDown = (e: React.MouseEvent) => {
    if (e.target === svgRef.current) {
        setIsPanning(true); setPanStartPoint({ x: e.clientX, y: e.clientY });
        setSelectedNodeId(null);
        if (isConnecting) { setIsConnecting(false); setConnectionStartNodeId(null); }
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDraggingNode && draggedNodeId) {
      const point = getSVGPoint(e);
      setNodes(nodes.map(n => n.id === draggedNodeId ? { ...n, position: { x: point.x - dragOffset.x, y: point.y - dragOffset.y } } : n));
    } else if (isPanning) {
        const dx = (e.clientX - panStartPoint.x) * (viewBox.w / containerSize.width);
        const dy = (e.clientY - panStartPoint.y) * (viewBox.h / containerSize.height);
        setViewBox(prev => ({ ...prev, x: prev.x - dx, y: prev.y - dy }));
        setPanStartPoint({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => { setIsDraggingNode(false); setDraggedNodeId(null); setIsPanning(false); };
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = 1.1;
    const { deltaY } = e;
    const point = getSVGPoint(e);
    const newW = deltaY > 0 ? viewBox.w * zoomFactor : viewBox.w / zoomFactor;
    const newH = deltaY > 0 ? viewBox.h * zoomFactor : viewBox.h / zoomFactor;
    setViewBox({ x: viewBox.x - (point.x - viewBox.x) * (newW / viewBox.w - 1), y: viewBox.y - (point.y - viewBox.y) * (newH / viewBox.h - 1), w: newW, h: newH });
  };
  
  const handleNodeDoubleClick = (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (node) { setEditingNodeId(nodeId); setEditText(node.text); }
  };
  
  const handleEditBlur = () => {
    if (editingNodeId) setNodes(nodes.map(n => n.id === editingNodeId ? { ...n, text: editText || " " } : n));
    setEditingNodeId(null); setEditText('');
  };
  
  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleEditBlur(); }
  };

  const renderedEdges = edges.map(edge => {
      const sourceNode = nodes.find(n => n.id === edge.source);
      const targetNode = nodes.find(n => n.id === edge.target);
      if (!sourceNode || !targetNode) return null;
      return { id: edge.id, source: { x: sourceNode.position.x + NODE_SIZES[sourceNode.type].width / 2, y: sourceNode.position.y + NODE_SIZES[sourceNode.type].height / 2 }, target: { x: targetNode.position.x + NODE_SIZES[targetNode.type].width / 2, y: targetNode.position.y + NODE_SIZES[targetNode.type].height / 2 } };
  }).filter(Boolean);

  const editingNode = nodes.find(n => n.id === editingNodeId);
  
  const ToolButton: React.FC<{onClick: () => void, children: React.ReactNode}> = ({onClick, children}) => (
    <button onClick={onClick} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-full bg-white hover:bg-gray-100 border">{children}</button>
  );

  return (
    <div className="p-8 lg:p-12 h-full flex flex-col">
      <header className="mb-6 flex items-center justify-between flex-shrink-0">
         <div>
            <button onClick={onBack} className="flex items-center text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors mb-4"><BackIcon /><HashtagIcon /><span className="ml-1">Back to {space.name}</span></button>
            <h1 className="text-4xl font-bold text-gray-900">{board.name}</h1>
        </div>
        <div className="flex items-center gap-2">
            <ToolButton onClick={() => addNode('process')}>+ Process</ToolButton>
            <ToolButton onClick={() => addNode('decision')}>+ Decision</ToolButton>
            <button onClick={() => {setIsConnecting(true); setConnectionStartNodeId(null)}} className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-full transition-colors ${isConnecting ? 'bg-black text-white' : 'bg-white hover:bg-gray-100 border'}`}>
                <ConnectIcon /> Connect
            </button>
        </div>
      </header>
      <div ref={containerRef} className="flex-grow bg-gray-50 rounded-lg relative overflow-hidden border border-gray-200" onMouseUp={handleMouseUp} onMouseMove={handleMouseMove} onWheel={handleWheel}>
        <svg ref={svgRef} width="100%" height="100%" viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`} onMouseDown={handleSvgMouseDown} className={isConnecting ? 'cursor-crosshair' : ''}>
           <defs>
             <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
               <polygon points="0 0, 10 3.5, 0 7" fill="#9CA3AF" />
             </marker>
           </defs>
          <g className="edges">
            {renderedEdges.map(edge => edge && <line key={edge.id} x1={edge.source.x} y1={edge.source.y} x2={edge.target.x} y2={edge.target.y} stroke="#9CA3AF" strokeWidth="2" markerEnd="url(#arrowhead)" />)}
          </g>
          <g className="nodes">
            {nodes.map(node => <WorkflowNodeComponent key={node.id} node={node} onMouseDown={handleNodeMouseDown} onDoubleClick={handleNodeDoubleClick} onClick={handleNodeClick} isSelected={selectedNodeId === node.id || connectionStartNodeId === node.id} />)}
          </g>
        </svg>
        {editingNode && containerSize.width > 0 && (
            <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onBlur={handleEditBlur} onKeyDown={handleEditKeyDown} autoFocus
                className="absolute text-center text-sm font-medium border-2 border-black rounded-lg resize-none p-2 box-border bg-white shadow-lg"
                style={{
                    top: `${(editingNode.position.y - viewBox.y) * (containerSize.height / viewBox.h)}px`,
                    left: `${(editingNode.position.x - viewBox.x) * (containerSize.width / viewBox.w)}px`,
                    width: `${NODE_SIZES[editingNode.type].width * (containerSize.width / viewBox.w)}px`,
                    height: `${NODE_SIZES[editingNode.type].height * (containerSize.height / viewBox.h)}px`,
                }}
            />
        )}
      </div>
    </div>
  );
};

export default WorkflowView;