import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface Column<T> {
    header: string;
    accessorKey?: keyof T;
    cell?: (item: T) => React.ReactNode;
    className?: string;
}

interface DataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    onRowClick?: (item: T) => void;
}

export function DataTable<T extends { id: string | number }>({
    data,
    columns,
    onRowClick
}: DataTableProps<T>) {
    return (
        <div className="rounded-3xl border border-slate-100 bg-white overflow-hidden shadow-sm">
            <Table>
                <TableHeader>
                    <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 border-b border-slate-100">
                        {columns.map((column, index) => (
                            <TableHead
                                key={index}
                                className={cn("text-slate-500 font-medium py-4", column.className)}
                            >
                                {column.header}
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((item) => (
                        <TableRow
                            key={item.id}
                            className="hover:bg-slate-50/50 border-b border-slate-50 cursor-pointer"
                            onClick={() => onRowClick && onRowClick(item)}
                        >
                            {columns.map((column, colIndex) => (
                                <TableCell
                                    key={colIndex}
                                    className={cn("py-4 text-slate-900 font-medium", column.className)}
                                >
                                    {column.cell
                                        ? column.cell(item)
                                        : column.accessorKey
                                            ? (item[column.accessorKey] as React.ReactNode)
                                            : null
                                    }
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
