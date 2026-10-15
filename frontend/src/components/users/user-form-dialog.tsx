"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  useCreateUser,
  useUpdateUser,
  type User,
  type UserCreate,
} from "@/lib/users";
import { useRoleLevel } from "@/lib/role_levels";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: User | null; // null/undefined = create mode
};

 type FormState = {
   email: string;
   full_name: string;
   role_level_id: number | 0;
   is_active: boolean;
 };
function formFromUser(user?: User | null): FormState {
  if (user) {
    return {
      email: user.email,
      full_name: user.full_name,
      role_level_id: user.role_level_id,
      is_active: user.is_active,
    };
  }
  return {
    email: "",
    full_name: "",
    role_level_id: 0,
    is_active: true,
  };
}
// const emptyForm: FormState = {
//   email: "",
//   full_name: "",
//   role_level_id: 0,
//   is_active: true,
// };

export function UserFormDialog({ open, onOpenChange, user }: Props) {
  const editing = !!user;
  // const { data: roles } = useRoles();
  const { data: role_levels } = useRoleLevel();
  const createMut = useCreateUser();
  const updateMut = useUpdateUser();

  const [form, setForm] = useState<FormState>(() => formFromUser(user));
  const [submitting, setSubmitting] = useState(false);

  // Sorted roles (admin first, then by level ascending)
  const sortedRoleLevels = useMemo(
    () => [...(role_levels ?? [])].sort((a, b) => a.rank - b.rank),
    [role_levels]
  );
const selectedRole = useMemo(
  () => sortedRoleLevels.find((r) => r.id === form.role_level_id),
  [sortedRoleLevels, form.role_level_id]
);
  // Sync form when dialog opens / user changes
  /* useEffect(() => {
    if (!open) return;
    if (user) {
      setForm({
        email: user.email,
        full_name: user.full_name,
        role_level_id: user.role_level_id,
        is_active: user.is_active,
      });
    } else {
      setForm(emptyForm);
    }
  }, [open, user]); */
  function handleOpenChange(next: boolean) {
    if (next) {
      setForm(formFromUser(user));   // reset on open — no effect needed
    }
    onOpenChange(next);
  }
  async function handleSubmit() {
    if (!form.full_name.trim()) return toast.error("Full name is required");
    if (!form.email.trim()) return toast.error("Email is required");
    if (!form.role_level_id) return toast.error("Please select a role");
    /* if (!editing && !form.password) return toast.error("Password is required");
    if (form.password && form.password.length < 8)
      return toast.error("Password must be at least 8 characters"); */

    setSubmitting(true);
    try {
      if (editing && user) {
        const payload: any = {
          email: form.email,
          full_name: form.full_name,
          role_level_id: form.role_level_id,
          is_active: form.is_active,
        };
        //if (form.password) payload.password = form.password;
        await updateMut.mutateAsync({ id: user.id, ...payload });
        toast.success("User updated");
      } else {
       const result = await createMut.mutateAsync(form as UserCreate);
       if (result.generated_password) {
  // show a one-time dialog or a persistent toast the admin can copy
  alert(
    `User created.\n\nEmail: ${result.email}\nTemporary password: ${result.generated_password}\n\nThis will not be shown again.`
  );
} else {
  toast.success("User created");
}

      }
      onOpenChange(false);
    } catch (e: any) {
      toast.error(e?.response?.data?.detail ?? "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit User" : "New User"}</DialogTitle>
          <DialogDescription>
            {editing
              ? "Update user details. Leave password blank to keep it unchanged."
              : "Create a new user and assign them a role."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full name</Label>
            <Input
              id="full_name"
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              placeholder="Jane Doe"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="jane@goldmans.dev"
            />
          </div>

         {/*  <div className="space-y-2">
            <Label htmlFor="password">
              {editing ? "New password (optional)" : "Password"}
            </Label>
            <Input
              id="password"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder={
                editing ? "Leave blank to keep current" : "Min 8 characters"
              }
              autoComplete="new-password"
            />
          </div> */}

          <div className="space-y-2">
            <Label>Role</Label>
            <Select
              value={form.role_level_id ? String(form.role_level_id) : ""}
              onValueChange={(v) => setForm({ ...form, role_level_id: Number(v) })}
            >
              <SelectTrigger className="w-50">
                <SelectValue placeholder="Select a role" >
                 {selectedRole?.label}
                 </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {sortedRoleLevels.map((r) => (
                  <SelectItem key={r.id} value={String(r.id)}>
                    <span className="font-medium">{r.label}</span>
                    <span className="ml-2 text-xs text-muted-foreground">
                      level {r.rank}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between rounded-md border p-3">
            <div className="space-y-0.5">
              <Label htmlFor="is_active" className="cursor-pointer">
                Active
              </Label>
              <p className="text-xs text-muted-foreground">
                Inactive users cannot log in.
              </p>
            </div>
            <Switch
              id="is_active"
              checked={form.is_active}
              onCheckedChange={(v) => setForm({ ...form, is_active: v })}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Saving…" : editing ? "Save" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}