import type { SupportAttachment } from "@/services/supportApi";

function formatFileSize(sizeBytes: number): string {
  if (sizeBytes < 1024) return `${sizeBytes} B`;
  if (sizeBytes < 1024 * 1024) return `${(sizeBytes / 1024).toFixed(1)} KB`;
  return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function MessageAttachments({ attachments }: { attachments: SupportAttachment[] }) {
  if (attachments.length === 0) return null;

  return (
    <div className="mt-2 space-y-2">
      {attachments.map((attachment) => (
        <div key={attachment.id} className="overflow-hidden rounded-xl border border-border/70 bg-background/80">
          {attachment.isImage ? (
            <a href={attachment.url} target="_blank" rel="noreferrer">
              <img src={attachment.url} alt={attachment.name} className="max-h-60 w-full object-cover" />
            </a>
          ) : attachment.isAudio ? (
            <div className="p-3">
              <p className="mb-2 text-xs font-medium text-foreground">{attachment.name}</p>
              <audio controls className="w-full">
                <source src={attachment.url} type={attachment.mimeType} />
              </audio>
            </div>
          ) : (
            <a
              href={attachment.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between gap-3 p-3 text-xs hover:bg-muted/50"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-foreground">{attachment.name}</p>
                <p className="text-muted-foreground">{formatFileSize(attachment.sizeBytes)}</p>
              </div>
              <span className="text-primary">Open</span>
            </a>
          )}
        </div>
      ))}
    </div>
  );
}

export function SelectedAttachments({
  attachments,
  onRemove,
}: {
  attachments: File[];
  onRemove: (index: number) => void;
}) {
  if (attachments.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {attachments.map((file, index) => (
        <div key={`${file.name}-${index}`} className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-foreground">
          <span className="max-w-40 truncate">{file.name}</span>
          <button type="button" onClick={() => onRemove(index)} className="text-muted-foreground hover:text-destructive">
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
