import DecorItemElement from "@/app/ui/decor-item-element";
import Image from "next/image";
import { DraggableItem } from "@/app/lib/definitions";
import { DraggableEventHandler } from "react-draggable";
import { RndResizeCallback } from "react-rnd";
import { MouseEventHandler, TouchEventHandler } from "react";
import { prefix } from "@/app/lib/prefix";

export default function DecorBox({
  tree,
  decorItems,
  exportNodeRef,
  onDragStop,
  onResizeStop,
  onDoubleClick,
  onTouchStart
}: {
  tree: string,
  decorItems: DraggableItem[],
  exportNodeRef: React.RefObject<HTMLDivElement | null>,
  onDragStop: DraggableEventHandler,
  onResizeStop: RndResizeCallback,
  onDoubleClick: MouseEventHandler<HTMLImageElement>,
  onTouchStart: TouchEventHandler<HTMLImageElement>
}) {
  return (
    <div ref={exportNodeRef} className="w-full h-full relative">
      {/* Background color */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: '#0B6E4F' }}
      />
      
      {/* Main tree image */}
      <div className="relative w-full h-full">
        <Image
          src={`${prefix}/${tree}`}
          alt="Decoration tree"
          fill
          sizes="100vw"
          style={{ objectFit: 'contain' }}
          quality={100}
          priority
          draggable={false}
        />
      </div>
      {/* Render current decoration items */}
      {decorItems.map((item) => (
        <DecorItemElement
          key={`decor-el-${item.id}`}
          item={item}
          onDragStop={onDragStop}
          onResizeStop={onResizeStop}
          onDoubleClick={onDoubleClick}
          onTouchStart={onTouchStart}
        />
      ))}
    </div>
  );
}