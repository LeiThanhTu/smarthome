import React from 'react'

type Col<T> = { key: string; title: string; render?: (row: T) => React.ReactNode; width?: string }

export default function Table<T>({ columns, data }: { columns: Col<T>[]; data: T[] }) {
  return (
    <div className="overflow-x-auto bg-white rounded shadow">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            {columns.map(c => (
              <th key={c.key} className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider" style={{ width: c.width }}>
                {c.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.map((row: any, idx) => (
            <tr key={idx} className="hover:bg-slate-50">
              {columns.map(c => (
                <td key={c.key} className="px-4 py-3 text-sm text-slate-700 align-top">
                  {c.render ? c.render(row) : row[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
