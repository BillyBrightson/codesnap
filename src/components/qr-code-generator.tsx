"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import QRCode from "qrcode";
import {
  Link,
  QrCode,
  Mail,
  Phone,
  User,
  Wifi,
  Lock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/providers/auth-provider";
import { saveQRCodeToFirestore } from "@/lib/firebase/qr-codes";
import { useRouter } from "next/navigation";
import { QRCodeType } from "@/types";
import { Switch } from "@/components/ui/switch";
import { SketchPicker } from "react-color";

type QRType = "URL" | "Text" | "Email" | "Phone" | "vCard" | "WiFi";

interface QRData {
  // URL
  url: string;
  // Text
  text: string;
  // Email
  email: string;
  emailSubject: string;
  emailBody: string;
  // Phone
  phoneNumber: string;
  // vCard
  fullName: string;
  organization: string;
  title: string;
  email_vcard: string;
  phone_vcard: string;
  website: string;
  address: string;
  // WiFi
  networkName: string;
  networkPassword: string;
  networkType: "WPA" | "WEP" | "None";
}

export function QRCodeGenerator() {
  const { toast } = useToast();
  const { user } = useAuth();
  const router = useRouter();
  const [qrType, setQRType] = useState<QRType>("URL");
  const [qrName, setQrName] = useState("");
  const [qrData, setQrData] = useState<QRData>({
    url: "",
    text: "",
    email: "",
    emailSubject: "",
    emailBody: "",
    phoneNumber: "",
    fullName: "",
    organization: "",
    title: "",
    email_vcard: "",
    phone_vcard: "",
    website: "",
    address: "",
    networkName: "",
    networkPassword: "",
    networkType: "WPA",
  });
  const [size, setSize] = useState(200);
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#FFFFFF");
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [showLogoSettings, setShowLogoSettings] = useState(false);
  const [showFrameSettings, setShowFrameSettings] = useState(false);

  // Logo state
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoEnabled, setLogoEnabled] = useState(false);
  const [logoSize, setLogoSize] = useState(20); // percent
  const [logoPosition, setLogoPosition] = useState<'center' | 'custom'>('center');
  const [logoError, setLogoError] = useState<string | null>(null);

  // Frame state
  const [frameEnabled, setFrameEnabled] = useState(false);
  const [frameStyle, setFrameStyle] = useState<'classic' | 'rounded' | 'circular' | 'diamond' | 'custom'>('classic');
  const [frameColor, setFrameColor] = useState('#000000');
  const [frameThickness, setFrameThickness] = useState(8);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [scannabilityWarning, setScannabilityWarning] = useState<string | null>(null);

  const generateQRCodeContent = () => {
    switch (qrType) {
      case "URL":
        return qrData.url;
      case "Text":
        return qrData.text;
      case "Email":
        return `mailto:${qrData.email}?subject=${encodeURIComponent(
          qrData.emailSubject
        )}&body=${encodeURIComponent(qrData.emailBody)}`;
      case "Phone":
        return `tel:${qrData.phoneNumber}`;
      case "vCard":
        return `BEGIN:VCARD
VERSION:3.0
N:${qrData.fullName}
ORG:${qrData.organization}
TITLE:${qrData.title}
EMAIL:${qrData.email_vcard}
TEL:${qrData.phone_vcard}
URL:${qrData.website}
ADR:${qrData.address}
END:VCARD`;
      case "WiFi":
        return `WIFI:T:${qrData.networkType};S:${qrData.networkName};P:${qrData.networkPassword};;`;
      default:
        return "";
    }
  };

  const generateQRCode = async () => {
    try {
      const content = generateQRCodeContent();
      
      // Validate content before generating QR code
      if (!content) {
        toast({
          title: "No input text",
          description: "Please enter some content to generate a QR code.",
          variant: "destructive",
        });
        return;
      }
      
      const qrDataUrl = await QRCode.toDataURL(content, {
        width: size,
        margin: 1,
        color: {
          dark: fgColor,
          light: bgColor,
        },
      });
      setQrCodeDataUrl(qrDataUrl);
    } catch (err) {
      console.error("Error generating QR code:", err);
      toast({
        title: "Error generating QR code",
        description: "Please check your input and try again.",
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to save QR codes.",
        variant: "destructive",
      });
      return;
    }

    if (!qrName) {
      toast({
        title: "Name required",
        description: "Please provide a name for your QR code.",
        variant: "destructive",
      });
      return;
    }

    // Use the canvas image as the QR code image
    const canvas = canvasRef.current;
    if (!canvas) {
      toast({
        title: "No QR code generated",
        description: "Please generate a QR code before saving.",
        variant: "destructive",
      });
      return;
    }
    const composedImageDataUrl = canvas.toDataURL("image/png");

    // Validate content based on type
    const content = generateQRCodeContent();
    if (!content) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields for the selected QR code type.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      console.log('Starting QR code save...', {
        user: user.uid,
        qrName,
        qrType,
        content
      });

      const qrCodeData = {
        name: qrName,
        type: qrType,
        content,
        foregroundColor: fgColor,
        backgroundColor: bgColor,
        size,
        imageData: composedImageDataUrl,
      };

      console.log('Attempting to save QR code with data:', qrCodeData);
      await saveQRCodeToFirestore(user.uid, qrCodeData);
      console.log('QR code saved successfully');

      toast({
        title: "QR code saved",
        description: "Your QR code has been saved successfully.",
      });

      // Small delay before redirect to ensure toast is visible
      setTimeout(() => {
        router.push("/dashboard/qrcodes");
      }, 1000);
    } catch (error) {
      console.error("Error saving QR code:", error);
      toast({
        title: "Error saving QR code",
        description: typeof error === 'string' ? error : "Failed to save your QR code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = () => {
    if (qrCodeDataUrl) {
      const link = document.createElement("a");
      link.href = qrCodeDataUrl;
      link.download = `${qrName || "qr-code"}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const updateQRData = (key: keyof QRData, value: string) => {
    setQrData((prev) => ({ ...prev, [key]: value }));
  };

  // Logo upload handler
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp'].includes(file.type)) {
      setLogoError('Only PNG, JPG, SVG, or WEBP files are allowed.');
      return;
    }
    if (file.size > 1024 * 1024) {
      setLogoError('Logo file must be less than 1MB.');
      return;
    }
    setLogoError(null);
    setLogoFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setLogoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  // Frame gallery
  const frameStyles = [
    { key: 'classic', label: 'Classic (Square)' },
    { key: 'rounded', label: 'Rounded' },
    { key: 'circular', label: 'Circular' },
    { key: 'diamond', label: 'Diamond' },
    { key: 'custom', label: 'Custom Shape' },
  ];

  const renderInputFields = () => {
    switch (qrType) {
      case "URL":
        return (
          <div className="space-y-2 mb-4">
            <Label htmlFor="url">URL</Label>
            <Input
              id="url"
              placeholder="https://example.com"
              value={qrData.url}
              onChange={(e) => updateQRData("url", e.target.value)}
            />
          </div>
        );
      case "Text":
        return (
          <div className="space-y-2 mb-4">
            <Label htmlFor="text">Text Content</Label>
            <Input
              id="text"
              placeholder="Enter your text here"
              value={qrData.text}
              onChange={(e) => updateQRData("text", e.target.value)}
            />
          </div>
        );
      case "Email":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="example@email.com"
                value={qrData.email}
                onChange={(e) => updateQRData("email", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emailSubject">Subject</Label>
              <Input
                id="emailSubject"
                placeholder="Email subject"
                value={qrData.emailSubject}
                onChange={(e) => updateQRData("emailSubject", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emailBody">Message</Label>
              <Input
                id="emailBody"
                placeholder="Email body"
                value={qrData.emailBody}
                onChange={(e) => updateQRData("emailBody", e.target.value)}
              />
            </div>
          </div>
        );
      case "Phone":
        return (
          <div className="space-y-2 mb-4">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              id="phoneNumber"
              type="tel"
              placeholder="+1234567890"
              value={qrData.phoneNumber}
              onChange={(e) => updateQRData("phoneNumber", e.target.value)}
            />
          </div>
        );
      case "vCard":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                placeholder="John Doe"
                value={qrData.fullName}
                onChange={(e) => updateQRData("fullName", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="organization">Organization</Label>
              <Input
                id="organization"
                placeholder="Company Name"
                value={qrData.organization}
                onChange={(e) => updateQRData("organization", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Job Title</Label>
              <Input
                id="title"
                placeholder="Software Engineer"
                value={qrData.title}
                onChange={(e) => updateQRData("title", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email_vcard">Email</Label>
              <Input
                id="email_vcard"
                type="email"
                placeholder="john@example.com"
                value={qrData.email_vcard}
                onChange={(e) => updateQRData("email_vcard", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone_vcard">Phone</Label>
              <Input
                id="phone_vcard"
                type="tel"
                placeholder="+1234567890"
                value={qrData.phone_vcard}
                onChange={(e) => updateQRData("phone_vcard", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                placeholder="https://example.com"
                value={qrData.website}
                onChange={(e) => updateQRData("website", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                placeholder="123 Main St, City, Country"
                value={qrData.address}
                onChange={(e) => updateQRData("address", e.target.value)}
              />
            </div>
          </div>
        );
      case "WiFi":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="networkName">Network Name (SSID)</Label>
              <Input
                id="networkName"
                placeholder="WiFi Network Name"
                value={qrData.networkName}
                onChange={(e) => updateQRData("networkName", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="networkPassword">Password</Label>
              <div className="relative">
                <Input
                  id="networkPassword"
                  type="password"
                  placeholder="Network Password"
                  value={qrData.networkPassword}
                  onChange={(e) => updateQRData("networkPassword", e.target.value)}
                />
                <Lock className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Security Type</Label>
              <div className="flex gap-2">
                {["WPA", "WEP", "None"].map((type) => (
                  <Button
                    key={type}
                    variant={qrData.networkType === type ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateQRData("networkType", type as QRData["networkType"])}
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  // Canvas drawing logic
  useEffect(() => {
    const draw = async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw QR code base
      if (qrCodeDataUrl) {
        const qrImg = new window.Image();
        qrImg.src = qrCodeDataUrl;
        await new Promise((resolve) => {
          qrImg.onload = resolve;
        });
        ctx.drawImage(qrImg, 0, 0, size, size);
      }

      // Draw frame if enabled
      if (frameEnabled) {
        ctx.save();
        ctx.strokeStyle = frameColor;
        ctx.lineWidth = frameThickness;
        switch (frameStyle) {
          case 'classic':
            ctx.strokeRect(
              frameThickness / 2,
              frameThickness / 2,
              size - frameThickness,
              size - frameThickness
            );
            break;
          case 'rounded':
            ctx.beginPath();
            ctx.lineJoin = "round";
            ctx.moveTo(frameThickness, frameThickness * 2);
            ctx.arcTo(size - frameThickness, frameThickness, size - frameThickness, size - frameThickness, 24);
            ctx.arcTo(size - frameThickness, size - frameThickness, frameThickness, size - frameThickness, 24);
            ctx.arcTo(frameThickness, size - frameThickness, frameThickness, frameThickness, 24);
            ctx.arcTo(frameThickness, frameThickness, size - frameThickness, frameThickness, 24);
            ctx.closePath();
            ctx.stroke();
            break;
          case 'circular':
            ctx.beginPath();
            ctx.arc(size / 2, size / 2, size / 2 - frameThickness / 2, 0, 2 * Math.PI);
            ctx.stroke();
            break;
          case 'diamond':
            ctx.save();
            ctx.translate(size / 2, size / 2);
            ctx.rotate(Math.PI / 4);
            ctx.strokeRect(-size / 2 + frameThickness, -size / 2 + frameThickness, size - 2 * frameThickness, size - 2 * frameThickness);
            ctx.restore();
            break;
          case 'custom':
            // Custom shape placeholder
            ctx.setLineDash([8, 8]);
            ctx.strokeRect(
              frameThickness / 2,
              frameThickness / 2,
              size - frameThickness,
              size - frameThickness
            );
            ctx.setLineDash([]);
            break;
        }
        ctx.restore();
      }

      // Draw logo if enabled
      setScannabilityWarning(null);
      if (logoEnabled && logoPreview) {
        const logoImg = new window.Image();
        logoImg.src = logoPreview;
        await new Promise((resolve) => {
          logoImg.onload = resolve;
        });
        // Calculate logo size and position
        const logoPx = (logoSize / 100) * size;
        const x = (size - logoPx) / 2;
        const y = (size - logoPx) / 2;
        ctx.save();
        ctx.globalAlpha = 1;
        ctx.drawImage(logoImg, x, y, logoPx, logoPx);
        ctx.restore();
        // Scannability warning if logo is too large
        if (logoSize > 25) {
          setScannabilityWarning("Warning: Large logos may affect QR code scannability. Keep logo size under 25% for best results.");
        }
      }
    };
    draw();
  }, [qrCodeDataUrl, size, frameEnabled, frameStyle, frameColor, frameThickness, logoEnabled, logoPreview, logoSize]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* QR Code Generator Section - Takes up 2 columns */}
      <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border p-6">
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">QR Code Generator</h2>
            <p className="text-sm text-muted-foreground mt-2">
              Create a QR code by selecting a type and filling in the required information.
            </p>
          </div>
          
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            <Button
              variant={qrType === "URL" ? "default" : "outline"}
              onClick={() => setQRType("URL")}
              className="flex flex-col items-center justify-center h-20 gap-2"
            >
              <Link className="h-5 w-5" />
              <span className="text-xs">URL</span>
            </Button>
            <Button
              variant={qrType === "Text" ? "default" : "outline"}
              onClick={() => setQRType("Text")}
              className="flex flex-col items-center justify-center h-20 gap-2"
            >
              <QrCode className="h-5 w-5" />
              <span className="text-xs">Text</span>
            </Button>
            <Button
              variant={qrType === "Email" ? "default" : "outline"}
              onClick={() => setQRType("Email")}
              className="flex flex-col items-center justify-center h-20 gap-2"
            >
              <Mail className="h-5 w-5" />
              <span className="text-xs">Email</span>
            </Button>
            <Button
              variant={qrType === "Phone" ? "default" : "outline"}
              onClick={() => setQRType("Phone")}
              className="flex flex-col items-center justify-center h-20 gap-2"
            >
              <Phone className="h-5 w-5" />
              <span className="text-xs">Phone</span>
            </Button>
            <Button
              variant={qrType === "vCard" ? "default" : "outline"}
              onClick={() => setQRType("vCard")}
              className="flex flex-col items-center justify-center h-20 gap-2"
            >
              <User className="h-5 w-5" />
              <span className="text-xs">vCard</span>
            </Button>
            <Button
              variant={qrType === "WiFi" ? "default" : "outline"}
              onClick={() => setQRType("WiFi")}
              className="flex flex-col items-center justify-center h-20 gap-2"
            >
              <Wifi className="h-5 w-5" />
              <span className="text-xs">WiFi</span>
            </Button>
          </div>

          <div className="border-t pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left column: Main form fields */}
              <div>
                <div className="space-y-2 mb-6">
                  <Label htmlFor="qrName">QR Code Name</Label>
                  <Input
                    id="qrName"
                    placeholder="My QR Code"
                    value={qrName}
                    onChange={(e) => setQrName(e.target.value)}
                  />
                </div>

                <div className="bg-gray-50/50 rounded-lg p-6 mb-6">
                  {renderInputFields()}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="space-y-2">
                    <Label htmlFor="fgColor">Foreground Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="fgColor"
                        type="color"
                        value={fgColor}
                        onChange={(e) => setFgColor(e.target.value)}
                        className="w-12 h-10 p-1"
                      />
                      <Input
                        type="text"
                        value={fgColor}
                        onChange={(e) => setFgColor(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bgColor">Background Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="bgColor"
                        type="color"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="w-12 h-10 p-1"
                      />
                      <Input
                        type="text"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between">
                    <Label>QR Code Size</Label>
                    <span className="text-sm text-muted-foreground">{size}px</span>
                  </div>
                  <Slider
                    value={[size]}
                    onValueChange={(value) => setSize(value[0])}
                    min={100}
                    max={1000}
                    step={10}
                    className="w-full"
                  />
                </div>
              </div>
              {/* Right column: Advanced Settings */}
              <div>
                <div className="border rounded-lg p-4 bg-muted/30">
                  <h2 className="font-semibold text-lg mb-2">Advanced Settings</h2>
                  {/* Logo Section */}
                  <div>
                    <button
                      type="button"
                      className="flex items-center gap-2 w-full text-left py-2"
                      onClick={() => setShowLogoSettings((v) => !v)}
                    >
                      <span className="font-medium">Logo</span>
                      {showLogoSettings ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    {showLogoSettings && (
                      <div className="pl-4 pb-4 space-y-3">
                        <div className="flex items-center gap-2">
                          <Switch checked={logoEnabled} onCheckedChange={setLogoEnabled} />
                          <span>Enable Logo</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Input type="file" accept="image/png,image/jpeg,image/svg+xml,image/webp" onChange={handleLogoUpload} disabled={!logoEnabled} />
                          {logoPreview && (
                            <img src={logoPreview} alt="Logo preview" className="w-10 h-10 object-contain border rounded" />
                          )}
                        </div>
                        {logoError && <div className="text-red-500 text-xs">{logoError}</div>}
                        <div className="flex items-center gap-2">
                          <span>Logo Size</span>
                          <Slider min={10} max={30} value={[logoSize]} onValueChange={([v]) => setLogoSize(v)} disabled={!logoEnabled} className="w-32" />
                          <span>{logoSize}%</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>Position</span>
                          <select value={logoPosition} onChange={e => setLogoPosition(e.target.value as any)} disabled={!logoEnabled} className="border rounded px-2 py-1">
                            <option value="center">Center</option>
                            <option value="custom">Custom (coming soon)</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                  {/* Frame Section */}
                  <div>
                    <button
                      type="button"
                      className="flex items-center gap-2 w-full text-left py-2"
                      onClick={() => setShowFrameSettings((v) => !v)}
                    >
                      <span className="font-medium">Frame</span>
                      {showFrameSettings ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    {showFrameSettings && (
                      <div className="pl-4 pb-4 space-y-3">
                        <div className="flex items-center gap-2">
                          <Switch checked={frameEnabled} onCheckedChange={setFrameEnabled} />
                          <span>Enable Frame</span>
                        </div>
                        <div className="flex items-center gap-2 overflow-x-auto pb-2">
                          {frameStyles.map(style => (
                            <button
                              key={style.key}
                              className={`px-3 py-1 rounded border ${frameStyle === style.key ? 'border-primary bg-primary/10' : 'border-muted'}`}
                              onClick={() => setFrameStyle(style.key as any)}
                              disabled={!frameEnabled}
                            >
                              {style.label}
                            </button>
                          ))}
                        </div>
                        <div className="flex items-center gap-2">
                          <span>Frame Color</span>
                          {frameEnabled ? (
                            <SketchPicker
                              color={frameColor}
                              onChange={(color: { hex: string }) => setFrameColor(color.hex)}
                              disableAlpha
                              presetColors={["#000000", "#FFFFFF", "#FF0000", "#00FF00", "#0000FF"]}
                              width="180px"
                              className="border rounded"
                              styles={{ default: { picker: { boxShadow: 'none' } } }}
                            />
                          ) : (
                            <div className="w-[180px] h-10 rounded border bg-gray-100 flex items-center justify-center text-xs text-gray-400">Disabled</div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span>Thickness</span>
                          <Slider min={2} max={24} value={[frameThickness]} onValueChange={([v]) => setFrameThickness(v)} disabled={!frameEnabled} className="w-32" />
                          <span>{frameThickness}px</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-4 mt-8">
              <Button 
                onClick={generateQRCode} 
                className="flex-1" 
                size="lg"
              >
                Generate QR Code
              </Button>
              {qrCodeDataUrl && (
                <Button
                  onClick={handleSave}
                  className="flex-1"
                  size="lg"
                  variant="default"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save QR Code"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Preview Section - Takes up 1 column */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Preview</h2>
            <p className="text-sm text-muted-foreground mt-2">
              Preview and download your generated QR code.
            </p>
          </div>
          <div className="aspect-square bg-gray-50 border rounded-lg p-6 flex flex-col items-center justify-center relative">
            {qrCodeDataUrl ? (
              <canvas
                ref={canvasRef}
                width={size}
                height={size}
                style={{ maxWidth: "100%", height: "auto", borderRadius: 8, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full w-full">
                <QrCode className="h-20 w-20 mx-auto mb-4" />
                <p className="text-sm">Your QR code will appear here</p>
                <p className="text-xs text-muted-foreground mt-2">Click generate to create your QR code</p>
              </div>
            )}
            {scannabilityWarning && (
              <div className="text-xs text-yellow-600 mt-2 text-center">{scannabilityWarning}</div>
            )}
          </div>
          {qrCodeDataUrl && (
            <Button
              onClick={handleDownload}
              className="w-full"
              size="lg"
              variant="outline"
            >
              Download QR Code
            </Button>
          )}
        </div>
      </div>
    </div>
  );
} 