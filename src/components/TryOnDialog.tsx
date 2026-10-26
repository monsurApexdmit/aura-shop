import { useRef, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Upload, Sparkles, RotateCcw, Loader2, ImageIcon } from 'lucide-react'
import { tryOnApi } from '@/services/tryOnApi'
import { useToast } from '@/components/ui/use-toast'

interface Props {
  open: boolean
  onOpenChange: (o: boolean) => void
  garmentUrl: string
  garmentName: string
  category?: string
}

/**
 * Virtual try-on: user uploads a photo, we composite the garment onto it and
 * show the result. Client-only — the photo/result are never persisted.
 */
export function TryOnDialog({ open, onOpenChange, garmentUrl, garmentName, category }: Props) {
  const { toast } = useToast()
  const fileRef = useRef<HTMLInputElement>(null)
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [result, setResult] = useState<string | null>(null)
  const [note, setNote] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const reset = () => {
    setPhoto(null); setPhotoPreview(null); setResult(null); setNote(null); setLoading(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  const onPick = (file?: File) => {
    if (!file) return
    if (!file.type.startsWith('image/')) { toast({ title: 'Please choose an image', variant: 'destructive' }); return }
    if (file.size > 8 * 1024 * 1024) { toast({ title: 'Image too large (max 8MB)', variant: 'destructive' }); return }
    setPhoto(file)
    setPhotoPreview(URL.createObjectURL(file))
    setResult(null)
  }

  const run = async () => {
    if (!photo) return
    setLoading(true)
    try {
      const res = await tryOnApi.generate(photo, garmentUrl, category)
      setResult(res.image)
      setNote(res.note ?? null)
    } catch (err: any) {
      toast({
        title: 'Try-on failed',
        description: err?.response?.data?.message || 'Please try again with a clear, front-facing photo.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) reset(); onOpenChange(o) }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" /> Virtual Try-On
          </DialogTitle>
          <DialogDescription>
            Upload a clear, front-facing full-body photo to preview <b>{garmentName}</b> on you.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Your photo */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Your Photo</p>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-full aspect-[3/4] rounded-xl border-2 border-dashed border-border hover:border-primary/60 flex flex-col items-center justify-center gap-2 overflow-hidden bg-muted/30 transition-colors"
            >
              {photoPreview ? (
                <img src={photoPreview} alt="You" className="w-full h-full object-cover" />
              ) : (
                <>
                  <Upload className="h-7 w-7 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Click to upload</span>
                </>
              )}
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => onPick(e.target.files?.[0])} />
          </div>

          {/* Result */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Preview</p>
            <div className="w-full aspect-[3/4] rounded-xl border border-border flex items-center justify-center overflow-hidden bg-muted/30">
              {loading ? (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-7 w-7 animate-spin" />
                  <span className="text-sm">Generating…</span>
                </div>
              ) : result ? (
                <img src={result} alt="Try-on result" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <ImageIcon className="h-7 w-7" />
                  <span className="text-sm">Your preview appears here</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {note && <p className="text-xs text-amber-600">{note}</p>}

        <div className="flex flex-wrap justify-end gap-2 pt-1">
          {(photo || result) && (
            <Button variant="ghost" onClick={reset} className="gap-2">
              <RotateCcw className="h-4 w-4" /> Reset
            </Button>
          )}
          <Button onClick={run} disabled={!photo || loading} className="gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {result ? 'Try Again' : 'Try It On'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
