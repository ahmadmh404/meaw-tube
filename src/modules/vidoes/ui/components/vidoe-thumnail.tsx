import Image from "next/image";

export function VideoThumbnail() {
  return (
    <div className="relative">
      {/* Thumbnail Wrapper */}
      <div className="relative w-full overflow-hidden rounded-xl aspect-video">
        <Image
          src={"/assets/placeholder.svg"}
          fill
          alt="video_placeholder"
          className="size-full object-cover"
        />
      </div>

      {/* Video Duration Box */}
      {/* TODO: Add Video Duration Box */}
    </div>
  );
}
