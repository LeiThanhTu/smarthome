import React, { useEffect } from "react";

export default function Toast({
  open,
  message,
  onClose,
}: {
  open: boolean;
  message?: string;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [open]);

  if (!open) return null;
  return (
    <div className="fixed right-6 bottom-6 z-50">
      <div className="bg-slate-800 text-white px-4 py-2 rounded shadow">
        {message}
      </div>
    </div>
  );
}
