import Image from "next/image";

export function TailsIcon({
  width = 100,
  height = 100,
}: {
  width?: number;
  height?: number;
}) {
  return (
    <Image
      src="/coin_tail.png"
      alt="Tails"
      width={width}
      height={height}
      className="rounded-full"
    />
  );
}
