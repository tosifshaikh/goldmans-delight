"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { UserTable } from "@/components/users/user-table";
import { UserFormDialog } from "@/components/users/user-form-dialog";
import { UserDeleteDialog } from "@/components/users/user-delete-dialog";

import { useUsers, type User } from "@/lib/users";

export default function UsersPage() {
  const { data: users, isLoading, error } = useUsers();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [toDelete, setToDelete] = useState<User | null>(null);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(user: User) {
    setEditing(user);
    setFormOpen(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Users</h1>
          <p className="text-sm text-muted-foreground">
            Manage users and assign them roles.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          New User
        </Button>
      </div>

      {error && (
        <p className="text-sm text-red-600">Failed to load users.</p>
      )}

      <UserTable
        users={users}
        isLoading={isLoading}
        onEdit={openEdit}
        onDelete={setToDelete}
      />

      <UserFormDialog
        key={editing?.id ?? "new"}   
        open={formOpen}
        onOpenChange={setFormOpen}
        user={editing}
      />

      <UserDeleteDialog
        user={toDelete}
        onOpenChange={(open) => !open && setToDelete(null)}
      />
    </div>
  );
}