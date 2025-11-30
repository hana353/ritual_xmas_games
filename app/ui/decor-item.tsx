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
      className="bg-blue-500/50 w-16 h-16 m-3 inline-block cursor-pointer"
      onClick={handleOnClick}
    >
      <img
        src={`${prefix}/${imageSrc}`}
        alt="Decoration item"
        width={100} height={100}
        className="overflow-hidden"
      />
    </button>
  );
}