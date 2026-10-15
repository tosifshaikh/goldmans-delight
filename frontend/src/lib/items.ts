import  {useQuery,useMutation, useQueryClient} from '@tanstack/react-query'
import {api} from "@/lib/api";
export const ITEM_TYPES = [
  "ingredient",
  "supply",
  "packaging",
  "consumable",
  "other",
] as const;

export type ItemType = (typeof ITEM_TYPES)[number];

export type ItemUnit = {
    id:number;
    item_id:number;
    unit_name:string;
    factor_to_base:string;
    is_purchase:boolean;
    is_consumption:boolean;
    created_at:string;
    updated_at:string;
};

export type Item = {
    id:number;
    name:string;
    sku:string | null;
    category:string | null;
    item_type:ItemType;
    base_unit:string;
    base_cost_per_unit:string;
    current_stock:string;
    reorder_level:string;
    is_active:  boolean;
    notes:string | null;
    created_at:string;
    updated_at:string;
    units:ItemUnit[];
};

export type ItemUnitCreate = {
    unit_name:string;
    factor_to_base:number;
    is_purchase?:boolean;
    is_consumption?:boolean;
};

export type ItemUnitUpdate = Partial<ItemUnitCreate>;

export type ItemCreate = {
    name:string;
    sku?:string | null;
    category?:string | null;
    item_type:ItemType;
    base_unit:string;
    base_cost_per_unit:number;
    current_stock?:number;
    reorder_level?:number;
    notes?:string | null;
    units?:ItemUnitCreate[];
};

export type ItemUpdate =  Partial<Omit<ItemCreate, "current_stock" | "base_unit" | "units" >> & {
    is_active?:boolean;
};

export type ItemFilters = {
    search?:string;
    item_type?:ItemType;
    category?:string;
    is_active?:boolean;
    low_stock?:boolean;
};

const ITEMS_KEY = ["items"];

export function useItems(filters:ItemFilters = {}) {
    return useQuery({
        queryKey: [...ITEMS_KEY, filters],
        queryFn:async() => {
            const params  = new URLSearchParams()
            if (filters.search) params.set("search",filters.search);
            if (filters.item_type) params.set("item_type",filters.item_type);
            if (filters.category) params.set("category",filters.category);
            if (filters.is_active !== undefined) params.set("is_active",String(filters.is_active));
            if (filters.low_stock) params.set("low_stock","true");
            const qs=params.toString();
            const {data}= await api.get<Item[]>(`/items${qs ? `?${qs}` : ""}`)
            return data;

        }
    })
}

export function useItem(id:number | null) {
    return useQuery({
        queryKey: ["items", id],
        enabled:id != null,
        queryFn:async() => (await api.get<Item>(`/items${id}`)).data
    })
    
}

export function useCreateItem() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn:async(payload:ItemCreate) =>
            (await api.post<Item>("/items",payload)).data,
        onSuccess:() => qc.invalidateQueries({queryKey:ITEMS_KEY})
    })
    
}

export function useUpdateItem() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn:async({id,...payload}:ItemUpdate & {id:number}) =>
            (await api.patch<Item>(`/items/${id}`,payload)).data,
        onSuccess:() => qc.invalidateQueries({queryKey:ITEMS_KEY})

    })
}

export function useDeleteItem() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn:async(id:number) => (await api.delete<Item>(`/items/${id}`)).data,
        onSuccess:() => qc.invalidateQueries({queryKey:ITEMS_KEY}),
    })
}

export function useAddUnit(itemId:number) {
    const qc = useQueryClient()
    return useMutation({
        mutationFn:async(payload:ItemUnitCreate) =>
            (await api.post<ItemUnit>(`/items/${itemId}/units`,payload)).data,
        onSuccess:() => {
            qc.invalidateQueries({queryKey:ITEMS_KEY});
            qc.invalidateQueries({queryKey:["items",itemId]})
        }
    })
}

export function useUpdateUnit(itemId:number) {
    const qc = useQueryClient()
    return useMutation({
        mutationFn:async({unitId,...payload}:ItemUnitUpdate & {unitId:number}) =>
            (await api.patch<ItemUnit>(`/items/${itemId}/units/${unitId}`,payload)).data,
        onSuccess:() => {
            qc.invalidateQueries({queryKey:ITEMS_KEY});
            qc.invalidateQueries({queryKey:["items",itemId]});
        }
    })
}

export function useDeleteUnit(itemId:number) {
    const qc = useQueryClient()
    return useMutation({
        mutationFn:async (unitId:number) => {
            await api.delete<Item>(`/items/${itemId}/units/${unitId}`)
        },
        onSuccess:() => {
            qc.invalidateQueries({queryKey:ITEMS_KEY});
            qc.invalidateQueries({queryKey:["items",itemId]});
        }
    })
}
export const ITEM_TYPE_LABELS: Record<ItemType, string> = {
    ingredient:"Ingredient",
    supply: "Supply",
    packaging: "Packaging",
    consumable: "Consumable",
    other: "Other",
}

export const ITEM_TYPE_COLORS: Record<ItemType, string> = {
    ingredient: "bg-emerald-100 text-emerald-800 border-emerald-200",
    supply: "bg-blue-100 text-blue-800 border-blue-200",
    packaging: "bg-amber-100 text-amber-800 border-amber-200",
    consumable: "bg-purple-100 text-purple-800 border-purple-200",
    other: "bg-slate-100 text-slate-800 border-slate-200",
}

export const COMMON_UNITS = [
  "g", "kg", "mg",
  "ml", "L", "cl",
  "pcs", "pack", "box", "packet", "pallet",
  "tsp", "tbsp", "cup",
  "roll", "bottle", "bag", "can",
];

export function isLowStock(item:Item):boolean {
    return Number(item.current_stock) <= Number(item.reorder_level)
}

export function formatDecimal(value:string | number,digits=2):string {
    const n=typeof value === "string" ? Number(value) : Number(value);
    if (Number.isNaN(n)) return "-"
    return n.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
  });
}