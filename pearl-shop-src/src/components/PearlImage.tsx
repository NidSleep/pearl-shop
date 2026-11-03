import Image from "next/image";

/** Product image, or a soft pearl-toned placeholder when no image is set. */
export function PearlImage({ src, alt }: { src: string | null; alt: string }) {
  if (!src) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-stone-100 via-white to-rose-50">
        <div className="h-16 w-16 rounded-full bg-gradient-to-br from-white via-stone-100 to-stone-300 shadow-inner" />
      </div>
    );
  }
  return <Image src={src} alt={alt} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />;
}
