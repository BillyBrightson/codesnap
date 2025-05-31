"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/providers/auth-provider";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getUserQRCodes, deleteQRCode } from "@/lib/firebase/qr-codes";
import { SavedQRCode } from "@/types";
import { Download, Edit, Link, MoreHorizontal, Plus, QrCode, Search, Share2, Archive } from "lucide-react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { createQRCodeNotification } from "@/lib/firebase/notifications";
import { qrCodeService } from "@/lib/qr-service";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { QRCodePreviewModal } from "@/components/qr-code-preview-modal";

export default function QRCodesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [qrCodes, setQrCodes] = useState<SavedQRCode[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedQRCode, setSelectedQRCode] = useState<SavedQRCode | null>(null);
  
  useEffect(() => {
    if (!user?.uid) return;

    const fetchQRCodes = async () => {
      try {
        setLoading(true);
        const qrCodesData = await getUserQRCodes(user.uid);
        setQrCodes(qrCodesData as SavedQRCode[]);
      } catch (error) {
        console.error("Error fetching QR codes:", error);
        toast({
          title: "Error",
          description: "Failed to load QR codes. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchQRCodes();
  }, [user?.uid, toast]);

  const handleDelete = async (id: string) => {
    if (!user?.uid) return;
    
    try {
      // Get the QR code name before deletion
      const qrCode = qrCodes.find(code => code.id === id);
      if (!qrCode) return;

      await deleteQRCode(user.uid, id);
      setQrCodes(prev => prev.filter(code => code.id !== id));
      
      // Create deletion notification
      await createQRCodeNotification(user.uid, qrCode.name, 'deleted');
      
      toast({
        title: "QR code deleted",
        description: "Your QR code has been deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting QR code:", error);
      toast({
        title: "Error deleting QR code",
        description: "Failed to delete QR code. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDownload = (qrCode: SavedQRCode) => {
    if (!qrCode.imageData) return;

    const link = document.createElement("a");
    link.href = qrCode.imageData;
    link.download = `${qrCode.name}-qr-code.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async (qrCode: SavedQRCode) => {
    try {
      await navigator.share({
        title: qrCode.name,
        text: `Check out my QR code: ${qrCode.name}`,
        url: qrCode.content,
      });
    } catch (error) {
      // User cancelled or share failed
      console.error("Error sharing:", error);
    }
  };

  const handleArchive = async (id: string | undefined) => {
    if (!user?.uid || !id) {
      console.error("No user or QR code id provided to handleArchive", { user, id });
      toast({
        title: "Error archiving QR code",
        description: "Invalid QR code selected. Please try again.",
        variant: "destructive",
      });
      return;
    }
    try {
      // Get the QR code name before archiving
      const qrCode = qrCodes.find(code => code.id === id);
      if (!qrCode) return;

      await qrCodeService.moveToArchive(user.uid, id);
      setQrCodes(prev => prev.filter(code => code.id !== id));
      
      // Create archive notification
      await createQRCodeNotification(user.uid, qrCode.name, 'archived');
      
      toast({
        title: "QR code archived",
        description: "Your QR code has been moved to archive.",
      });
    } catch (error) {
      console.error("Error archiving QR code:", error);
      toast({
        title: "Error archiving QR code",
        description: "Failed to archive QR code. Please try again.",
        variant: "destructive",
      });
    }
  };

  const filteredQRCodes = qrCodes.filter(code =>
    code.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          {/* <h1 className="text-2xl font-bold">My QR Codes</h1> */}
          <p className="text-sm text-muted-foreground">
            Manage and organize all your QR codes.
          </p>
        </div>
        <Button onClick={() => router.push("/dashboard/create")}>
          <Plus className="w-4 h-4 mr-2" />
          Create QR Code
        </Button>
      </div>
      
      <div className="flex items-center gap-2">
        <Search className="w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search QR codes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>
      
      {filteredQRCodes.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-background">
          <QrCode className="h-12 w-12 mx-auto text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No QR codes found</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {qrCodes.length === 0
              ? "Create your first QR code to get started!"
              : "No QR codes match your search."}
          </p>
          {qrCodes.length === 0 && (
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard/create")}
              className="mt-4"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create QR Code
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredQRCodes.map((qrCode) => (
            <Card key={qrCode.id} className="group">
              <CardHeader className="p-4 pb-2">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 w-full pr-8">
                    <CardTitle className="line-clamp-1 text-sm">{qrCode.name}</CardTitle>
                    <CardDescription className="text-xs">
                      {format(new Date(qrCode.createdAt), "MMM d, yyyy")}
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 absolute right-2 top-3"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleDownload(qrCode)}>
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleShare(qrCode)}>
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push(`/dashboard/qrcodes/${qrCode.id}`)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleArchive(qrCode.id)}
                        className="text-blue-600"
                      >
                        <Archive className="w-4 h-4 mr-2" />
                        Archive
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div 
                  className="aspect-square relative bg-muted rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => setSelectedQRCode(qrCode)}
                >
                  {qrCode.imageData ? (
                    <img
                      src={qrCode.imageData}
                      alt={qrCode.name}
                      className="w-full h-full object-contain p-2"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full">
                      <QrCode className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 bg-background/80 hover:bg-background"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleArchive(qrCode.id);
                    }}
                    title="Archive QR code"
                  >
                    <Archive className="h-4 w-4 text-blue-600" />
                  </Button>
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <div className="flex items-center gap-2 w-full">
                  <Badge variant="secondary" className="capitalize text-xs">
                    {qrCode.type}
                  </Badge>
                  {qrCode.isDynamic && (
                    <Badge variant="default" className="text-xs">Dynamic</Badge>
                  )}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {selectedQRCode && (
        <QRCodePreviewModal
          isOpen={!!selectedQRCode}
          onClose={() => setSelectedQRCode(null)}
          imageData={selectedQRCode.imageData}
          name={selectedQRCode.name}
          onDownload={() => handleDownload(selectedQRCode)}
        />
      )}
    </div>
  );
} 