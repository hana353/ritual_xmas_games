import { DraggableEventHandler } from "react-draggable";
import { DraggableItem } from "@/app/lib/definitions";
import { Rnd, RndResizeCallback } from "react-rnd";
import { MouseEventHandler, TouchEventHandler } from "react";
import Image from "next/image";
import { prefix } from "@/app/lib/prefix";

export default function DecorItemElement({
  item,
  onDragStop,
  onResizeStop,
  onDoubleClick,
  onTouchStart
}: {
  item: DraggableItem,
  onDragStop: DraggableEventHandler,
  onResizeStop: RndResizeCallback,
  onDoubleClick: MouseEventHandler<HTMLImageElement>,
  onTouchStart: TouchEventHandler<HTMLImageElement>
}) {
  return (
    <Rnd
      size={{
        width: item.width,
        height: item.height
      }}
      position={{
        x: item.x,
        y: item.y
      }}
      // Allow resizing without artificial max limits while keeping
      // movement behavior; the parent container already has
      // `overflow-hidden` so oversized items will be clipped visually.
      // Removing `bounds="parent"` lets users resize larger than the
      // parent while still rendering only the visible portion.
      onDragStop={onDragStop}
      onResizeStop={onResizeStop}
      minWidth={1}
      minHeight={1}
      className="hover:border-2 hover:border-gray-400 active:border-2 active:border-gray-400"
    >
      <div className="relative w-full h-full">
        <Image
          id={`${item.id}`}
          src={`${prefix}/${item.imageSrc}`}
          alt="Decoration item"
          fill
          sizes="100vw"
          style={{ objectFit: 'contain' }}
          quality={100}
          loading="eager"
          draggable={false}
          onDoubleClick={onDoubleClick}
          onTouchStart={onTouchStart}
        />
      </div>
    </Rnd>
  );
}