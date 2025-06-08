"use client";

import { useState, useEffect } from "react";
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
import { qrCodeService } from "@/lib/qr-service";
import { SavedQRCode } from "@/types";
import { Download, MoreVertical, Plus, Search, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { useAuth } from "@/providers/auth-provider";

export default function MyQRCodesPage() {
  const [qrCodes, setQrCodes] = useState<SavedQRCode[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user?.uid) {
      const fetchQRCodes = async () => {
        const codes = await qrCodeService.getAllQRCodes(user.uid);
        setQrCodes(codes);
      };
      fetchQRCodes();
    }
  }, [user?.uid]);

  const filteredQRCodes = qrCodes.filter((code) =>
    code.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (user?.uid) {
      await qrCodeService.deleteQRCode(user.uid, id);
      const updatedCodes = await qrCodeService.getAllQRCodes(user.uid);
      setQrCodes(updatedCodes);
    }
  };

  const handleDownload = (code: SavedQRCode) => {
    // TODO: Implement QR code download
    console.log("Downloading QR code:", code);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <Button onClick={() => router.push("/dashboard/create")}>
          <Plus className="w-4 h-4 mr-2" />
          Create QR Code
        </Button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
        <Input
          placeholder="Search QR codes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {filteredQRCodes.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No QR codes found.</p>
          <p className="text-gray-400 text-sm mt-2">
            Create your first QR code to get started!
          </p>
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Preview</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Dynamic</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQRCodes.map((code) => (
                <TableRow key={code.id}>
                  <TableCell>
                    {code.imageData ? (
                      <img src={code.imageData} alt="QR code preview" className="w-16 h-16 object-contain" />
                    ) : (
                      <span>No preview</span>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{code.name}</TableCell>
                  <TableCell className="capitalize">{code.type}</TableCell>
                  <TableCell>
                    {format(new Date(code.createdAt), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>{code.isDynamic ? "Yes" : "No"}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleDownload(code)}>
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDelete(code.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
} 