import { useEffect, useState } from "react";
import PageHeader from "../../components/PageHeader";
import Modal from "../../components/Modal";
import { SchedulesAPI } from "../../api/schedules.api";
import type { Schedule, ScheduleCreate } from "../../types";
import { useForm } from "react-hook-form";

export default function Schedules() {
  const [items, setItems] = useState<Schedule[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Schedule | null>(null);
  const { register, handleSubmit, reset } = useForm<ScheduleCreate>({
    defaultValues: {
      deviceId: 0,
      action: "TOGGLE",
      at: "",
      cron: "",
      name: "",
      enabled: true,
    },
  });

  const load = async () => {
    try {
      let data = await SchedulesAPI.list();
      if (!Array.isArray(data) || data.length === 0) {
        // Mock data if API returns empty
        data = [
          {
            id: 1,
            deviceId: 1,
            action: "ON",
            at: "2025-09-01T08:00:00Z",
            enabled: true,
            name: "Morning Lights",
          },
          {
            id: 2,
            deviceId: 2,
            action: "OFF",
            at: "2025-09-01T22:00:00Z",
            enabled: true,
            name: "Night AC",
          },
          {
            id: 3,
            deviceId: 3,
            action: "TOGGLE",
            cron: "0 7 * * *",
            enabled: false,
            name: "Daily Toggle",
          },
        ];
      }
      setItems(data);
    } catch {}
  };
  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    reset();
    setOpen(true);
  };
  const openEdit = (s: Schedule) => {
    setEditing(s);
    reset({
      deviceId: s.deviceId,
      action: s.action,
      at: s.at ?? "",
      cron: s.cron ?? "",
      name: s.name,
      enabled: s.enabled,
    });
    setOpen(true);
  };

  const onSubmit = async (data: ScheduleCreate) => {
    try {
      if (editing) {
        await SchedulesAPI.update(editing.id, data);
      } else {
        await SchedulesAPI.create(data);
      }
      setOpen(false);
      load();
    } catch (e: any) {
      alert(e?.response?.data?.message || "Fail");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <PageHeader title="Schedules" subtitle="Lịch điều khiển tự động" />
        <button
          onClick={openCreate}
          className="px-3 py-1 rounded bg-slate-800 text-white"
        >
          Create
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {(Array.isArray(items) ? items : []).map((s) => (
          <div key={s.id} className="bg-white p-4 rounded shadow">
            <div className="font-medium">{s.name ?? `Schedule #${s.id}`}</div>
            <div className="text-sm text-slate-500">
              Device {s.deviceId} • {s.action}
            </div>
            <div className="text-xs text-slate-400 mt-2">{s.cron ?? s.at}</div>
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => openEdit(s)}
                className="px-2 py-1 border rounded text-sm"
              >
                Edit
              </button>
              <button
                onClick={async () => {
                  if (confirm("Delete?")) {
                    await SchedulesAPI.remove(s.id);
                    load();
                  }
                }}
                className="px-2 py-1 border rounded text-sm text-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={open}
        title={editing ? "Edit Schedule" : "Create Schedule"}
        onClose={() => setOpen(false)}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div>
            <label className="block text-sm">Device ID</label>
            <input
              type="number"
              className="w-full p-2 border rounded"
              {...register("deviceId", { valueAsNumber: true })}
            />
          </div>
          <div>
            <label className="block text-sm">Action</label>
            <select
              className="w-full p-2 border rounded"
              {...register("action")}
            >
              <option value="ON">ON</option>
              <option value="OFF">OFF</option>
              <option value="TOGGLE">TOGGLE</option>
            </select>
          </div>
          <div>
            <label className="block text-sm">At (ISO time, optional)</label>
            <input
              className="w-full p-2 border rounded"
              {...register("at")}
              placeholder="YYYY-MM-DDTHH:MM:SSZ or local"
            />
          </div>
          <div>
            <label className="block text-sm">Cron (optional)</label>
            <input
              className="w-full p-2 border rounded"
              {...register("cron")}
              placeholder="e.g. 0 8 * * *"
            />
          </div>
          <div>
            <label className="block text-sm">Name</label>
            <input
              className="w-full p-2 border rounded"
              {...register("name")}
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-3 py-1 border rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1 bg-slate-800 text-white rounded"
            >
              Save
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
