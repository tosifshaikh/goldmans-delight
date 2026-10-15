"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  type Role,
  type RoleCreate,
  useCreateRole,
  useDeleteRole,
  useRoles,
  useUpdateRole,
} from "@/lib/roles";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function RolePage() {
  const { data: roles, isLoading, error } = useRoles();
  const create = useCreateRole();
  const update = useUpdateRole();
  const remove = useDeleteRole();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Role | null>(null);
  const [toDelete, setToDelete] = useState<Role | null>(null);
  const [form, setForm] = useState<RoleCreate>({
    name: "",
    description: "",
    level: 100,
  });

  function openCreate() {
    setEditing(null);
    setForm({ name: "", description: "", level: 100 });
    setOpen(true);
  }

  function openEdit(role: Role) {
    setEditing(role);
    setForm({
      name: role.name,
      description: role.description,
      level: role.level,
    });
    setOpen(true);
  }

  async function submit() {
    try {
      if (editing) {
        await update.mutateAsync({ id: editing.id, ...form });
        toast.success("Role Upated");
      } else {
        await create.mutateAsync(form);
        toast.success("Role Created");
      }
      setOpen(false);
    } catch (e: any) {
      toast.error(e?.response?.data?.detail ?? "Something went wrong");
    }
  }

  async function confirmDelete() {
    if (!toDelete) return;
    try {
      await remove.mutateAsync(toDelete.id);
      toast.success("Role Deleted");
      setToDelete(null);
    } catch (e: any) {
      toast.error(e?.response?.data?.detail ?? "Cannot delete");
      setToDelete(null);
    }
  }
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Roles</h1>
          <p className="text-sm text-muted-foreground">
            Manage roles and their hierarchy levels.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" /> New Role
        </Button>
      </div>

      {error && <p className="text-red-600">Failed to load roles.</p>}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-24">Level</TableHead>
              <TableHead className="w-32 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading &&
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 5 }).map((__, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}

            {roles?.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{r.id}</TableCell>
                <TableCell className="font-medium">{r.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {r.description ?? "—"}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{r.level}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEdit(r)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setToDelete(r)}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}

            {!isLoading && roles?.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-muted-foreground"
                >
                  No roles yet. Create one.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Role" : "New Role"}</DialogTitle>
            <DialogDescription>
              Level 0 = highest privilege (admin). Higher numbers = less
              privilege.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="admin"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={form.description ?? ""}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="Full access"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="level">Level (0–100)</Label>
              <Input
                id="level"
                type="number"
                min={0}
                max={100}
                value={form.level}
                onChange={(e) =>
                  setForm({ ...form, level: Number(e.target.value) })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={submit}
              disabled={create.isPending || update.isPending}
            >
              {editing ? "Save" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!toDelete}
        onOpenChange={(v) => !v && setToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete role &quot;{toDelete?.name}&quot;?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Roles that have users assigned
              cannot be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
