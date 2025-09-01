import React from "react";
import Modal from "./Modal";

export default function Confirm({
  open,
  title = "Confirm",
  text,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title?: string;
  text: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal open={open} title={title} onClose={onCancel}>
      <div className="space-y-4">
        <div>{text}</div>
        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="px-3 py-1 border rounded">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-3 py-1 bg-red-600 text-white rounded"
          >
            Delete
          </button>
        </div>
      </div>
    </Modal>
  );
}
