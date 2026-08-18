'use client';

interface ConfirmDeleteDialogProps {
  tileCount: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDeleteDialog({ tileCount, onConfirm, onCancel }: ConfirmDeleteDialogProps) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white p-6 shadow-lg border border-gray-300 w-80">
        <p className="text-neutral-800 font-semibold mb-1">Yakin mau menghapus?</p>
        <p className="text-neutral-500 text-sm mb-4">
          {tileCount} ubin di area ini akan dihapus. Aksi ini tidak bisa dibatalkan.
        </p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-semibold uppercase tracking-widest text-neutral-500 hover:bg-neutral-100 transition-colors duration-200"
          >
            Tidak
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-semibold uppercase tracking-widest bg-red-600 text-white hover:bg-red-700 transition-colors duration-200"
          >
            Ya, Hapus
          </button>
        </div>
      </div>
    </div>
  );
}