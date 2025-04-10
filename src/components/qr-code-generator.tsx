"use client";

import { useState } from "react";
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
} from "lucide-react";

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

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* QR Code Generator Form */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border p-6">
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">QR Code Generator</h2>
            <p className="text-sm text-muted-foreground mt-2">
              Create a QR code by selecting a type and filling in the required information.
            </p>
          </div>
          
          {/* QR Type Selection */}
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
            {/* QR Code Name */}
            <div className="space-y-2 mb-6">
              <Label htmlFor="qrName">QR Code Name</Label>
              <Input
                id="qrName"
                placeholder="My QR Code"
                value={qrName}
                onChange={(e) => setQrName(e.target.value)}
              />
            </div>

            {/* Dynamic Input Fields */}
            <div className="bg-gray-50/50 rounded-lg p-6 mb-6">
              {renderInputFields()}
            </div>

            {/* Color Selection */}
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

            {/* Size Slider */}
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

            <Button onClick={generateQRCode} className="w-full" size="lg">
              Generate QR Code
            </Button>
          </div>
        </div>
      </div>

      {/* QR Code Preview */}
      <div className="lg:w-[400px] xl:w-[450px]">
        <div className="bg-white rounded-xl shadow-sm border p-6 sticky top-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Preview</h2>
              <p className="text-sm text-muted-foreground mt-2">
                Preview and download your generated QR code.
              </p>
            </div>
            
            <div className="aspect-square bg-gray-50 border rounded-lg p-6 flex flex-col items-center justify-center">
              {qrCodeDataUrl ? (
                <img
                  src={qrCodeDataUrl}
                  alt="Generated QR Code"
                  className="max-w-full h-auto rounded shadow-sm"
                />
              ) : (
                <div className="text-gray-400 text-center">
                  <QrCode className="h-20 w-20 mx-auto mb-4" />
                  <p className="text-sm">Your QR code will appear here</p>
                  <p className="text-xs text-muted-foreground mt-2">Click generate to create your QR code</p>
                </div>
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
    </div>
  );
} 