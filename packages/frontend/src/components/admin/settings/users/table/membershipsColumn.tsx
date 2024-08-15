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

export const membershipsColumns = ({}: {
  userId: string;
}): ColumnDef<{
  id: string | null;
  name: string | null;
  role: number;
}>[] => {
  const cols: ColumnDef<{
    id: string | null;
    name: string | null;
    role: number;
  }>[] = [
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "role",
      header: "User Role",
      cell: (cell) => {
        const roleText = "temp";

        return (
          <motion.div
            className="flex w-full flex-row  items-center"
            key={`${cell.row.id}-temp`}
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
            {roleText}
          </motion.div>
        );
      },
    },
    {
      accessorKey: "actions",
      header: "Actions",
      cell: ({ row }) => {
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
                <DropdownMenuLabel>User Actions</DropdownMenuLabel>
                <button className="w-full">
                  <DropdownMenuItem className="cursor-pointer focus:bg-slate-700 focus:text-white">
                    Remove user from organisation
                  </DropdownMenuItem>
                </button>
                {/* {role !== 0 && (
                  <button
                    onClick={() => {
                      changeRole.mutate(
                        {
                          userId,
                          organisationId: row.original.id!,
                          role: 0,
                        },
                        {
                          onSuccess: () => {
                            utils.organisations.getUserRole.invalidate({
                              organisationId: row.original.id!,
                              userId: userId,
                            });
                          },
                        }
                      );
                    }}
                    className="w-full"
                  >
                    <DropdownMenuItem className="cursor-pointer focus:bg-slate-700 focus:text-white">
                      Demote to User
                    </DropdownMenuItem>
                  </button>
                )} */}
                {/* {role !== 1 && (
                  <button
                    onClick={() => {
                      changeRole.mutate(
                        {
                          userId,
                          organisationId: row.original.id!,
                          role: 1,
                        },
                        {
                          onSuccess: () => {
                            utils.organisations.getUserRole.invalidate({
                              organisationId: row.original.id!,
                              userId: userId,
                            });
                          },
                        }
                      );
                    }}
                    className="w-full"
                  >
                    <DropdownMenuItem className="cursor-pointer focus:bg-slate-700 focus:text-white">
                      {role === 0
                        ? "Promote to Moderator"
                        : "Demote to Moderator"}
                    </DropdownMenuItem>
                  </button>
                )}
                {role !== 2 && (
                  <button
                    onClick={() => {
                      changeRole.mutate(
                        {
                          userId,
                          organisationId: row.original.id!,
                          role: 2,
                        },
                        {
                          onSuccess: () => {
                            utils.organisations.getUserRole.invalidate({
                              organisationId: row.original.id!,
                              userId: userId,
                            });
                          },
                        }
                      );
                    }}
                    className="w-full"
                  >
                    <DropdownMenuItem className="cursor-pointer focus:bg-slate-700 focus:text-white">
                      Promote to Admin
                    </DropdownMenuItem>
                  </button>
                )} */}
                <DropdownMenuSeparator />
                <button className="w-full">
                  <DropdownMenuItem className="cursor-pointer focus:bg-slate-700 focus:text-white">
                    View Organisation
                  </DropdownMenuItem>
                </button>

                <button className="w-full">
                  <DropdownMenuItem className="cursor-pointer focus:bg-slate-700 focus:text-white">
                    Delete Organisation
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
