import { FormSection } from "../sections/form-section";

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
