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
  onTouchStart,
  onRotate,
  onResize
}: {
  tree: string,
  decorItems: DraggableItem[],
  exportNodeRef: React.RefObject<HTMLDivElement | null>,
  onDragStop: DraggableEventHandler,
  onResizeStop: RndResizeCallback,
  onDoubleClick: MouseEventHandler<HTMLImageElement>,
  onTouchStart: TouchEventHandler<HTMLImageElement>,
  onRotate: (id: number, delta: number) => void,
  onResize?: (id: number, width: number, height: number) => void
}) {
  return (
    <div ref={exportNodeRef} className="w-full h-full relative">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${prefix}/assets/background.png)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat'
        }}
      />
      
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
