"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link, Download, Pencil, Trash2, MoreHorizontal } from "lucide-react";
import { format } from "date-fns";
import { SavedQRCode } from "@/types";

export default function QRCodesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [qrCodes, setQrCodes] = useState<SavedQRCode[]>([]);

  const handleDownload = (qrCode: SavedQRCode) => {
    const link = document.createElement("a");
    link.href = qrCode.dataUrl;
    link.download = `${qrCode.name}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = (id: string) => {
    setQrCodes((prev) => prev.filter((qr) => qr.id !== id));
  };

  const filteredQRCodes = qrCodes.filter((qr) =>
    qr.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My QR Codes</h1>
          <p className="text-sm text-muted-foreground">
            Manage and organize all your QR codes.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/create">
            <span className="hidden sm:inline-block">Create QR Code</span>
            <span className="sm:hidden">Create</span>
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search QR codes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Dynamic</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredQRCodes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <div className="flex flex-col items-center justify-center text-sm text-muted-foreground">
                    <p>No QR codes found</p>
                    <Button
                      variant="link"
                      asChild
                      className="mt-2"
                    >
                      <Link href="/dashboard/create">Create your first QR code</Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredQRCodes.map((qrCode) => (
                <TableRow key={qrCode.id}>
                  <TableCell className="font-medium">{qrCode.name}</TableCell>
                  <TableCell>{qrCode.type}</TableCell>
                  <TableCell>
                    {format(new Date(qrCode.createdAt), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        qrCode.dynamic
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {qrCode.dynamic ? "Yes" : "No"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 p-0"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleDownload(qrCode)}
                          className="cursor-pointer"
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(qrCode.id)}
                          className="cursor-pointer text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 