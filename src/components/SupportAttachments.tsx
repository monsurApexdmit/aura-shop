import type { SupportAttachment } from "@/services/supportApi";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from "@/components/ui/item";

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
        <Card key={attachment.id} className="overflow-hidden">
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
            <Item asChild size="sm" className="flex-nowrap rounded-none p-3 text-xs">
              <a href={attachment.url} target="_blank" rel="noreferrer">
                <ItemContent className="min-w-0 gap-0">
                  <ItemTitle className="block truncate text-xs">{attachment.name}</ItemTitle>
                  <ItemDescription className="text-xs">{formatFileSize(attachment.sizeBytes)}</ItemDescription>
                </ItemContent>
                <ItemActions>
                  <span className="text-primary">Open</span>
                </ItemActions>
              </a>
            </Item>
          )}
        </Card>
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
        <Badge key={`${file.name}-${index}`} variant="outline" className="gap-1 pr-1 font-normal">
          <span className="max-w-40 truncate">{file.name}</span>
          <Button type="button" variant="ghost" size="icon" className="size-5" aria-label={`Remove ${file.name}`} onClick={() => onRemove(index)}>
            ×
          </Button>
        </Badge>
      ))}
    </div>
  );
}
