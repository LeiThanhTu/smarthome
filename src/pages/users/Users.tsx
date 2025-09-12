import { useEffect, useState } from "react";
import PageHeader from "../../components/PageHeader";
import Modal from "../../components/Modal";
import { UsersAPI } from "../../api/users.api";
import type { User, UserCreate } from "../../types";
import { useForm } from "react-hook-form";

export default function Users() {
  const [items, setItems] = useState<User[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const { register, handleSubmit, reset } = useForm<UserCreate>({
    defaultValues: { email: "", fullName: "", password: "", role: "ADULT" },
  });

  const load = async () => {
    try {
      let data = await UsersAPI.list();
      if (!Array.isArray(data) || data.length === 0) {
        // Mock data if API returns empty
        // data = [
        //   { id: "1", email: "admin@example.com", name: "Admin", role: "ADMIN" },
        //   { id: "2", email: "parent@example.com", name: "Parent", role: "ADULT" },
        //   { id: "3", email: "child@example.com", name: "Child", role: "CHILD" },
        //   { id: "4", email: "child2@example.com", name: "Child", role: "CHILD" },
        // ];
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
  const openEdit = (u: User) => {
    setEditing(u);
    reset({ email: u.email, fullName: u.fullName, password: "", role: u.role });
    setOpen(true);
  };

  const onSubmit = async (data: UserCreate) => {
    try {
      if (editing) {
        await UsersAPI.update(editing.id, {
          email: data.email,
          fullName: data.fullName,
          role: data.role,
        });
      } else {
        await UsersAPI.create(data);
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
        <PageHeader title="Users" />
        <button
          onClick={openCreate}
          className="px-3 py-1 rounded bg-slate-800 text-white"
        >
          Create User
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {(Array.isArray(items) ? items : []).map((u) => (
          <div key={u.id} className="bg-white p-4 rounded shadow">
            <div className="font-medium">{u.name}</div>
            <div className="text-sm text-slate-500">{u.email}</div>
            <div className="text-sm text-slate-400">{u.role}</div>
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => openEdit(u)}
                className="px-2 py-1 border rounded text-sm"
              >
                Edit
              </button>
              <button
                onClick={async () => {
                  if (confirm("Delete?")) {
                    await UsersAPI.delete(u.id);
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
        title={editing ? "Edit User" : "Create User"}
        onClose={() => setOpen(false)}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div>
            <label className="block text-sm">Email</label>
            <input
              className="w-full p-2 border rounded"
              {...register("email", { required: true })}
            />
          </div>
          <div>
            <label className="block text-sm">Name</label>
            <input
              className="w-full p-2 border rounded"
              {...register("fullName", { required: true })}
            />
          </div>
          <div>
            <label className="block text-sm">
              Password {editing ? "(leave blank to keep)" : ""}
            </label>
            <input
              type="password"
              className="w-full p-2 border rounded"
              {...register("password")}
            />
          </div>
          <div>
            <label className="block text-sm">Role</label>
            <select className="w-full p-2 border rounded" {...register("role")}>
              ...
              <option value="ADMIN">ADMIN</option>
              <option value="ADULT">ADULT</option>
              <option value="CHILD">CHILD</option>
            </select>
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
              {editing ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
