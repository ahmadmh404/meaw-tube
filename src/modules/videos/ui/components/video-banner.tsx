<<<<<<< HEAD
import { VideoGetOneOutput } from "../../types";

import { AlertTriangleIcon } from "lucide-react";

interface VideoBannerProps {
  status: VideoGetOneOutput["muxStatus"];
}

export function VideBanner({ status }: VideoBannerProps) {
=======
import { AlertTriangleIcon } from "lucide-react"; 

import { VideoGetOneOutput } from "../../types";

interface VideoBannerProps {
  status: VideoGetOneOutput["muxStatus"];
};

export const VideoBanner = ({ status }: VideoBannerProps) => {
>>>>>>> 7a447fe120c4e223cf4d15306c73f8e10a03464f
  if (status === "ready") return null;

  return (
    <div className="bg-yellow-500 py-3 px-4 rounded-b-xl flex items-center gap-2">
      <AlertTriangleIcon className="size-4 text-black shrink-0" />
      <p className="text-xs md:text-sm font-medium text-black line-clamp-1">
<<<<<<< HEAD
        This video is still being processing
      </p>
    </div>
  );
}
=======
        This video is still being processed.
      </p>
    </div>
  );
};
>>>>>>> 7a447fe120c4e223cf4d15306c73f8e10a03464f
