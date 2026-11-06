import { FormSection } from "../sections/form-section";

<<<<<<< HEAD
interface VideoViewProps {
  videoId: string;
}

export function VideoView({ videoId }: VideoViewProps) {
  return (
    <div className="px-4 pt-2.5 max-w-7xl">
      <FormSection videoId={videoId} />
    </div>
  );
}
=======
interface PageProps {
  videoId: string;
};

export const VideoView = ({ videoId }: PageProps) => {
  return (
    <div className="px-4 pt-2.5 max-w-screen-lg">
      <FormSection videoId={videoId} />
    </div>
  );
};
>>>>>>> 7a447fe120c4e223cf4d15306c73f8e10a03464f
