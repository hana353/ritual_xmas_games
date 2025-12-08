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
      className={`christmas-item w-full h-full md:w-16 md:h-16 md:m-1 inline-flex cursor-pointer items-center justify-center overflow-hidden flex-shrink-0 aspect-square ${
        isSelected ? 'selected' : ''
      }`}
      onClick={handleOnClick}
    >
      <img
        src={`${prefix}/${imageSrc}`}
        alt="Decoration item"
        className="w-full h-full md:w-12 md:h-12 object-contain drop-shadow-lg p-1"
      />
    </button>
  );
}