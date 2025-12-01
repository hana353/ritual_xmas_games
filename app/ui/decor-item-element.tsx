import { DraggableEventHandler } from "react-draggable";
import { DraggableItem } from "@/app/lib/definitions";
import { Rnd, RndResizeCallback } from "react-rnd";
import { MouseEventHandler, TouchEventHandler, useRef, useState, useEffect } from "react";
import Image from "next/image";
import { prefix } from "@/app/lib/prefix";

export default function DecorItemElement({
  item,
  onDragStop,
  onResizeStop,
  onDoubleClick,
  onTouchStart,
  onRotate,
  onResize
}: {
  item: DraggableItem,
  onDragStop: DraggableEventHandler,
  onResizeStop: RndResizeCallback,
  onDoubleClick: MouseEventHandler<HTMLImageElement>,
  onTouchStart: TouchEventHandler<HTMLImageElement>,
  onRotate: (id: number, delta: number) => void,
  onResize?: (id: number, width: number, height: number) => void
}) {
  const rotationHandleRef = useRef<HTMLDivElement>(null);
  const [isRotating, setIsRotating] = useState(false);
  const rotationStartRef = useRef<{ centerX: number; centerY: number; initialRotation: number; initialAngle: number } | null>(null);
  
  // Multi-touch gesture state
  const [isMultiTouch, setIsMultiTouch] = useState(false);
  const multiTouchStartRef = useRef<{
    distance: number;
    angle: number;
    initialWidth: number;
    initialHeight: number;
    initialRotation: number;
    centerX: number;
    centerY: number;
  } | null>(null);
  
  // State to show rotation handle on mobile when item is selected
  const [isSelected, setIsSelected] = useState(false);
  const itemRef = useRef<HTMLDivElement>(null);
  const rndContainerRef = useRef<HTMLElement | null>(null);
  
  // Deselect when clicking outside the item
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      const container = rndContainerRef.current;
      const itemDiv = itemRef.current;
      const rotationHandle = rotationHandleRef.current;
      
      // Check if click is outside both the Rnd container and rotation handle
      if (container && !container.contains(target) && 
          (!rotationHandle || !rotationHandle.contains(target))) {
        setIsSelected(false);
      } else if (itemDiv && !itemDiv.contains(target) && 
                 (!rotationHandle || !rotationHandle.contains(target))) {
        setIsSelected(false);
      }
    };
    
    if (isSelected) {
      // Use setTimeout to avoid immediate deselection when touch starts
      const timeoutId = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside);
      }, 150);
      
      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('touchstart', handleClickOutside);
      };
    }
  }, [isSelected]);

  const handleResize = (
    e: MouseEvent | TouchEvent,
    direction: string,
    ref: HTMLElement,
    delta: { width: number; height: number },
    position: { x: number; y: number }
  ) => {
    // Chỉ resize, không xoay - xoay chỉ thực hiện qua nút xoay
    // Không cần logic xoay ở đây nữa
  };

  // Xử lý bắt đầu xoay từ nút xoay
  const handleRotationStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsRotating(true);

    const clientX = 'touches' in e ? (e.touches[0]?.clientX ?? 0) : e.clientX;
    const clientY = 'touches' in e ? (e.touches[0]?.clientY ?? 0) : e.clientY;

    // Lấy vị trí của Rnd container
    const rndElement = rotationHandleRef.current?.closest('.react-draggable') as HTMLElement;
    if (!rndElement) return;

    const rect = rndElement.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const initialAngle = Math.atan2(dy, dx) * (180 / Math.PI);

    rotationStartRef.current = {
      centerX,
      centerY,
      initialRotation: item.rotation,
      initialAngle
    };
  };

  // Xử lý xoay khi di chuyển
  const handleRotationMove = (e: MouseEvent | TouchEvent) => {
    if (!isRotating || !rotationStartRef.current) return;

    const clientX = 'touches' in e ? (e.touches[0]?.clientX ?? 0) : e.clientX;
    const clientY = 'touches' in e ? (e.touches[0]?.clientY ?? 0) : e.clientY;

    const dx = clientX - rotationStartRef.current.centerX;
    const dy = clientY - rotationStartRef.current.centerY;
    const currentAngle = Math.atan2(dy, dx) * (180 / Math.PI);

    let deltaRotation = currentAngle - rotationStartRef.current.initialAngle;

    // Normalize góc về -180 đến 180
    while (deltaRotation > 180) deltaRotation -= 360;
    while (deltaRotation < -180) deltaRotation += 360;

    const newRotation = rotationStartRef.current.initialRotation + deltaRotation;
    const normalizedRotation = ((newRotation % 360) + 360) % 360;

    const currentRotation = item.rotation;
    let rotationDelta = normalizedRotation - currentRotation;

    if (rotationDelta > 180) rotationDelta -= 360;
    if (rotationDelta < -180) rotationDelta += 360;

    if (Math.abs(rotationDelta) > 0.1) {
      onRotate(item.id, rotationDelta);
    }
  };

  // Xử lý kết thúc xoay
  const handleRotationEnd = () => {
    setIsRotating(false);
    rotationStartRef.current = null;
  };

  // Helper function to calculate distance between two touches
  const getTouchDistance = (touch1: React.Touch, touch2: React.Touch): number => {
    const dx = touch2.clientX - touch1.clientX;
    const dy = touch2.clientY - touch1.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Helper function to calculate angle between two touches
  const getTouchAngle = (touch1: React.Touch, touch2: React.Touch): number => {
    const dx = touch2.clientX - touch1.clientX;
    const dy = touch2.clientY - touch1.clientY;
    return Math.atan2(dy, dx) * (180 / Math.PI);
  };

  // Helper function to calculate center point between two touches
  const getTouchCenter = (touch1: React.Touch, touch2: React.Touch): { x: number; y: number } => {
    return {
      x: (touch1.clientX + touch2.clientX) / 2,
      y: (touch1.clientY + touch2.clientY) / 2
    };
  };

  // Handle multi-touch start (2 fingers)
  const handleMultiTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 2) return;

    setIsMultiTouch(true);
    const touch1 = e.touches[0];
    const touch2 = e.touches[1];

    const distance = getTouchDistance(touch1, touch2);
    const angle = getTouchAngle(touch1, touch2);
    const center = getTouchCenter(touch1, touch2);

    // Get Rnd container
    const rndElement = e.currentTarget.closest('.react-draggable') as HTMLElement;
    if (!rndElement) return;

    const rect = rndElement.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    multiTouchStartRef.current = {
      distance,
      angle,
      initialWidth: item.width,
      initialHeight: item.height,
      initialRotation: item.rotation,
      centerX,
      centerY
    };
  };

  // Handle multi-touch move (2 fingers)
  const handleMultiTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length !== 2 || !multiTouchStartRef.current) return;

    const touch1 = e.touches[0];
    const touch2 = e.touches[1];

    const currentDistance = getTouchDistance(touch1, touch2);
    const currentAngle = getTouchAngle(touch1, touch2);

    const start = multiTouchStartRef.current;

    // Calculate scale factor for resize
    const scale = currentDistance / start.distance;
    const newWidth = Math.max(50, Math.min(800, start.initialWidth * scale));
    const newHeight = Math.max(50, Math.min(800, start.initialHeight * scale));

    // Calculate rotation delta
    let angleDelta = currentAngle - start.angle;
    // Normalize angle delta
    while (angleDelta > 180) angleDelta -= 360;
    while (angleDelta < -180) angleDelta += 360;

    const newRotation = start.initialRotation + angleDelta;
    const normalizedRotation = ((newRotation % 360) + 360) % 360;

    // Update size if changed significantly
    if (Math.abs(newWidth - item.width) > 1 || Math.abs(newHeight - item.height) > 1) {
      if (onResize) {
        onResize(item.id, newWidth, newHeight);
      } else {
        // Fallback: use onResizeStop
        const rndElement = e.currentTarget.closest('.react-draggable') as HTMLElement;
        if (rndElement) {
          const mockEvent = new MouseEvent('mousemove') as any;
          onResizeStop(
            mockEvent,
            'bottomRight',
            rndElement,
            { width: newWidth - item.width, height: newHeight - item.height },
            { x: item.x, y: item.y }
          );
        }
      }
    }

    // Update rotation
    const currentRotation = item.rotation;
    let rotationDelta = normalizedRotation - currentRotation;
    if (rotationDelta > 180) rotationDelta -= 360;
    if (rotationDelta < -180) rotationDelta += 360;

    if (Math.abs(rotationDelta) > 0.1) {
      onRotate(item.id, rotationDelta);
    }
  };

  // Handle multi-touch end
  const handleMultiTouchEnd = () => {
    setIsMultiTouch(false);
    multiTouchStartRef.current = null;
  };

  // Thêm event listeners cho mouse và touch
  useEffect(() => {
    if (isRotating) {
      const handleMouseMove = (e: MouseEvent) => handleRotationMove(e);
      const handleMouseUp = () => handleRotationEnd();
      const handleTouchMove = (e: TouchEvent) => handleRotationMove(e);
      const handleTouchEnd = () => handleRotationEnd();

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleTouchEnd);

      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isRotating, item.rotation]);

  // Tính toán vị trí nút xoay để luôn ở góc dưới bên phải của item (kể cả khi đã xoay)
  const rotationRad = (item.rotation * Math.PI) / 180;
  const halfWidth = item.width / 2;
  const halfHeight = item.height / 2;
  
  // Vector từ tâm đến góc dưới bên phải (trong hệ tọa độ item, chưa xoay)
  const dx = halfWidth;
  const dy = halfHeight;
  
  // Xoay vector này theo góc rotation
  const rotatedDx = dx * Math.cos(rotationRad) - dy * Math.sin(rotationRad);
  const rotatedDy = dx * Math.sin(rotationRad) + dy * Math.cos(rotationRad);
  
  // Vị trí góc dưới bên phải sau khi xoay (trong hệ tọa độ Rnd)
  // Nút xoay nằm ngay tại góc, không cách ra ngoài
  const handleX = halfWidth + rotatedDx;
  const handleY = halfHeight + rotatedDy;

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
      onResize={handleResize}
      onResizeStop={onResizeStop}
      minWidth={1}
      minHeight={1}
      className={`group hover:border-2 hover:border-gray-400 active:border-2 active:border-gray-400 ${isSelected ? 'border-2 border-gray-400' : ''}`}
      ref={(el) => {
        if (el) {
          rndContainerRef.current = el;
        }
      }}
    >
      <div 
        ref={itemRef}
        className="relative w-full h-full"
        style={{
          transform: `rotate(${item.rotation}deg)`,
          transformOrigin: 'center center'
        }}
      >
        <Image
          id={`decor-item-${item.id}`}
          key={`decor-item-${item.id}-${item.imageSrc}`}
          src={`${prefix}/${item.imageSrc}`}
          alt="Decoration item"
          fill
          sizes="100vw"
          style={{ objectFit: 'contain' }}
          quality={100}
          loading="eager"
          draggable={false}
          onDoubleClick={onDoubleClick}
          onTouchStart={(e) => {
            // Check for multi-touch (2 fingers)
            if (e.touches.length === 2) {
              e.preventDefault();
              e.stopPropagation();
              handleMultiTouchStart(e);
              setIsSelected(false); // Hide rotation handle during multi-touch
            } else {
              // Single touch - show rotation handle on mobile
              setIsSelected(true);
              // Allow normal behavior (drag, double tap)
              onTouchStart(e);
            }
          }}
          onTouchMove={(e) => {
            if (e.touches.length === 2 && isMultiTouch) {
              e.preventDefault();
              e.stopPropagation();
              handleMultiTouchMove(e);
            }
          }}
          onTouchEnd={(e) => {
            if (isMultiTouch) {
              e.preventDefault();
              e.stopPropagation();
              handleMultiTouchEnd();
            }
          }}
          data-item-id={item.id}
          data-image-src={item.imageSrc}
        />
      </div>
      
      {/* Nút xoay ở góc dưới bên phải - hiện khi hover (desktop) hoặc selected (mobile) */}
      <div
        ref={rotationHandleRef}
        className={`absolute w-6 h-6 rounded-full bg-white border-2 border-blue-500 cursor-grab active:cursor-grabbing shadow-lg hover:bg-blue-50 transition-all z-10 flex items-center justify-center ${
          isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}
        onMouseDown={handleRotationStart}
        onTouchStart={handleRotationStart}
        style={{
          left: `${handleX}px`,
          top: `${handleY}px`,
          transform: 'translate(0, 0)',
          pointerEvents: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-blue-500"
        >
          <path d="M12 2v4M12 18v4M2 12h4M18 12h4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        </svg>
      </div>
    </Rnd>
  );
}