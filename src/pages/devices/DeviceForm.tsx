import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { DeviceCreate, Device } from "../../types";
import { RoomsAPI } from "../../api/rooms.api";

type Props = {
  initial?: Partial<Device>;
  onCancel: () => void;
  onSaved: (d: Device) => void;
  createFn: (d: DeviceCreate) => Promise<Device>;
  updateFn?: (id: number, d: Partial<DeviceCreate>) => Promise<Device>;
};

export default function DeviceForm({
  initial,
  onCancel,
  onSaved,
  createFn,
  updateFn,
}: Props) {
  const { register, handleSubmit, reset } = useForm<DeviceCreate>({
    defaultValues: { name: "", type: "LIGHT", roomId: 0 },
  });

  useEffect(() => {
    if (initial)
      reset({
        name: initial.name ?? "",
        type: (initial.type as any) ?? "LIGHT",
        roomId: initial.roomId ?? 0,
      });
  }, [initial]);

  const onSubmit = async (data: DeviceCreate) => {
    try {
      if (initial?.id && updateFn) {
        const d = await updateFn(initial.id, data);
        onSaved(d);
      } else {
        const d = await createFn(data);
        onSaved(d);
      }
    } catch (e: any) {
      alert(e?.response?.data?.message || "Save failed");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <div>
        <label className="block text-sm">Name</label>
        <input
          className="w-full p-2 border rounded"
          {...register("name", { required: true })}
        />
      </div>
      <div>
        <label className="block text-sm">Type</label>
        <select className="w-full p-2 border rounded" {...register("type")}>
          <option value="LIGHT">LIGHT</option>
          <option value="FAN">FAN</option>
          <option value="AC">AC</option>
          <option value="TV">TV</option>
          <option value="OTHER">OTHER</option>
        </select>
      </div>
      <div>
        <label className="block text-sm">Room ID</label>
        <input
          type="number"
          className="w-full p-2 border rounded"
          {...register("roomId", { valueAsNumber: true })}
        />
      </div>

      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1 rounded border"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-3 py-1 rounded bg-slate-800 text-white"
        >
          Save
        </button>
      </div>
    </form>
  );
}
