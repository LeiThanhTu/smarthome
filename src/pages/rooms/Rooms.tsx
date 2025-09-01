import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import PageHeader from "../../components/PageHeader";
import Modal from "../../components/Modal";
import type { Room, RoomCreate, RoomType } from "../../models/RoomModel";
import { RoomAPI, ROOM_TYPE_OPTIONS } from "../../api/room.api";

export default function Rooms() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Room | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RoomCreate>({
    defaultValues: { name: "", floor: 1, type: "OTHER", description: "" },
  });

  const loadRooms = async () => {
    try {
      setIsLoading(true);
      const data = await RoomAPI.getAll();
      setRooms(data);
      setError(null);
    } catch (err) {
      console.error("Failed to load rooms:", err);
      setError("Failed to load rooms. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRooms();
  }, []);

  const onSubmit = async (data: RoomCreate) => {
    try {
      if (editing) {
        await RoomAPI.update(editing.id, data);
      } else {
        await RoomAPI.create(data);
      }
      setOpen(false);
      await loadRooms();
    } catch (err) {
      console.error("Failed to save room:", err);
      setError("Failed to save room. Please try again.");
    }
  };

  const handleEdit = (room: Room) => {
    reset({
      name: room.name,
      type: room.type,
      description: room.description,
      floor: room.floor,
    });
    setEditing(room);
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this room?")) {
      try {
        await RoomAPI.delete(id);
        await loadRooms();
      } catch (err) {
        console.error("Failed to delete room:", err);
        setError("Failed to delete room. Please try again.");
      }
    }
  };

  const openCreate = () => {
    setEditing(null);
    reset();
    setOpen(true);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Rooms</h1>
        <button
          onClick={() => {
            reset({
              name: "",
              floor: 1,
              type: "OTHER",
              description: "",
            });
            setEditing(null);
            setOpen(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Add Room
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-500"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : rooms.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m-1-4v-4a1 1 0 011-1h2a1 1 0 011 1v4m-4 0h4"
            />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">No rooms</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating a new room.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <div
              key={room.id}
              className="bg-white rounded-lg shadow overflow-hidden"
            >
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-medium text-gray-900">
                    {room.name}
                  </h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {room.type.replace("_", " ")}
                  </span>
                </div>

                <div className="mt-4 space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <svg
                      className="flex-shrink-0 mr-2 h-4 w-4 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m-1-4v-4a1 1 0 011-1h2a1 1 0 011 1v4m-4 0h4"
                      />
                    </svg>
                    Floor {room.floor}
                  </div>
                  {room.deviceCount !== undefined && (
                    <div className="flex items-center">
                      <svg
                        className="flex-shrink-0 mr-2 h-4 w-4 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6h2m7-6h2m2 6h2M5 9h14M5 15h14m-9-9v4m0 4v4m0-8h.01M12 15h.01"
                        />
                      </svg>
                      {room.deviceCount} device
                      {room.deviceCount !== 1 ? "s" : ""}
                    </div>
                  )}
                  {room.description && (
                    <p className="mt-2 pt-2 border-t border-gray-100">
                      {room.description}
                    </p>
                  )}
                </div>

                <div className="mt-6 flex space-x-3">
                  <button
                    type="button"
                    onClick={() => handleEdit(room)}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(room.id)}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title={editing ? "Edit Room" : "Add New Room"}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              {...register("name", { required: "Name is required" })}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                errors.name ? "border-red-500" : ""
              }`}
              placeholder="e.g. Master Bedroom"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="type"
              className="block text-sm font-medium text-gray-700"
            >
              Type <span className="text-red-500">*</span>
            </label>
            <select
              id="type"
              {...register("type", { required: "Type is required" })}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                errors.type ? "border-red-500" : ""
              }`}
            >
              {ROOM_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.type && (
              <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="floor"
              className="block text-sm font-medium text-gray-700"
            >
              Floor <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="floor"
              min="0"
              {...register("floor", {
                required: "Floor is required",
                min: { value: 0, message: "Floor must be 0 or greater" },
                valueAsNumber: true,
              })}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                errors.floor ? "border-red-500" : ""
              }`}
              placeholder="0"
            />
            {errors.floor && (
              <p className="mt-1 text-sm text-red-600">
                {errors.floor.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700"
            >
              Description
            </label>
            <textarea
              id="description"
              rows={3}
              {...register("description")}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Optional description"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  {editing ? "Updating..." : "Creating..."}
                </>
              ) : editing ? (
                "Update"
              ) : (
                "Create"
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
