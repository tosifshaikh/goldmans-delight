"use client";

import { Pencil, Trash2, Layers } from "lucide-react";

import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import {
  type Item,
  ITEM_TYPE_LABELS,
  ITEM_TYPE_COLORS,
  isLowStock,
  formatDecimal,
} from "@/lib/items";
import { cn } from "@/lib/utils";

type Props = {
  items: Item[] | undefined;
  isLoading: boolean;
  onEdit: (item: Item) => void;
  onManageUnits: (item: Item) => void;
  onDelete: (item: Item) => void;
};

export function ItemTable({ items, isLoading, onEdit, onManageUnits, onDelete }: Props) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead className="w-32">Type</TableHead>
            <TableHead className="w-32">Category</TableHead>
            <TableHead className="w-28 text-right">Stock</TableHead>
            <TableHead className="w-24 text-right">Reorder</TableHead>
            <TableHead className="w-32 text-right">Cost / unit</TableHead>
            <TableHead className="w-40 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading &&
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                {Array.from({ length: 8 }).map((__, j) => (
                  <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                ))}
              </TableRow>
            ))}

          {!isLoading &&
            items?.map((item) => {
              const low = isLowStock(item);
              return (
                <TableRow key={item.id}>
                  <TableCell className="text-muted-foreground">{item.id}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{item.name}</span>
                      {item.sku && (
                        <span className="text-xs text-muted-foreground">{item.sku}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
                        ITEM_TYPE_COLORS[item.item_type]
                      )}
                    >
                      {ITEM_TYPE_LABELS[item.item_type]}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {item.category ?? "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={cn("font-mono text-sm", low && "text-red-600 font-semibold")}>
                      {formatDecimal(item.current_stock)}{" "}
                      <span className="text-xs text-muted-foreground">{item.base_unit}</span>
                    </span>
                    {low && (
                      <div className="text-[10px] uppercase tracking-wide text-red-600">
                        low
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm text-muted-foreground">
                    {formatDecimal(item.reorder_level)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {formatDecimal(item.base_cost_per_unit, 4)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onManageUnits(item)}
                      title="Manage units"
                    >
                      <Layers className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(item)}
                      title="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(item)}
                      title="Deactivate"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}

          {!isLoading && items?.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                No items yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}