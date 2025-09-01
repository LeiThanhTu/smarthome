import React from 'react'
import type { Room } from '../models/RoomModel'

export default function RoomCard({ r, devicesCount }: { r: Room; devicesCount?: number }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium text-slate-800">{r.name}</div>
          <div className="text-sm text-slate-500">Floor {r.floor ?? '-' } • {r.type}</div>
        </div>
        <div className="text-right">
          <div className="text-sm text-slate-500">Devices</div>
          <div className="text-xl font-bold">{devicesCount ?? '-'}</div>
        </div>
      </div>
      {r.description && <div className="mt-3 text-sm text-slate-500">{r.description}</div>}
    </div>
  )
}
