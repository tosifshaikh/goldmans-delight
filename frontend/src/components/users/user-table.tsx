"use client";

import { useMemo } from "react";
import { Pencil, Trash2 } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { Role_level, useRoleLevel } from "@/lib/role_levels";
import type { User } from "@/lib/users";

type Props = {
  users: User[] | undefined;
  isLoading: boolean;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
};

export function UserTable({ users, isLoading, onEdit, onDelete }: Props) {
  const { data: role_levels } = useRoleLevel();

  const roleLevel = useMemo(() => {
    const m = new Map<number, Role_level>();
    role_levels?.forEach((r) => m.set(r.id, r));
    return m;
  }, [role_levels]);


  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">ID</TableHead>
            <TableHead>Full name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead className="w-48">Role</TableHead>
            <TableHead className="w-28">Status</TableHead>
            <TableHead className="w-32 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading &&
            Array.from({ length: 4 }).map((_, i) => (
              <TableRow key={i}>
                {Array.from({ length: 6 }).map((__, j) => (
                  <TableCell key={j}>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))}

          {!isLoading &&
            users?.map((u) => {
               const level = roleLevel.get(u.role_level_id);
              const isSuperAdmin = level?.rank === 0;
              return (
                <TableRow key={u.id}>
                  <TableCell className="text-muted-foreground">{u.id}</TableCell>
                  <TableCell className="font-medium">{u.full_name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {u.email}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge variant={isSuperAdmin ? "default" : "secondary"}>
                        {roleLevel.get(u.role_level_id)?.label ?? `#${u.role_level_id}`} 
                      </Badge>
                      {level !== undefined && (
                        <span className="text-xs text-muted-foreground">
                          L{level?.rank}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={u.is_active ? "default" : "outline"}>
                      {u.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(u)}
                      title="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(u)}
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}

          {!isLoading && users?.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={6}
                className="h-24 text-center text-muted-foreground"
              >
                No users yet. Click <strong>New User</strong> to create one.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}