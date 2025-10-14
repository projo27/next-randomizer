import Image from "next/image";

export function HeadsIcon({
  width = 100,
  height = 100,
}: {
  width?: number;
  height?: number;
}) {
  return (
    <Image
      src="/images/coin_head.png"
      alt="Heads"
      width={width}
      height={height}
      className="rounded-full"
    />
  );
}
