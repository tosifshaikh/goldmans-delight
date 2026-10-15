"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

import { ITEM_TYPES, ITEM_TYPE_LABELS, type ItemFilters, type ItemType } from "@/lib/items";

type Props = {
  filters: ItemFilters;
  onChange: (next: ItemFilters) => void;
};

export function ItemFiltersBar({ filters, onChange }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative min-w-[220px] flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search items…"
          className="pl-9"
          value={filters.search ?? ""}
          onChange={(e) => onChange({ ...filters, search: e.target.value || undefined })}
        />
      </div>

      <Select
        value={filters.item_type ?? "all"}
        onValueChange={(v) =>
          onChange({
            ...filters,
            item_type: v === "all" ? undefined : (v as ItemType),
          })
        }
      >
        <SelectTrigger className="w-40">
          {filters.item_type
            ? ITEM_TYPE_LABELS[filters.item_type]
            : "All types"}
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All types</SelectItem>
          {ITEM_TYPES.map((t) => (
            <SelectItem key={t} value={t}>
              {ITEM_TYPE_LABELS[t]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex items-center gap-2 rounded-md border px-3 py-2">
        <Switch
          id="low-stock"
          checked={!!filters.low_stock}
          onCheckedChange={(v) => onChange({ ...filters, low_stock: v || undefined })}
        />
        <Label htmlFor="low-stock" className="cursor-pointer text-sm">
          Low stock only
        </Label>
      </div>

      <div className="flex items-center gap-2 rounded-md border px-3 py-2">
        <Switch
          id="show-inactive"
          checked={filters.is_active === false}
          onCheckedChange={(v) =>
            onChange({ ...filters, is_active: v ? false : undefined })
          }
        />
        <Label htmlFor="show-inactive" className="cursor-pointer text-sm">
          Show inactive
        </Label>
      </div>
    </div>
  );
}