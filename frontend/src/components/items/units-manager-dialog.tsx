"use client";

import { useState } from "react";
import { Plus, Trash2, Pencil, Check, X } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

import {
  useAddUnit, useUpdateUnit, useDeleteUnit, useItem,
  COMMON_UNITS, formatDecimal, type Item,
} from "@/lib/items";

type Props = {
  item: Item | null;
  onOpenChange: (open: boolean) => void;
};

export function UnitsManagerDialog({ item, onOpenChange }: Props) {
  const open = !!item;
  // Refetch fresh data so units list is accurate after edits
  const { data: fresh } = useItem(item?.id ?? null);
  const current = fresh ?? item;

  const addMut = useAddUnit(item?.id ?? 0);
  const updateMut = useUpdateUnit(item?.id ?? 0);
  const delMut = useDeleteUnit(item?.id ?? 0);

  const [adding, setAdding] = useState(false);
  const [newUnit, setNewUnit] = useState({
    unit_name: "",
    factor_to_base: "",
    is_purchase: false,
  });

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValues, setEditValues] = useState({ unit_name: "", factor_to_base: "" });

  async function handleAdd() {
    if (!newUnit.unit_name.trim()) return toast.error("Unit name required");
    const f = Number(newUnit.factor_to_base);
    if (!f || f <= 0) return toast.error("Factor must be > 0");
    try {
      await addMut.mutateAsync({
        unit_name: newUnit.unit_name,
        factor_to_base: f,
        is_purchase: newUnit.is_purchase,
        is_consumption: true,
      });
      toast.success("Unit added");
      setNewUnit({ unit_name: "", factor_to_base: "", is_purchase: false });
      setAdding(false);
    } catch (e: any) {
      toast.error(e?.response?.data?.detail ?? "Cannot add unit");
    }
  }

  async function handleSaveEdit() {
    if (editingId == null) return;
    try {
      await updateMut.mutateAsync({
        unitId: editingId,
        unit_name: editValues.unit_name,
        factor_to_base: Number(editValues.factor_to_base),
      });
      toast.success("Unit updated");
      setEditingId(null);
    } catch (e: any) {
      toast.error(e?.response?.data?.detail ?? "Cannot update unit");
    }
  }

  async function handleDelete(unitId: number) {
    try {
      await delMut.mutateAsync(unitId);
      toast.success("Unit removed");
    } catch (e: any) {
      toast.error(e?.response?.data?.detail ?? "Cannot delete unit");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Units for "{current?.name}"</DialogTitle>
          <DialogDescription>
            Base unit: <strong>{current?.base_unit}</strong>. Each unit has a
            conversion factor to the base. The base unit is locked at factor 1.
          </DialogDescription>
        </DialogHeader>

        <div className="py-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Unit</TableHead>
                <TableHead className="w-40 text-right">Factor to base</TableHead>
                <TableHead className="w-32">Usage</TableHead>
                <TableHead className="w-28 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {current?.units.map((u) => {
                const isBase = u.unit_name === current.base_unit;
                const editing = editingId === u.id;
                return (
                  <TableRow key={u.id}>
                    <TableCell>
                      {editing ? (
                        <Input
                          value={editValues.unit_name}
                          onChange={(e) => setEditValues({ ...editValues, unit_name: e.target.value })}
                          disabled={isBase}
                        />
                      ) : (
                        <span className="font-medium">{u.unit_name}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {editing ? (
                        <Input
                          type="number"
                          step="0.000001"
                          min="0"
                          value={editValues.factor_to_base}
                          onChange={(e) => setEditValues({ ...editValues, factor_to_base: e.target.value })}
                          disabled={isBase}
                        />
                      ) : (
                        formatDecimal(u.factor_to_base, 6)
                      )}
                    </TableCell>
                    <TableCell className="text-xs">
                      {isBase ? (
                        <span className="text-muted-foreground">base</span>
                      ) : (
                        <>
                          {u.is_purchase && <span className="mr-2 rounded bg-amber-100 px-1.5 py-0.5 text-amber-800">purchase</span>}
                          {u.is_consumption && <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-emerald-800">consume</span>}
                        </>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {editing ? (
                        <>
                          <Button variant="ghost" size="icon" onClick={handleSaveEdit}>
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => setEditingId(null)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={isBase}
                            onClick={() => {
                              setEditingId(u.id);
                              setEditValues({ unit_name: u.unit_name, factor_to_base: u.factor_to_base });
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={isBase}
                            onClick={() => handleDelete(u.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}

              {adding && (
                <TableRow>
                  <TableCell>
                    <Input
                      list="common-units"
                      value={newUnit.unit_name}
                      onChange={(e) => setNewUnit({ ...newUnit, unit_name: e.target.value })}
                      placeholder="packet"
                      autoFocus
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Input
                      type="number"
                      step="0.000001"
                      min="0"
                      value={newUnit.factor_to_base}
                      onChange={(e) => setNewUnit({ ...newUnit, factor_to_base: e.target.value })}
                      placeholder="1000"
                    />
                  </TableCell>
                  <TableCell>
                    <label className="flex items-center gap-2 text-xs">
                      <input
                        type="checkbox"
                        checked={newUnit.is_purchase}
                        onChange={(e) => setNewUnit({ ...newUnit, is_purchase: e.target.checked })}
                      />
                      Purchase
                    </label>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={handleAdd}>
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setAdding(false)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {!adding && (
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => setAdding(true)}
            >
              <Plus className="mr-2 h-4 w-4" /> Add unit
            </Button>
          )}

          <datalist id="common-units">
            {COMMON_UNITS.map((u) => <option key={u} value={u} />)}
          </datalist>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}