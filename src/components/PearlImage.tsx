import Image from "next/image";

/** Product image, or a soft pearl-toned placeholder when no image is set. */
export function PearlImage({ src, alt, sizes = "(max-width: 1023px) 50vw, 25vw", preload = false }: { src: string | null; alt: string; sizes?: string; preload?: boolean }) {
  if (!src) {
    return (
      <div role="img" aria-label={`${alt} — image coming soon`} className="image-placeholder">
        <span className="font-serif text-xl">Image coming soon</span>
      </div>
    );
  }
  return <Image src={src} alt={alt} fill className="pearl-photo" sizes={sizes} preload={preload} />;
}
