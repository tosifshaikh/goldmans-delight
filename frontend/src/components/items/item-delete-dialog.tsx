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
import { useDeleteItem, type Item } from "@/lib/items";

type Props = {
  item: Item | null;
  onOpenChange: (open: boolean) => void;
};

export function ItemDeleteDialog({ item, onOpenChange }: Props) {
  const remove = useDeleteItem();

  async function confirm() {
    if (!item) return;
    try {
      await remove.mutateAsync(item.id);
      toast.success(`"${item.name}" deactivated`);
      onOpenChange(false);
    } catch (e: any) {
      toast.error(e?.response?.data?.detail ?? "Cannot deactivate");
      onOpenChange(false);
    }
  }

  return (
    <AlertDialog open={!!item} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Deactivate "{item?.name}"?</AlertDialogTitle>
          <AlertDialogDescription>
            This hides the item from active lists but preserves its history.
            Recipes and stock entries that reference it stay intact.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={confirm}>Deactivate</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}