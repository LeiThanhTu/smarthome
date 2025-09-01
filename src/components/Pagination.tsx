import React from 'react'

export default function Pagination({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (p: number) => void }) {
  const prev = () => onChange(Math.max(1, page - 1))
  const next = () => onChange(Math.min(totalPages, page + 1))
  return (
    <div className="flex items-center gap-2 mt-3">
      <button onClick={prev} disabled={page <= 1} className="px-3 py-1 border rounded text-sm">Prev</button>
      <div className="text-sm text-slate-600">Page {page} / {totalPages}</div>
      <button onClick={next} disabled={page >= totalPages} className="px-3 py-1 border rounded text-sm">Next</button>
    </div>
  )
}
