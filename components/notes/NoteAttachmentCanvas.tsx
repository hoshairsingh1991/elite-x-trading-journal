"use client";

import {
  useEffect,
  useState,
} from "react";

import { NoteAttachment } from "@/types/note";
import { supabase } from "@/lib/supabase";
import { Trash2 } from "lucide-react";

type Props = {
  attachments: NoteAttachment[];

  onDelete: (
    attachment: NoteAttachment
  ) => Promise<void>;
};

type AttachmentImage = {
  id: string;
  url: string;
};

const STORAGE_BUCKET = "note-attachments";

export default function NoteAttachmentCanvas({
  attachments,
  onDelete,
}: Props) {

  const [
    attachmentImages,
    setAttachmentImages,
  ] = useState<AttachmentImage[]>([]);

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  // =================================================
  // LOAD SECURE IMAGE URLS
  // =================================================

  useEffect(() => {

    let cancelled = false;

    async function loadAttachmentUrls() {

      setIsLoading(true);

      const results: AttachmentImage[] = [];

      for (
        const attachment of attachments
      ) {

        const {
          data,
          error,
        } =
          await supabase.storage
            .from(STORAGE_BUCKET)
            .createSignedUrl(
              attachment.storagePath,
              60 * 60
            );

        if (
          error ||
          !data?.signedUrl
        ) {

          console.error(
            "FAILED TO CREATE NOTE ATTACHMENT URL:",
            error
          );

          continue;
        }

        results.push({
          id:
            attachment.id,

          url:
            data.signedUrl,
        });
      }

      if (!cancelled) {

        setAttachmentImages(
          results
        );

        setIsLoading(false);
      }
    }

    loadAttachmentUrls();

    return () => {

      cancelled = true;
    };

  }, [attachments]);

  // =================================================
  // EMPTY STATE
  // =================================================

  if (
    attachments.length === 0
  ) {

    return null;
  }

  // =================================================
  // LOADING STATE
  // =================================================

  if (
    isLoading
  ) {

    return (
      <div className="mt-6 text-sm text-slate-500">
        Loading screenshots...
      </div>
    );
  }

  // =================================================
  // RENDER
  // =================================================

  return (

    <div className="mt-8 space-y-6">

      {attachmentImages.map(
        (image) => {

          const attachment =
            attachments.find(
              (item) =>
                item.id ===
                image.id
            );

          if (!attachment) {

            return null;
          }

          return (

<div
  key={
    attachment.id
  }
  className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#07101a]"
  style={{
    width:
      attachment.width,
    minHeight:
      attachment.height,
  }}
>

    <button
  type="button"
  onClick={() =>
    onDelete(
      attachment
    )
  }
  title="Delete screenshot"
  aria-label="Delete screenshot"
  className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.06] bg-[#020817]/90 text-red-400 opacity-0 backdrop-blur-sm transition-all hover:bg-red-500/10 group-hover:opacity-100"
>
  <Trash2
    size={17}
    strokeWidth={1.8}
  />
</button>

              <img
                src={
                  image.url
                }
                alt={
                  attachment.fileName
                }
                className="block h-auto w-full object-contain"
              />

            </div>

          );
        }
      )}

    </div>
  );
}