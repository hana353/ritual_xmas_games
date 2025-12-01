import { MouseEventHandler } from "react";
import { prefix } from "@/app/lib/prefix";

export default function DecorItem({
  imageSrc,
  handleOnClick
}: {
  imageSrc: string,
  handleOnClick: MouseEventHandler
}) {
  return (
    <button
      className="bg-blue-500/50 w-16 h-16 m-3 inline-block cursor-pointer flex items-center justify-center overflow-hidden"
      onClick={handleOnClick}
    >
      <img
        src={`${prefix}/${imageSrc}`}
        alt="Decoration item"
        className="w-full h-full object-contain"
      />
    </button>
  );
}