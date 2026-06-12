import { Button } from "@/components/ui/button";
import MuxUploader, {
  MuxUploaderDrop,
  MuxUploaderStatus,
  MuxUploaderFileSelect,
  MuxUploaderProgress,
} from "@mux/mux-uploader-react";
import { UploadIcon } from "lucide-react";

interface SutdioUploaderProps {
  endpoint?: string | null;
  onSuccess: () => void;
}

const uploadId = "mux-uploader";

export function StudioUploader({ endpoint, onSuccess }: SutdioUploaderProps) {
  return (
    <div>
      <MuxUploader
        endpoint={endpoint}
        id={uploadId}
        className="hidden group-uploader"
      />

      <MuxUploaderDrop muxUploader={uploadId} className="group/drop">
        <div slot="heading" className="flex flex-col items-center gap-6">
          <div className="flex items-center justify-center gap-2 rounded-full bg-muted h-32 w-32">
            <UploadIcon className="size-10 text-muted-foreground group/drop-[&[active]]:animate-bounce transition-all duration-200" />
          </div>
          <div className="flex flex-col gap-2 text-center">
            <p className="text-sm">Drag & Drop Video Files TO Upload</p>
            <p className="text-xs text-muted-foreground">
              Your Videos Will Be Private Unitl You Publish Them
            </p>
          </div>
          <MuxUploaderFileSelect muxUploader={uploadId}>
            <Button type="button" className="rounded-full">
              Select Files
            </Button>
          </MuxUploaderFileSelect>
        </div>

        <span className="hidden" slot="separator"></span>
        <MuxUploaderStatus muxUploader={uploadId} className="text-sm" />
        <MuxUploaderProgress
          muxUploader={uploadId}
          className="text-sm"
          type="percentage"
        />

        <MuxUploaderProgress muxUploader={uploadId} type="bar" />
      </MuxUploaderDrop>
    </div>
  );
}
