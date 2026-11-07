const frame =
  "aspect-[1200/630] w-full max-w-full overflow-hidden rounded-[2px] border border-neutral-200 bg-neutral-50";

/**
 * Card image area: looping video if set (poster only under reduced motion),
 * else the image, else a serif text tile with the tagline.
 */
export function CardMedia({
  project,
  image,
  className = "",
}: {
  project: { tagline: string; cardImage?: string | null; cardVideo?: string | null };
  image: string | null;
  className?: string;
}) {
  const poster = project.cardImage ?? image ?? undefined;
  if (project.cardVideo) {
    return (
      <div className={`${frame} ${className}`}>
        {poster && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={poster}
            alt=""
            className="hidden size-full object-cover motion-reduce:block"
          />
        )}
        <video
          muted
          loop
          autoPlay
          playsInline
          preload="metadata"
          poster={poster}
          className="size-full object-cover motion-reduce:hidden"
        >
          <source src={project.cardVideo} />
        </video>
      </div>
    );
  }
  if (image) {
    return (
      <div className={`${frame} ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt="" loading="lazy" className="size-full object-cover" />
      </div>
    );
  }
  return (
    <div
      className={`${frame} flex items-center justify-center p-[18px] text-center font-serif text-[22px] leading-tight text-neutral-600 ${className}`}
    >
      {project.tagline}
    </div>
  );
}
