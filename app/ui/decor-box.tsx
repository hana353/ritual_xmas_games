import DecorItemElement from "@/app/ui/decor-item-element";
import { DraggableItem, TreeState } from "@/app/lib/definitions";
import { DraggableEventHandler, DraggableEvent, DraggableData } from "react-draggable";
import { Rnd, RndResizeCallback } from "react-rnd";
import { ResizeDirection, ResizableDelta, Position } from "re-resizable";
import { MouseEventHandler, TouchEventHandler } from "react";
import { prefix } from "@/app/lib/prefix";

export default function DecorBox({
  trees,
  background,
  decorItems,
  exportNodeRef,
  onDragStop,
  onResizeStop,
  onDoubleClick,
  onTouchStart,
  onRotate,
  onResize,
  onTreeDragStop,
  onTreeResizeStop,
  onTreeRotate,
  onTreeResize,
  onTreeDelete,
  onTreeTouchStart
}: {
  trees: TreeState[],
  background: string | null,
  decorItems: DraggableItem[],
  exportNodeRef: React.RefObject<HTMLDivElement | null>,
  onDragStop: DraggableEventHandler,
  onResizeStop: RndResizeCallback,
  onDoubleClick: MouseEventHandler<HTMLImageElement>,
  onTouchStart: TouchEventHandler<HTMLImageElement>,
  onRotate: (id: number, delta: number) => void,
  onResize?: (id: number, width: number, height: number) => void,
  onTreeDragStop: (id: number, e: DraggableEvent, data: DraggableData) => void,
  onTreeResizeStop: (id: number, e: MouseEvent | TouchEvent, direction: ResizeDirection, ref: HTMLElement, delta: ResizableDelta, position: Position) => void,
  onTreeRotate: (id: number, delta: number) => void,
  onTreeResize?: (id: number, width: number, height: number) => void,
  onTreeDelete?: (id: number) => void,
  onTreeTouchStart?: TouchEventHandler<HTMLImageElement>
}) {
  return (
    <div ref={exportNodeRef} className="w-full h-full relative">
      {/* Background layer - innermost layer, auto fill */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: background 
            ? `url(${prefix}/${background})` 
            : `url(${prefix}/assets/background.png)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat'
        }}
      />
      
      {/* Trees layer - draggable and resizable freely like other items */}
      {trees.map((tree) => (
        <Rnd
          key={`tree-${tree.id}`}
          position={{ x: tree.x, y: tree.y }}
          size={{ width: tree.width, height: tree.height }}
          onDragStop={(e, data) => onTreeDragStop(tree.id, e, data)}
          onResizeStop={(e, direction, ref, delta, position) => onTreeResizeStop(tree.id, e, direction, ref, delta, position)}
          minWidth={1}
          minHeight={1}
          className="group hover:border-2 hover:border-green-400 active:border-2 active:border-green-400"
        >
          <div 
            className="w-full h-full relative"
            style={{ 
              transform: `rotate(${tree.rotation}deg)`,
              transformOrigin: 'center center'
            }}
          >
            <img
              id={`tree-${tree.id}`}
              src={`${prefix}/${tree.imageSrc}`}
              alt="Decoration tree"
              className="w-full h-full object-contain cursor-pointer"
              draggable={false}
              onDoubleClick={() => onTreeDelete?.(tree.id)}
              onTouchStart={onTreeTouchStart}
              data-tree-id={tree.id}
            />
            {/* Tree controls - show on hover */}
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 bg-black/50 rounded px-2 py-1 z-10">
              <button
                className="text-white text-xs px-2 py-1 bg-blue-500 rounded hover:bg-blue-600"
                onClick={(e) => { e.stopPropagation(); onTreeRotate(tree.id, -15); }}
              >
                ↺
              </button>
              <button
                className="text-white text-xs px-2 py-1 bg-blue-500 rounded hover:bg-blue-600"
                onClick={(e) => { e.stopPropagation(); onTreeRotate(tree.id, 15); }}
              >
                ↻
              </button>
              <button
                className="text-white text-xs px-2 py-1 bg-green-500 rounded hover:bg-green-600"
                onClick={(e) => { e.stopPropagation(); onTreeResize?.(tree.id, tree.width + 20, tree.height + 20); }}
              >
                +
              </button>
              <button
                className="text-white text-xs px-2 py-1 bg-red-500 rounded hover:bg-red-600"
                onClick={(e) => { e.stopPropagation(); onTreeResize?.(tree.id, Math.max(50, tree.width - 20), Math.max(50, tree.height - 20)); }}
              >
                −
              </button>
              {onTreeDelete && (
                <button
                  className="text-white text-xs px-2 py-1 bg-red-600 rounded hover:bg-red-700"
                  onClick={(e) => { e.stopPropagation(); onTreeDelete(tree.id); }}
                >
                  🗑️
                </button>
              )}
            </div>
          </div>
        </Rnd>
      ))}
      
      {/* Decoration items layer - on top */}
      {decorItems.map((item) => (
        <DecorItemElement
          key={`decor-el-${item.id}`}
          item={item}
          onDragStop={onDragStop}
          onResizeStop={onResizeStop}
          onDoubleClick={onDoubleClick}
          onTouchStart={onTouchStart}
          onRotate={onRotate}
          onResize={onResize}
        />
      ))}
    </div>
  );
}
