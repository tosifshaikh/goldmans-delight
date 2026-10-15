"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger,
} from "@/components/ui/select";

import {
  useCreateItem, useUpdateItem,
  ITEM_TYPES, ITEM_TYPE_LABELS, COMMON_UNITS,
  type Item, type ItemCreate, type ItemUnitCreate, type ItemType,
} from "@/lib/items";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: Item | null;
};

type FormState = {
  name: string;
  sku: string;
  category: string;
  item_type: ItemType;
  base_unit: string;
  base_cost_per_unit: string;
  current_stock: string;
  reorder_level: string;
  notes: string;
  units: Array<{ unit_name: string; factor_to_base: string; is_purchase: boolean }>;
};

function emptyForm(): FormState {
  return {
    name: "",
    sku: "",
    category: "",
    item_type: "ingredient",
    base_unit: "g",
    base_cost_per_unit: "0",
    current_stock: "0",
    reorder_level: "0",
    notes: "",
    units: [],
  };
}

function formFromItem(item: Item): FormState {
  return {
    name: item.name,
    sku: item.sku ?? "",
    category: item.category ?? "",
    item_type: item.item_type,
    base_unit: item.base_unit,
    base_cost_per_unit: item.base_cost_per_unit,
    current_stock: item.current_stock,
    reorder_level: item.reorder_level,
    notes: item.notes ?? "",
    units: [], // existing units are edited via the units manager dialog
  };
}

export function ItemFormDialog({ open, onOpenChange, item }: Props) {
  const editing = !!item;
  const createMut = useCreateItem();
  const updateMut = useUpdateItem();

  const [form, setForm] = useState<FormState>(() => (item ? formFromItem(item) : emptyForm()));
  const [submitting, setSubmitting] = useState(false);

  function handleOpenChange(next: boolean) {
    if (next) setForm(item ? formFromItem(item) : emptyForm());
    onOpenChange(next);
  }

  function addUnitRow() {
    setForm((f) => ({
      ...f,
      units: [...f.units, { unit_name: "", factor_to_base: "", is_purchase: false }],
    }));
  }

  function updateUnitRow(i: number, patch: Partial<FormState["units"][number]>) {
    setForm((f) => ({
      ...f,
      units: f.units.map((u, idx) => (idx === i ? { ...u, ...patch } : u)),
    }));
  }

  function removeUnitRow(i: number) {
    setForm((f) => ({ ...f, units: f.units.filter((_, idx) => idx !== i) }));
  }

  async function submit() {
    if (!form.name.trim()) return toast.error("Name is required");
    if (!form.base_unit.trim()) return toast.error("Base unit is required");

    // Validate unit rows
    for (const u of form.units) {
      if (!u.unit_name.trim()) return toast.error("Every unit needs a name");
      const f = Number(u.factor_to_base);
      if (!f || f <= 0) return toast.error(`Factor for "${u.unit_name}" must be > 0`);
      if (u.unit_name === form.base_unit) {
        return toast.error(`"${u.unit_name}" is the base unit — remove it from the list`);
      }
    }

    setSubmitting(true);
    try {
      if (editing && item) {
        await updateMut.mutateAsync({
          id: item.id,
          name: form.name,
          sku: form.sku || null,
          category: form.category || null,
          item_type: form.item_type,
          base_cost_per_unit: Number(form.base_cost_per_unit),
          reorder_level: Number(form.reorder_level),
          notes: form.notes || null,
        });
        toast.success("Item updated");
      } else {
        const payload: ItemCreate = {
          name: form.name,
          sku: form.sku || null,
          category: form.category || null,
          item_type: form.item_type,
          base_unit: form.base_unit,
          base_cost_per_unit: Number(form.base_cost_per_unit),
          current_stock: Number(form.current_stock),
          reorder_level: Number(form.reorder_level),
          notes: form.notes || null,
          units: form.units.map<ItemUnitCreate>((u) => ({
            unit_name: u.unit_name,
            factor_to_base: Number(u.factor_to_base),
            is_purchase: u.is_purchase,
            is_consumption: true,
          })),
        };
        await createMut.mutateAsync(payload);
        toast.success("Item created");
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
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit Item" : "New Item"}</DialogTitle>
          <DialogDescription>
            {editing
              ? "Update item details. Stock and base unit are immutable here."
              : "Create a new item with its base unit and optional conversion units."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-2">
          <div className="col-span-2 space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Sugar"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sku">SKU</Label>
            <Input
              id="sku"
              value={form.sku}
              onChange={(e) => setForm({ ...form, sku: e.target.value })}
              placeholder="ING-0001"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              placeholder="Baking"
            />
          </div>

          <div className="space-y-2">
            <Label>Type *</Label>
            <Select
              value={form.item_type}
              onValueChange={(v) => setForm({ ...form, item_type: v as ItemType })}
            >
              <SelectTrigger>{ITEM_TYPE_LABELS[form.item_type]}</SelectTrigger>
              <SelectContent>
                {ITEM_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>{ITEM_TYPE_LABELS[t]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="base_unit">Base unit *</Label>
            <Input
              id="base_unit"
              value={form.base_unit}
              onChange={(e) => setForm({ ...form, base_unit: e.target.value })}
              placeholder="g"
              disabled={editing}
            />
            {editing && (
              <p className="text-xs text-muted-foreground">
                Base unit cannot be changed after creation.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="base_cost_per_unit">Cost per base unit</Label>
            <Input
              id="base_cost_per_unit"
              type="number"
              step="0.0001"
              min="0"
              value={form.base_cost_per_unit}
              onChange={(e) => setForm({ ...form, base_cost_per_unit: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reorder_level">Reorder level</Label>
            <Input
              id="reorder_level"
              type="number"
              step="0.0001"
              min="0"
              value={form.reorder_level}
              onChange={(e) => setForm({ ...form, reorder_level: e.target.value })}
            />
          </div>

          {!editing && (
            <div className="col-span-2 space-y-2">
              <Label htmlFor="current_stock">Initial stock</Label>
              <Input
                id="current_stock"
                type="number"
                step="0.0001"
                min="0"
                value={form.current_stock}
                onChange={(e) => setForm({ ...form, current_stock: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Set opening stock. Subsequent changes go through stock entries.
              </p>
            </div>
          )}

          <div className="col-span-2 space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Optional"
              rows={2}
            />
          </div>

          {!editing && (
            <div className="col-span-2 space-y-3 border-t pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Conversion units</Label>
                  <p className="text-xs text-muted-foreground">
                    e.g. 1 packet = 1000 g, 1 pallet = 50000 g. The base unit
                    {" "}({form.base_unit || "?"}) is added automatically with factor 1.
                  </p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addUnitRow}>
                  <Plus className="mr-2 h-4 w-4" /> Add unit
                </Button>
              </div>

              {form.units.length === 0 && (
                <p className="text-sm text-muted-foreground">No extra units yet.</p>
              )}

              {form.units.map((u, i) => (
                <div key={i} className="grid grid-cols-[1fr_1fr_auto_auto] items-end gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Unit name</Label>
                    <Input
                      list="common-units"
                      value={u.unit_name}
                      onChange={(e) => updateUnitRow(i, { unit_name: e.target.value })}
                      placeholder="packet"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Factor to base</Label>
                    <Input
                      type="number"
                      step="0.000001"
                      min="0"
                      value={u.factor_to_base}
                      onChange={(e) => updateUnitRow(i, { factor_to_base: e.target.value })}
                      placeholder="1000"
                    />
                  </div>
                  <label className="flex items-center gap-2 pb-2 text-xs">
                    <input
                      type="checkbox"
                      checked={u.is_purchase}
                      onChange={(e) => updateUnitRow(i, { is_purchase: e.target.checked })}
                    />
                    Purchase
                  </label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeUnitRow(i)}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <datalist id="common-units">
          {COMMON_UNITS.map((u) => <option key={u} value={u} />)}
        </datalist>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={submitting}>
            {submitting ? "Saving…" : editing ? "Save" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}