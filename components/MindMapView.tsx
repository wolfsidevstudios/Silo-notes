import React, { useState, useEffect, useRef } from 'react';
import { Board, Space } from '../types';
import { BackIcon, HashtagIcon } from './icons';

interface MindMapNodeData {
  id: string;
  text: string;
  position: { x: number; y: number };
  parentId: string | null;
}

const NODE_WIDTH = 160;
const NODE_HEIGHT = 60;

// MindMapNode Component
const MindMapNode: React.FC<{
  node: MindMapNodeData;
  onMouseDown: (e: React.MouseEvent, nodeId: string) => void;
  onDoubleClick: (e: React.MouseEvent, nodeId: string) => void;
}> = ({ node, onMouseDown, onDoubleClick }) => {
  return (
    <g
      transform={`translate(${node.position.x}, ${node.position.y})`}
      onMouseDown={(e) => onMouseDown(e, node.id)}
      onDoubleClick={(e) => onDoubleClick(e, node.id)}
      className="cursor-pointer group"
    >
      <rect
        width={NODE_WIDTH}
        height={NODE_HEIGHT}
        rx={8}
        className="fill-white stroke-gray-300 group-hover:stroke-black transition-colors"
        strokeWidth="2"
      />
      <foreignObject width={NODE_WIDTH} height={NODE_HEIGHT} className="pointer-events-none">
        <div className="w-full h-full flex items-center justify-center p-2">
            <p className="text-center text-sm font-medium text-gray-800 break-words">
                {node.text}
            </p>
        </div>
      </foreignObject>
    </g>
  );
};

interface MindMapViewProps {
  board: Board;
  space: Space;
  onBack: () => void;
}

const MindMapView: React.FC<MindMapViewProps> = ({ board, space, onBack }) => {
  const [nodes, setNodes] = useState<MindMapNodeData[]>([]);
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

  useEffect(() => {
    const savedNodes = localStorage.getItem(`mindmap-${board.id}`);
    if (savedNodes) {
      setNodes(JSON.parse(savedNodes));
    } else {
      setNodes([{
        id: 'root',
        text: board.name,
        position: { x: 500, y: 300 },
        parentId: null
      }]);
    }
  }, [board.id, board.name]);

  useEffect(() => {
    if (nodes.length > 0) {
      localStorage.setItem(`mindmap-${board.id}`, JSON.stringify(nodes));
    }
  }, [nodes, board.id]);
  
  useEffect(() => {
    const updateSize = () => {
        if (containerRef.current) {
            setContainerSize({
                width: containerRef.current.clientWidth,
                height: containerRef.current.clientHeight,
            });
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

  const addNode = (parentId: string) => {
    const parentNode = nodes.find(n => n.id === parentId);
    if (!parentNode) return;
    const childCount = nodes.filter(n => n.parentId === parentId).length;
    const newNode: MindMapNodeData = {
      id: new Date().toISOString(),
      text: 'New Idea',
      position: {
        x: parentNode.position.x - (NODE_WIDTH / 2) + (childCount * (NODE_WIDTH + 40)),
        y: parentNode.position.y + NODE_HEIGHT + 60
      },
      parentId,
    };
    setNodes(prev => [...prev, newNode]);
  };

  const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    setIsDraggingNode(true);
    setDraggedNodeId(nodeId);
    const node = nodes.find(n => n.id === nodeId);
    const point = getSVGPoint(e);
    if (node) {
      setDragOffset({ x: point.x - node.position.x, y: point.y - node.position.y });
    }
  };
  
  const handleSvgMouseDown = (e: React.MouseEvent) => {
    if (e.target === svgRef.current || (e.target as SVGGraphicsElement).ownerSVGElement === svgRef.current) {
        setIsPanning(true);
        setPanStartPoint({ x: e.clientX, y: e.clientY });
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

  const handleMouseUp = () => {
    setIsDraggingNode(false);
    setDraggedNodeId(null);
    setIsPanning(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = 1.1;
    const { deltaY } = e;
    const point = getSVGPoint(e);
    const newW = deltaY > 0 ? viewBox.w * zoomFactor : viewBox.w / zoomFactor;
    const newH = deltaY > 0 ? viewBox.h * zoomFactor : viewBox.h / zoomFactor;
    const dx = (point.x - viewBox.x) * (newW / viewBox.w - 1);
    const dy = (point.y - viewBox.y) * (newH / viewBox.h - 1);
    setViewBox({ x: viewBox.x - dx, y: viewBox.y - dy, w: newW, h: newH });
  };
  
  const handleNodeDoubleClick = (e: React.MouseEvent, nodeId: string) => {
    if (e.altKey || e.metaKey) { addNode(nodeId); return; }
    const node = nodes.find(n => n.id === nodeId);
    if (node) { setEditingNodeId(nodeId); setEditText(node.text); }
  };
  
  const handleEditBlur = () => {
    if (editingNodeId) {
        setNodes(nodes.map(n => n.id === editingNodeId ? { ...n, text: editText || " " } : n));
        setEditingNodeId(null);
        setEditText('');
    }
  };
  
  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleEditBlur(); }
  };

  const edges = nodes.map(node => {
      const parent = nodes.find(p => p.id === node.parentId);
      if (!parent) return null;
      return {
        id: `${parent.id}-${node.id}`,
        source: { x: parent.position.x + NODE_WIDTH / 2, y: parent.position.y + NODE_HEIGHT },
        target: { x: node.position.x + NODE_WIDTH / 2, y: node.position.y }
      };
    }).filter(Boolean);

  const editingNode = nodes.find(n => n.id === editingNodeId);
  
  return (
    <div className="p-8 lg:p-12 h-full flex flex-col">
      <header className="mb-6 flex items-center justify-between flex-shrink-0">
         <div>
            <button onClick={onBack} className="flex items-center text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors mb-4">
              <BackIcon />
              <HashtagIcon />
              <span className="ml-1">Back to {space.name}</span>
            </button>
            <h1 className="text-4xl font-bold text-gray-900">{board.name}</h1>
            <p className="text-gray-500 mt-2 text-sm">Double click a node to edit. Alt/Meta + Double click to add a child.</p>
        </div>
      </header>
      <div ref={containerRef} className="flex-grow bg-gray-50 rounded-lg relative overflow-hidden border border-gray-200" onMouseUp={handleMouseUp} onMouseMove={handleMouseMove} onWheel={handleWheel}>
        <svg ref={svgRef} width="100%" height="100%" viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`} onMouseDown={handleSvgMouseDown}>
          <g className="edges">
            {edges.map(edge => (
              edge && <path
                key={edge.id}
                d={`M ${edge.source.x} ${edge.source.y} C ${edge.source.x} ${edge.source.y + 40}, ${edge.target.x} ${edge.target.y - 40}, ${edge.target.x} ${edge.target.y}`}
                stroke="#9CA3AF"
                strokeWidth="2"
                fill="none"
              />
            ))}
          </g>
          <g className="nodes">
            {nodes.map(node => <MindMapNode key={node.id} node={node} onMouseDown={handleNodeMouseDown} onDoubleClick={handleNodeDoubleClick} />)}
          </g>
        </svg>
        {editingNode && containerSize.width > 0 && (
            <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onBlur={handleEditBlur}
                onKeyDown={handleEditKeyDown}
                autoFocus
                className="absolute text-center text-sm font-medium border-2 border-black rounded-lg resize-none p-2 box-border bg-white shadow-lg"
                style={{
                    top: `${(editingNode.position.y - viewBox.y) * (containerSize.height / viewBox.h)}px`,
                    left: `${(editingNode.position.x - viewBox.x) * (containerSize.width / viewBox.w)}px`,
                    width: `${NODE_WIDTH * (containerSize.width / viewBox.w)}px`,
                    height: `${NODE_HEIGHT * (containerSize.height / viewBox.h)}px`,
                }}
            />
        )}
      </div>
    </div>
  );
};

export default MindMapView;