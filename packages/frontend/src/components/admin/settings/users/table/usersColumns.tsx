import { ColumnDef } from "@tanstack/react-table";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

import React from "react";
import { User } from "@webslurm2/shared";

export const usersColumns = ({
  setSelectedUser,
  setUserToDelete,
}: {
  setSelectedUser: React.Dispatch<React.SetStateAction<string | undefined>>;
  setUserToDelete: React.Dispatch<
    React.SetStateAction<{ userId: string; userName: string } | undefined>
  >;
}): ColumnDef<User>[] => {
  const cols: ColumnDef<User>[] = [
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: (cell) => {
        return (
          <motion.div
            className="flex w-full flex-row items-center"
            key={`${cell.row.id}-admin`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{
              duration: 0.8,
              type: "spring",
              bounce: 0.5,
              stiffness: 200,
              damping: 10,
            }}
          >
            <div>Admin</div>
          </motion.div>
        );
      },
    },

    {
      id: "actions",
      cell: ({ row }) => {
        const { id } = row.original;

        return (
          <DropdownMenu>
            <motion.button whileTap={{ scale: 0.8 }}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
            </motion.button>

            <DropdownMenuContent
              align="end"
              className="border-none bg-slate-800/90 text-white backdrop-blur-lg"
            >
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col"
              >
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <button
                  className="w-full"
                  onClick={() =>
                    setUserToDelete({
                      userId: row.original.id,
                      userName: row.original.name ?? "",
                    })
                  }
                >
                  <DropdownMenuItem className="cursor-pointer focus:bg-slate-700 focus:text-white">
                    Delete User
                  </DropdownMenuItem>
                </button>
                <DropdownMenuSeparator />
                <button className="w-full">
                  <DropdownMenuItem
                    onClick={() => {}}
                    className="cursor-pointer focus:bg-slate-700 focus:text-white"
                  >
                    to add
                  </DropdownMenuItem>
                </button>

                <button className="w-full" onClick={() => setSelectedUser(id)}>
                  <DropdownMenuItem
                    className={cn(
                      "cursor-pointer focus:bg-slate-700 focus:text-white"
                    )}
                  >
                    View Organisations
                  </DropdownMenuItem>
                </button>
              </motion.div>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return cols;
};
