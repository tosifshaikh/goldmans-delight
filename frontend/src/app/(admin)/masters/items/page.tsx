"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ItemTable } from "@/components/items/item-table";
import { ItemFiltersBar } from "@/components/items/item-filters";
import { ItemFormDialog } from "@/components/items/item-form-dialog";
import { ItemDeleteDialog } from "@/components/items/item-delete-dialog";
import { UnitsManagerDialog } from "@/components/items/units-manager-dialog";

import { useItems, type Item, type ItemFilters } from "@/lib/items";

export default function ItemsPage() {
  const [filters, setFilters] = useState<ItemFilters>({});
  const { data: items, isLoading, error } = useItems(filters);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Item | null>(null);
  const [managing, setManaging] = useState<Item | null>(null);
  const [toDelete, setToDelete] = useState<Item | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Items</h1>
          <p className="text-sm text-muted-foreground">
            Ingredients, supplies, packaging — everything you track stock for.
          </p>
        </div>
        <Button onClick={() => { setEditing(null); setFormOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" /> New Item
        </Button>
      </div>

      <ItemFiltersBar filters={filters} onChange={setFilters} />

      {error && <p className="text-sm text-red-600">Failed to load items.</p>}

      <ItemTable
        items={items}
        isLoading={isLoading}
        onEdit={(item) => { setEditing(item); setFormOpen(true); }}
        onManageUnits={(item) => setManaging(item)}
        onDelete={setToDelete}
      />

     <ItemFormDialog
  key={editing?.id ?? "new"}
  open={formOpen}
  onOpenChange={setFormOpen}
  item={editing}
/>

<UnitsManagerDialog
  item={managing}
  onOpenChange={(open) => !open && setManaging(null)}
/>

<ItemDeleteDialog
  item={toDelete}
  onOpenChange={(open) => !open && setToDelete(null)}
/>
    </div>
  );
}