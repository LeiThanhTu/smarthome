import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import PageHeader from "../../components/PageHeader";
import Modal from "../../components/Modal";
import { Button } from "../../components/Button";
import type { Sensor, SensorType } from "../../types";
// TODO: Replace with real API
const mockSensors: Sensor[] = [
  { id: 1, name: "Temperature Sensor", type: "TEMP", roomId: 1 },
  { id: 2, name: "Humidity Sensor", type: "HUMID", roomId: 2 },
];

export default function Sensors() {
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Sensor | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Partial<Sensor>>({
    defaultValues: { name: "", type: "TEMP", roomId: undefined },
  });

  useEffect(() => {
    // Replace with API call
    setSensors(mockSensors);
  }, []);

  const onSubmit = (data: Partial<Sensor>) => {
    if (editing) {
      setSensors((prev) =>
        prev.map((s) => (s.id === editing.id ? { ...s, ...data } : s))
      );
      toast.success("Sensor updated");
    } else {
      setSensors((prev) => [
        ...prev,
        {
          ...data,
          id: Date.now(),
          roomId: Number(data.roomId) ?? 0,
          type: (data.type as SensorType) ?? "TEMP",
        } as Sensor,
      ]);
      toast.success("Sensor added");
    }
    setOpen(false);
    setEditing(null);
    reset();
  };

  const openEdit = (sensor: Sensor) => {
    setEditing(sensor);
    setOpen(true);
    reset({ ...sensor });
  };

  const openCreate = () => {
    setEditing(null);
    setOpen(true);
    reset({ name: "", type: "TEMP", roomId: undefined });
  };

  const deleteSensor = (id: number) => {
    setSensors((prev) => prev.filter((s) => s.id !== id));
    toast.success("Sensor deleted");
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Sensors" />
      <div className="flex justify-end">
        <Button onClick={openCreate}>Add Sensor</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sensors.map((sensor) => (
          <div
            key={sensor.id}
            className="bg-white rounded-lg shadow p-6 flex flex-col gap-2 border hover:shadow-lg transition"
          >
            <div className="flex items-center justify-between">
              <div className="font-semibold text-lg">{sensor.name}</div>
              <span className="px-2 py-1 rounded text-xs font-bold bg-blue-100 text-blue-700">
                {sensor.type}
              </span>
            </div>
            <div className="text-sm text-gray-500">Room: {sensor.roomId}</div>
            <div className="flex gap-2 mt-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => openEdit(sensor)}
              >
                Edit
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() => deleteSensor(sensor.id)}
              >
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title={editing ? "Edit Sensor" : "Add Sensor"}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              {...register("name", { required: true })}
            />
            {errors.name && (
              <span className="text-xs text-red-500">Name is required</span>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Type
            </label>
            <select
              className="mt-1 block w-full rounded border-gray-300 shadow-sm"
              {...register("type", { required: true })}
            >
              <option value="TEMP">Temperature</option>
              <option value="HUMID">Humidity</option>
              <option value="MOTION">Motion</option>
              <option value="LIGHT">Light</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Room ID
            </label>
            <input
              className="mt-1 block w-full rounded border-gray-300 shadow-sm"
              type="number"
              {...register("roomId", { required: true, valueAsNumber: true })}
            />
            {errors.roomId && (
              <span className="text-xs text-red-500">Room is required</span>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {editing ? "Update" : "Add"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
