"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
} from "@tanstack/react-table";

import {
  Table as ShadTable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { motion } from "framer-motion";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { ChevronsLeftIcon, ChevronsRightIcon } from "lucide-react";
import { useEffect } from "react";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function Table<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  useEffect(() => {
    table.reset();
  }, [data]);
  return (
    <div className="w-full">
      <div className="w-full rounded-md border">
        <ShadTable className="w-full bg-slate-600">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </ShadTable>
      </div>
      <div className="flex items-center justify-between space-x-2 py-4">
        <div>
          {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </div>
        <div className="flex flex-row gap-3">
          {table.getCanPreviousPage() && (
            <>
              <motion.button
                whileHover={{ rotate: 360, scale: 1.1 }}
                onClick={() => table.firstPage()}
              >
                <ChevronsLeftIcon className="size-6 text-white" />
              </motion.button>

              <motion.button
                whileHover={{ rotate: 360, scale: 1.1 }}
                onClick={() => table.previousPage()}
              >
                <ChevronLeftIcon className="size-6 text-white" />
              </motion.button>
            </>
          )}

          {table.getCanNextPage() && (
            <>
              <motion.button
                whileHover={{ rotate: 360, scale: 1.1 }}
                onClick={() => table.nextPage()}
              >
                <ChevronRightIcon className="size-6 text-white" />
              </motion.button>
              <motion.button
                whileHover={{ rotate: 360, scale: 1.1 }}
                onClick={() => table.lastPage()}
              >
                <ChevronsRightIcon className="size-6 text-white" />
              </motion.button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
