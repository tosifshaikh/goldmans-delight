"use client";

import { toast } from "sonner";

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

import { useDeleteUser, type User } from "@/lib/users";

type Props = {
  user: User | null;
  onOpenChange: (open: boolean) => void;
};

export function UserDeleteDialog({ user, onOpenChange }: Props) {
  const remove = useDeleteUser();

  async function confirm() {
    if (!user) return;
    try {
      await remove.mutateAsync(user.id);
      toast.success("User deleted");
      onOpenChange(false);
    } catch (e: any) {
      toast.error(e?.response?.data?.detail ?? "Cannot delete user");
      onOpenChange(false);
    }
  }

  return (
    <AlertDialog open={!!user} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Delete user &apos; {user?.full_name}&apos;?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={confirm}>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}