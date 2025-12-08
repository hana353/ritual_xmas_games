import DecorItemElement from "@/app/ui/decor-item-element";
import { DraggableItem, TreeState } from "@/app/lib/definitions";
import { DraggableEventHandler } from "react-draggable";
import { Rnd, RndResizeCallback } from "react-rnd";
import { MouseEventHandler, TouchEventHandler } from "react";
import { prefix } from "@/app/lib/prefix";

export default function DecorBox({
  tree,
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
  onTreeResize
}: {
  tree: TreeState | null,
  background: string | null,
  decorItems: DraggableItem[],
  exportNodeRef: React.RefObject<HTMLDivElement | null>,
  onDragStop: DraggableEventHandler,
  onResizeStop: RndResizeCallback,
  onDoubleClick: MouseEventHandler<HTMLImageElement>,
  onTouchStart: TouchEventHandler<HTMLImageElement>,
  onRotate: (id: number, delta: number) => void,
  onResize?: (id: number, width: number, height: number) => void,
  onTreeDragStop: DraggableEventHandler,
  onTreeResizeStop: RndResizeCallback,
  onTreeRotate: (delta: number) => void,
  onTreeResize?: (width: number, height: number) => void
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
      
      {/* Tree layer - draggable and resizable freely like other items */}
      {tree && (
        <Rnd
          position={{ x: tree.x, y: tree.y }}
          size={{ width: tree.width, height: tree.height }}
          onDragStop={onTreeDragStop}
          onResizeStop={onTreeResizeStop}
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
              src={`${prefix}/${tree.imageSrc}`}
              alt="Decoration tree"
              className="w-full h-full object-contain"
              draggable={false}
            />
            {/* Tree controls - show on hover */}
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 bg-black/50 rounded px-2 py-1">
              <button
                className="text-white text-xs px-2 py-1 bg-blue-500 rounded hover:bg-blue-600"
                onClick={(e) => { e.stopPropagation(); onTreeRotate(-15); }}
              >
                ↺
              </button>
              <button
                className="text-white text-xs px-2 py-1 bg-blue-500 rounded hover:bg-blue-600"
                onClick={(e) => { e.stopPropagation(); onTreeRotate(15); }}
              >
                ↻
              </button>
              <button
                className="text-white text-xs px-2 py-1 bg-green-500 rounded hover:bg-green-600"
                onClick={(e) => { e.stopPropagation(); onTreeResize?.(tree.width + 20, tree.height + 20); }}
              >
                +
              </button>
              <button
                className="text-white text-xs px-2 py-1 bg-red-500 rounded hover:bg-red-600"
                onClick={(e) => { e.stopPropagation(); onTreeResize?.(Math.max(50, tree.width - 20), Math.max(50, tree.height - 20)); }}
              >
                −
              </button>
            </div>
          </div>
        </Rnd>
      )}
      
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
