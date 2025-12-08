import { MouseEventHandler } from "react";
import { prefix } from "@/app/lib/prefix";

export default function DecorItem({
  imageSrc,
  handleOnClick,
  isSelected = false
}: {
  imageSrc: string,
  handleOnClick: MouseEventHandler,
  isSelected?: boolean
}) {
  return (
    <button
      className={`christmas-item w-16 h-16 m-1 inline-flex cursor-pointer items-center justify-center overflow-hidden flex-shrink-0 ${
        isSelected ? 'selected' : ''
      }`}
      onClick={handleOnClick}
    >
      <img
        src={`${prefix}/${imageSrc}`}
        alt="Decoration item"
        className="w-12 h-12 object-contain drop-shadow-lg"
      />
    </button>
  );
}