import Link from "next/link";
import Image from "next/image";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { 
  QrCode, 
  BarChart3, 
  Palette, 
  Zap, 
  ShieldCheck, 
  Database 
} from "lucide-react";

const features = [
  {
    title: "Dynamic QR Codes",
    description: "Change where your QR codes point to without reprinting them. Perfect for campaigns and menus.",
    icon: Zap,
  },
  {
    title: "Custom Design",
    description: "Customize colors, add your logo, and choose frame styles to match your brand.",
    icon: Palette,
  },
  {
    title: "Detailed Analytics",
    description: "Track scans, locations, and devices to optimize your marketing efforts.",
    icon: BarChart3,
  },
  {
    title: "Multiple QR Types",
    description: "Create QR codes for URLs, text, email, phone numbers, vCards, and WiFi networks.",
    icon: QrCode,
  },
  {
    title: "Secure Storage",
    description: "All your QR codes are securely stored in the cloud for easy access and management.",
    icon: Database,
  },
  {
    title: "Privacy-Focused",
    description: "We prioritize your data privacy and security with encrypted connections.",
    icon: ShieldCheck,
  },
];

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="flex flex-col min-h-screen">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-28">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                    QR Codes That Work Smarter For Your Business
                  </h1>
                  <p className="max-w-[600px] text-gray-500 md:text-xl dark:text-gray-400 mt-4">
                    Create customizable QR codes that drive engagement and provide valuable insights. Perfect for marketing campaigns, menus, and more.
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row mt-6">
                  <Button asChild size="lg" className="w-full sm:w-auto">
                    <Link href="/register">Get Started Free</Link>
                  </Button>
                  <Button variant="outline" size="lg" asChild className="w-full sm:w-auto">
                    <Link href="/pricing">View Pricing</Link>
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative w-full max-w-[400px] h-[400px] flex items-center justify-center">
                  <Image 
                    src="/qr-code-demo.png" 
                    alt="QR Code Example" 
                    width={400} 
                    height={400}
                    className="object-contain"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="w-full py-16 md:py-24 bg-gray-50 dark:bg-gray-900">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-10">
              <div className="space-y-2 max-w-3xl mx-auto">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Packed with powerful features
                </h2>
                <p className="text-gray-500 md:text-xl/relaxed lg:text-xl/relaxed dark:text-gray-400 mt-4">
                  Everything you need to create, manage, and track your QR codes
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                <div key={index} className="flex flex-col items-start space-y-3 rounded-lg border p-6 transition-all hover:bg-gray-100 dark:hover:bg-gray-800">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                    <feature.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-xl font-bold">{feature.title}</h3>
                  <p className="text-gray-500 dark:text-gray-400">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Ready to get started?
                </h2>
                <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  Join thousands of businesses using CodeSnap QR to connect with their customers.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button asChild size="lg">
                  <Link href="/register">Create Your First QR Code</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
        
        {/* Footer */}
        <footer className="w-full py-6 bg-gray-100 dark:bg-gray-900">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="mb-4 md:mb-0">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-xl">CodeSnap QR</span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  &copy; {new Date().getFullYear()} CodeSnap QR. All rights reserved.
                </p>
              </div>
              <div className="flex space-x-4">
                <Link href="/privacy" className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50">
                  Privacy
                </Link>
                <Link href="/terms" className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50">
                  Terms
                </Link>
                <Link href="/contact" className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50">
                  Contact
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
