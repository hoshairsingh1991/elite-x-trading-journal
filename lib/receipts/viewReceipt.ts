import { supabase } from "@/lib/supabase";

export async function viewReceipt(
  receiptUrl: string | null
) {
  if (!receiptUrl) return;

  const {
    data,
    error,
  } = await supabase.storage
    .from("receipts")
    .createSignedUrl(receiptUrl, 60);

  if (error) {
    console.error(error);
    alert("Unable to open receipt.");
    return;
  }

  window.open(data.signedUrl, "_blank");
}