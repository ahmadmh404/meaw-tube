import { VideoSection } from "../sections/video-section";
import { CommentsSection } from "../sections/comments-section";
import { SuggestionsSection } from "../sections/suggestions-section";

interface VideoViewProps {
  videoId: string;
}

export function VideoView({ videoId }: VideoViewProps) {
  return (
    <div className="flex flex-col max-w-425 mx-auto pt-2.5 px-4 mb-10">
      <div className="flex flex-col xl:flex-row gap-6">
        <div className="flex-1 min-w-0">
          <VideoSection videoId={videoId} />
          <div className="xl:hidden block mt-4 ">
            <SuggestionsSection />
          </div>
          <CommentsSection />
        </div>
        <div className="hidden xl:block w-full xl:w-77 2xl:w-115 shrink">
          <SuggestionsSection />
        </div>
      </div>
    </div>
  );
}
