import { DraggableEventHandler } from "react-draggable";
import { DraggableItem } from "@/app/lib/definitions";
import { Rnd, RndResizeCallback } from "react-rnd";
import { MouseEventHandler, TouchEventHandler, WheelEventHandler } from "react";
import Image from "next/image";
import { prefix } from "@/app/lib/prefix";

export default function DecorItemElement({
  item,
  onDragStop,
  onResizeStop,
  onDoubleClick,
  onTouchStart,
  onRotate // Thêm prop mới
}: {
  item: DraggableItem,
  onDragStop: DraggableEventHandler,
  onResizeStop: RndResizeCallback,
  onDoubleClick: MouseEventHandler<HTMLImageElement>,
  onTouchStart: TouchEventHandler<HTMLImageElement>,
  onRotate: (id: number, delta: number) => void // Thêm type
}) {
  const handleWheel: WheelEventHandler<HTMLDivElement> = (e) => {
    // Chỉ xoay khi giữ Shift
    if (e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      // Xoay 15 độ mỗi lần scroll
      const delta = e.deltaY > 0 ? 15 : -15;
      onRotate(item.id, delta);
    }
  };

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
      onDragStop={onDragStop}
      onResizeStop={onResizeStop}
      minWidth={1}
      minHeight={1}
      className="hover:border-2 hover:border-gray-400 active:border-2 active:border-gray-400"
    >
      <div 
        className="relative w-full h-full"
        onWheel={handleWheel}
        style={{
          transform: `rotate(${item.rotation}deg)`,
          transformOrigin: 'center center'
        }}
      >
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