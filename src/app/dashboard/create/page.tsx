"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { QRCodeCanvas, QRCodeSVG } from 'qrcode.react'
import { qrCodeService } from "@/lib/qr-service"
import { useAuth } from "@/providers/auth-provider"
import { SavedQRCode, QRCodeType, QRCodeFormData } from "@/types"
import {
  Link,
  MessageSquare,
  Mail,
  Phone,
  User,
  Wifi,
  Download,
  QrCode,
  Sparkles,
  ImageIcon,
  Copy,
  Share2,
  SaveAll,
  Loader2,
  XIcon
} from "lucide-react"
import { createQRCodeNotification } from "@/lib/firebase/notifications"
import { useToast } from "@/components/ui/use-toast"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

export default function QRCodeGenerator() {
  const [selectedType, setSelectedType] = useState<QRCodeType>("url")
  const [qrName, setQrName] = useState("My QR Code")
  const [url, setUrl] = useState("https://example.com")
  const [text, setText] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [wifiSSID, setWifiSSID] = useState("")
  const [wifiPassword, setWifiPassword] = useState("")
  const [wifiEncryption, setWifiEncryption] = useState("WPA")
  const [vcardName, setVcardName] = useState("")
  const [vcardPhone, setVcardPhone] = useState("")
  const [vcardEmail, setVcardEmail] = useState("")
  const [foregroundColor, setForegroundColor] = useState("#1a1a1a")
  const [backgroundColor, setBackgroundColor] = useState("#ffffff")
  const [qrSize, setQrSize] = useState([400])
  const [hasLogo, setHasLogo] = useState(false)
  const [hasFrame, setHasFrame] = useState(false)
  const [frameStyle, setFrameStyle] = useState('none')
  const [qrCodeValue, setQrCodeValue] = useState("https://example.com")
  const [imageData, setImageData] = useState("")
  const [logoImage, setLogoImage] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [showFixedFooter, setShowFixedFooter] = useState(false)

  const qrCodeRef = useRef<HTMLCanvasElement>(null)
  const qrContainerRef = useRef<HTMLDivElement>(null)
  const { user } = useAuth()
  const { toast } = useToast()

  const qrTypes: { id: QRCodeType; label: string; icon: any; color: string }[] = [
    { id: "url", label: "Website URL", icon: Link, color: "bg-blue-500" },
    { id: "text", label: "Plain Text", icon: MessageSquare, color: "bg-green-500" },
    { id: "email", label: "Email Address", icon: Mail, color: "bg-red-500" },
    { id: "phone", label: "Phone Number", icon: Phone, color: "bg-yellow-500" },
    { id: "vcard", label: "Contact Card", icon: User, color: "bg-purple-500" },
    { id: "wifi", label: "WiFi Network", icon: Wifi, color: "bg-cyan-500" },
  ]

  const presetColors = [
    { name: "Classic", fg: "#000000", bg: "#ffffff" },
    { name: "Midnight", fg: "#ffffff", bg: "#0f0f23" },
    { name: "Ocean", fg: "#1e40af", bg: "#dbeafe" },
    { name: "Forest", fg: "#166534", bg: "#dcfce7" },
    { name: "Sunset", fg: "#dc2626", bg: "#fef2f2" },
    { name: "Royal", fg: "#7c3aed", bg: "#f3e8ff" },
  ]

  const getQRCodeValue = () => {
    switch (selectedType) {
      case "url":
        return url;
      case "text":
        return text;
      case "email":
        return `mailto:${email}`;
      case "phone":
        return `tel:${phone}`;
      case "wifi":
        return `WIFI:S:${wifiSSID};T:${wifiEncryption};P:${wifiPassword};;`;
      case "vcard":
        return `BEGIN:VCARD\nVERSION:3.0\nFN:${vcardName}\nTEL:${vcardPhone}\nEMAIL:${vcardEmail}\nEND:VCARD`;
      default:
        return url;
    }
  };

  useEffect(() => {
    setQrCodeValue(getQRCodeValue())
    if (qrCodeRef.current) {
      const imageUrl = qrCodeRef.current.toDataURL()
      setImageData(imageUrl)
    }
  }, [selectedType, url, text, email, phone, wifiSSID, wifiPassword, wifiEncryption, vcardName, vcardPhone, vcardEmail, qrName, foregroundColor, backgroundColor, qrSize, hasLogo, hasFrame])

  useEffect(() => {
    if (qrContainerRef.current) {
      html2canvas(qrContainerRef.current, {
        backgroundColor: backgroundColor,
        scale: 2
      }).then(canvas => {
        setImageData(canvas.toDataURL());
      })
    }
  }, [logoImage, frameStyle, backgroundColor, qrSize])

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 10; // Show footer after scrolling 10px from the top of the window
      setShowFixedFooter(scrolled);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Helper function to convert any CSS color to hex
  const colorToHex = (color: string): string => {
    // Create a dummy element to get computed color
    const div = document.createElement('div');
    div.style.color = color;
    document.body.appendChild(div);
    const computedColor = getComputedStyle(div).color;
    document.body.removeChild(div);

    // Check if it's already in hex format (e.g., from presetColors or direct input)
    if (computedColor.startsWith('#')) {
      return computedColor;
    }

    // Attempt to convert rgb(r, g, b) or rgba(r, g, b, a) to hex #RRGGBB
    const rgbMatch = computedColor.match(/^rgb\((\\d{1,3}),\s*(\\d{1,3}),\s*(\\d{1,3})(?:,\s*\\d*\\.?\\d*)?\)$/);
    if (rgbMatch) {
      const toHex = (c: number) => c.toString(16).padStart(2, '0');
      return `#${toHex(parseInt(rgbMatch[1], 10))}${toHex(parseInt(rgbMatch[2], 10))}${toHex(parseInt(rgbMatch[3], 10))}`;
    }
    
    // If still not hex or unsupported, return a default color (e.g., black)
    console.warn(`Unsupported color format after computation: ${color} -> ${computedColor}. Defaulting to #000000.`);
    return '#000000';
  };

  const handleSaveQRCode = async () => {
    if (!user) {
      console.error("User not logged in. Cannot save QR code.")
      toast({
        title: "Error",
        description: "You must be logged in to save QR codes.",
        variant: "destructive",
      });
      return
    }
    setIsSaving(true)
    try {
      const formData: QRCodeFormData = {
        name: qrName || "Untitled QR Code",
        type: selectedType,
        isDynamic: false,
        data: {
          fgColor: foregroundColor,
          bgColor: backgroundColor,
          size: qrSize[0],
          hasLogo,
          hasFrame,
          content: getQRCodeValue(),
        }
      }
      
      await qrCodeService.createQRCode(
        formData,
        user.uid,
        imageData,
        getQRCodeValue()
      )
      
      await createQRCodeNotification(user.uid, qrName || "Untitled QR Code", "created")
      
      toast({
        title: "QR Code Saved!",
        description: `${qrName || 'Your QR code'} has been successfully created.`,
      });

    } catch (error) {
      console.error("Error saving QR code:", error)
      toast({
        title: "Error",
        description: "Failed to save QR code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false)
    }
  }

  const handleDownloadQRCode = async (format: 'jpeg' | 'svg' | 'pdf') => {
    if (!qrCodeRef.current || !qrContainerRef.current) {
      console.error("QR code refs are not available.")
      toast({
        title: "Error",
        description: "QR code not ready for download. Please try again.",
        variant: "destructive",
      });
      return;
    }

    const finalForegroundColor = colorToHex(foregroundColor);
    const finalBackgroundColor = colorToHex(backgroundColor);

    try {
      let url = '';
      let filename = (qrName || 'qrcode');
      
      if (format === 'svg') {
        // QRCodeCanvas supports SVG output directly
        url = qrCodeRef.current.toDataURL('image/svg+xml');
        filename += '.svg';
      } else if (format === 'jpeg') {
        const canvas = await html2canvas(qrContainerRef.current, {
          backgroundColor: finalBackgroundColor,
          scale: 2,
          logging: false,
          useCORS: true
        });
        url = canvas.toDataURL('image/jpeg', 1.0);
        filename += '.jpeg';
      } else if (format === 'pdf') {
         const canvas = await html2canvas(qrContainerRef.current, {
          backgroundColor: finalBackgroundColor,
          scale: 2,
          logging: false,
          useCORS: true
        });
        const imgData = canvas.toDataURL('image/png', 1.0);
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'px',
          format: [canvas.width, canvas.height]
        });
        
        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        pdf.save(filename + '.pdf');
        return; // PDF is handled by jsPDF's save method
      }

      if (url) {
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        // For large data URLs, revoking object URL is good practice, but for data URLs it's not necessary.
        // If we were creating a blob URL for JPEG/PNG, we would revoke it here.
        // URL.revokeObjectURL(url);
      }

    } catch (error) {
      console.error('Error generating download:', error);
      toast({
        title: "Error",
        description: "Failed to generate download. Please try again.",
        variant: "destructive",
      });
    }
  }

  const handleShareQRCode = async () => {
    if (!qrContainerRef.current) {
      console.error("QR code container ref is not available.")
      return;
    }

    try {
      const canvas = await html2canvas(qrContainerRef.current, {
        backgroundColor: backgroundColor,
        scale: 2
      });

      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob);
        }, 'image/png');
      });

      if (!blob) {
        console.error("Failed to create blob from canvas.");
        toast({
          title: "Error",
          description: "Failed to generate image for sharing.",
          variant: "destructive",
        });
        return;
      }

      const file = new File([blob], `${qrName || 'qrcode'}.png`, { type: 'image/png' });

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: qrName || 'My QR Code',
          text: `Check out my QR code: ${qrName || 'My QR Code'}`,
          files: [file]
        });
      } else if (navigator.share && !navigator.canShare) {
        await navigator.share({
          title: qrName || 'My QR Code',
          text: `Check out my QR code: ${qrName || 'My QR Code'}`,
          files: [file]
        });
      }
      else {
        toast({
          title: "Sharing not supported",
          description: "Your browser doesn't support sharing files. Try downloading the QR code instead.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error sharing QR code:", error);
      toast({
        title: "Error",
        description: "Failed to share QR code. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const frameStyles = [
    { value: 'none', label: 'None' },
    { value: 'square', label: 'Square' },
    { value: 'rounded', label: 'Rounded' },
  ];

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="mx-auto max-w-7xl">
        <div className="grid lg:grid-cols-12 min-h-[calc(100vh-80px)]">
          {/* Sidebar */}
          <div className="lg:col-span-4 border-r bg-white p-6 h-full overflow-y-auto">
            <div className="space-y-8">
              {/* QR Type Selection */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-gray-600" />
                  <h2 className="text-lg font-semibold text-gray-900">QR Code Type</h2>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {qrTypes.map((type) => {
                    const Icon = type.icon
                    return (
                      <button
                        key={type.id}
                        onClick={() => setSelectedType(type.id)}
                        className={`group relative overflow-hidden rounded-xl border-2 p-4 text-left transition-all ${
                          selectedType === type.id
                            ? "border-black bg-black text-white"
                            : "border-gray-200 bg-white hover:border-gray-300"
                        }`}
                      >
                        <div className="flex flex-col items-start gap-2">
                          <div className={`rounded-lg p-2 ${selectedType === type.id ? "bg-white/20" : type.color}`}>
                            <Icon className={`h-4 w-4 ${selectedType === type.id ? "text-white" : "text-white"}`} />
                          </div>
                          <span className="text-sm font-medium">{type.label}</span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Content Inputs */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Content</h3>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                      Name
                    </Label>
                    <Input
                      id="name"
                      value={qrName}
                      onChange={(e) => setQrName(e.target.value)}
                      className="mt-1"
                      placeholder="Enter QR code name"
                    />
                  </div>
                  {selectedType === "url" && (
                    <div>
                      <Label htmlFor="url" className="text-sm font-medium text-gray-700">
                        Website URL
                      </Label>
                      <Input
                        id="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="mt-1"
                        placeholder="https://example.com"
                      />
                    </div>
                  )}
                  {selectedType === "text" && (
                    <div>
                      <Label htmlFor="text" className="text-sm font-medium text-gray-700">
                        Text Content
                      </Label>
                      <Input
                        id="text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="mt-1"
                        placeholder="Enter text content"
                      />
                    </div>
                  )}
                  {selectedType === "email" && (
                    <div>
                      <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-1"
                        placeholder="example@email.com"
                      />
                    </div>
                  )}
                  {selectedType === "phone" && (
                    <div>
                      <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                        Phone Number
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="mt-1"
                        placeholder="+1234567890"
                      />
                    </div>
                  )}
                  {selectedType === "wifi" && (
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="wifi-ssid" className="text-sm font-medium text-gray-700">
                          Network Name (SSID)
                        </Label>
                        <Input
                          id="wifi-ssid"
                          value={wifiSSID}
                          onChange={(e) => setWifiSSID(e.target.value)}
                          className="mt-1"
                          placeholder="WiFi Network Name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="wifi-password" className="text-sm font-medium text-gray-700">
                          Password
                        </Label>
                        <Input
                          id="wifi-password"
                          type="password"
                          value={wifiPassword}
                          onChange={(e) => setWifiPassword(e.target.value)}
                          className="mt-1"
                          placeholder="WiFi Password"
                        />
                      </div>
                      <div>
                        <Label htmlFor="wifi-encryption" className="text-sm font-medium text-gray-700">
                          Encryption Type
                        </Label>
                        <Select value={wifiEncryption} onValueChange={setWifiEncryption}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="WPA">WPA/WPA2</SelectItem>
                            <SelectItem value="WEP">WEP</SelectItem>
                            <SelectItem value="nopass">No Password</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                  {selectedType === "vcard" && (
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="vcard-name" className="text-sm font-medium text-gray-700">
                          Full Name
                        </Label>
                        <Input
                          id="vcard-name"
                          value={vcardName}
                          onChange={(e) => setVcardName(e.target.value)}
                          className="mt-1"
                          placeholder="John Doe"
                        />
                      </div>
                      <div>
                        <Label htmlFor="vcard-phone" className="text-sm font-medium text-gray-700">
                          Phone Number
                        </Label>
                        <Input
                          id="vcard-phone"
                          type="tel"
                          value={vcardPhone}
                          onChange={(e) => setVcardPhone(e.target.value)}
                          className="mt-1"
                          placeholder="+1234567890"
                        />
                      </div>
                      <div>
                        <Label htmlFor="vcard-email" className="text-sm font-medium text-gray-700">
                          Email Address
                        </Label>
                        <Input
                          id="vcard-email"
                          type="email"
                          value={vcardEmail}
                          onChange={(e) => setVcardEmail(e.target.value)}
                          className="mt-1"
                          placeholder="john@example.com"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Customization Tabs */}
              <Tabs defaultValue="style" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="style">Style</TabsTrigger>
                  <TabsTrigger value="advanced">Advanced</TabsTrigger>
                </TabsList>

                <TabsContent value="style" className="space-y-6 mt-6">
                  {/* Color Presets */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-gray-700">Color Presets</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {presetColors.map((preset) => (
                        <button
                          key={preset.name}
                          onClick={() => {
                            setForegroundColor(preset.fg)
                            setBackgroundColor(preset.bg)
                          }}
                          className={`group relative overflow-hidden rounded-lg border-2 border-gray-200 p-3 hover:border-gray-300 ${
                            foregroundColor === preset.fg && backgroundColor === preset.bg
                              ? " border-black"
                              : ""
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className="flex gap-1">
                              <div
                                className="h-4 w-4 rounded-full border border-gray-200"
                                style={{ backgroundColor: preset.fg }}
                              />
                              <div
                                className="h-4 w-4 rounded-full border border-gray-200"
                                style={{ backgroundColor: preset.bg }}
                              />
                            </div>
                          </div>
                          <span className="mt-1 block text-xs font-medium text-gray-600">{preset.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Colors */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Foreground</Label>
                      <div className="flex items-center gap-2">
                        {/* Color Swatch and Picker */}
                        <div className="relative">
                          <div
                            className="h-10 w-12 rounded-md border border-gray-200 cursor-pointer"
                            style={{ backgroundColor: foregroundColor }}
                          />
                          <Input
                            type="color"
                            value={foregroundColor}
                            onChange={(e) => setForegroundColor(e.target.value)}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                          />
                        </div>
                        {/* Hex Code Input */}
                        <Input
                          value={foregroundColor}
                          onChange={(e) => setForegroundColor(e.target.value)}
                          className="font-mono text-xs flex-1"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Background</Label>
                      <div className="flex items-center gap-2">
                        {/* Color Swatch and Picker */}
                        <div className="relative">
                          <div
                            className="h-10 w-12 rounded-md border border-gray-200 cursor-pointer"
                            style={{ backgroundColor: backgroundColor }}
                          />
                          <Input
                            type="color"
                            value={backgroundColor}
                            onChange={(e) => setBackgroundColor(e.target.value)}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                          />
                        </div>
                        {/* Hex Code Input */}
                        <Input
                          value={backgroundColor}
                          onChange={(e) => setBackgroundColor(e.target.value)}
                          className="font-mono text-xs flex-1"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Size */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium text-gray-700">Size</Label>
                      <span className="text-sm text-gray-500">{qrSize[0]}px</span>
                    </div>
                    <Slider value={qrSize} onValueChange={setQrSize} max={800} min={200} step={50} className="w-full" />
                  </div>
                </TabsContent>

                <TabsContent value="advanced" className="space-y-6 mt-6">
                  {/* Logo */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-gray-700">Add Logo</Label>
                      <p className="text-xs text-gray-500">Include a logo in the center</p>
                    </div>
                    <Switch checked={hasLogo} onCheckedChange={setHasLogo} />
                  </div>

                  {hasLogo && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Logo Upload</Label>
                      <div className="flex h-20 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 relative cursor-pointer">
                        {!logoImage && (
                          <Input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleLogoUpload} />
                        )}
                        
                        {logoImage ? (
                          <div className="relative flex items-center justify-center w-full h-full p-2">
                            <img 
                              src={logoImage} 
                              alt="Uploaded logo" 
                              className="h-16 w-16 object-contain"
                            />
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="absolute top-1 right-1 h-5 w-5 p-0 rounded-full text-gray-500 hover:bg-gray-200"
                              onClick={(e) => {
                                e.stopPropagation();
                                setLogoImage(null);
                              }}
                            >
                              <XIcon className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <div className="text-center">
                            <ImageIcon className="mx-auto h-6 w-6 text-gray-400" />
                            <p className="mt-1 text-xs text-gray-500">Click to upload</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Frame */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-gray-700">Add Frame</Label>
                      <p className="text-xs text-gray-500">Add a decorative frame</p>
                    </div>
                    <Switch checked={hasFrame} onCheckedChange={setHasFrame} />
                  </div>

                  {hasFrame && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Frame Style</Label>
                      <Select value={frameStyle} onValueChange={setFrameStyle}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a frame style"/>
                        </SelectTrigger>
                        <SelectContent>
                          {frameStyles.map((style) => (
                             <SelectItem key={style.value} value={style.value}>{style.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-8 p-6 h-full overflow-y-auto bg-transparent pb-40">
            <div className="flex h-full flex-col">
              {/* Preview Header */}
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Preview</h2>
                  <p className="text-gray-500">Your QR code will appear below</p>
                </div>
                {!showFixedFooter && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleSaveQRCode} disabled={isSaving}>
                      {isSaving ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <SaveAll className="mr-2 h-4 w-4" />
                      )}
                      {isSaving ? "Saving..." : "Save"}
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleDownloadQRCode('jpeg')}>JPEG</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDownloadQRCode('svg')}>SVG</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDownloadQRCode('pdf')}>PDF</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Button variant="outline" size="sm" onClick={handleShareQRCode}>
                      <Share2 className="mr-2 h-4 w-4" />
                      Share
                    </Button>
                  </div>
                )}
              </div>

              {/* Preview Area */}
              <Card className="p-8 shadow-lg">
                <CardContent className="flex flex-col items-center space-y-6 p-0">
                  {/* QR Code Display */}
                  <div
                    ref={qrContainerRef}
                    className={`flex items-center justify-center border-4 border-gray-100 ${frameStyle === 'rounded' ? 'rounded-lg' : frameStyle === 'square' ? '' : 'rounded-2xl'}`}
                    style={{
                      width: qrSize[0],
                      height: qrSize[0],
                      backgroundColor: backgroundColor,
                    }}
                  >
                    {qrCodeValue && (
                      <QRCodeCanvas
                        ref={qrCodeRef}
                        value={qrCodeValue}
                        size={qrSize[0] - (frameStyle === 'none' ? 0 : 40)}
                        fgColor={foregroundColor}
                        bgColor={backgroundColor}
                        level="H"
                      />
                    )}
                    {hasLogo && logoImage && (
                      <img 
                        src={logoImage} 
                        alt="QR code logo" 
                        style={{
                          position: 'absolute',
                          width: qrSize[0] * 0.2,
                          height: qrSize[0] * 0.2,
                          objectFit: 'contain',
                        }}
                      />
                    )}
                  </div>

                  {/* QR Info */}
                  <div className="w-full max-w-sm space-y-2 text-center">
                    <h3 className="font-semibold text-gray-900">{qrName}</h3>
                    <p className="text-sm text-gray-500">
                      {qrTypes.find((t) => t.id === selectedType)?.label} • {qrSize[0]}×{qrSize[0]}px
                    </p>
                    <div className="flex justify-center gap-4 text-xs text-gray-400">
                      <span>JPEG</span>
                      <span>•</span>
                      <span>SVG</span>
                      <span>•</span>
                      <span>PDF</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Footer Bar */}
      {showFixedFooter && (
        <div className="fixed bottom-0 left-0 right-0 bg-white p-4 shadow-lg z-50 flex justify-center">
          <div className="mx-auto max-w-7xl flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={handleSaveQRCode} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <SaveAll className="mr-2 h-4 w-4" />
              )}
              {isSaving ? "Saving..." : "Save"}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleDownloadQRCode('jpeg')}>JPEG</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDownloadQRCode('svg')}>SVG</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDownloadQRCode('pdf')}>PDF</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" size="sm" onClick={handleShareQRCode}>
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
          </div>
        </div>
      )}
    </div>
  )
} 