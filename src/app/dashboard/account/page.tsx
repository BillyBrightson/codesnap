"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { UserCircle, Lock, LogOut } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { updateProfile, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";

// Profile update schema
const profileFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
});

// Password update schema
const passwordFormSchema = z.object({
  currentPassword: z.string().min(8, {
    message: "Current password is required.",
  }),
  newPassword: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
  confirmPassword: z.string().min(8, {
    message: "Password confirmation is required.",
  }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export default function AccountPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  
  // Profile form
  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user?.displayName || "",
      email: user?.email || "",
    },
  });
  
  // Password form
  const passwordForm = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });
  
  // Handle profile update
  async function onProfileSubmit(values: z.infer<typeof profileFormSchema>) {
    if (!user) return;
    
    setLoading(true);
    
    try {
      // Update Firebase profile
      await updateProfile(user, {
        displayName: values.name
      });
      
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  }
  
  // Handle password update
  async function onPasswordSubmit(values: z.infer<typeof passwordFormSchema>) {
    if (!user || !user.email) return;
    
    setLoading(true);
    
    try {
      // Reauthenticate the user first
      const credential = EmailAuthProvider.credential(
        user.email,
        values.currentPassword
      );
      
      await reauthenticateWithCredential(user, credential);
      
      // Update the password
      await updatePassword(user, values.newPassword);
      
      toast.success("Password updated successfully");
      passwordForm.reset({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      console.error("Error updating password:", error);
      if (error.code === 'auth/wrong-password') {
        toast.error("Current password is incorrect");
      } else {
        toast.error("Failed to update password");
      }
    } finally {
      setLoading(false);
    }
  }
  
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Account Settings</h2>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <UserCircle className="h-5 w-5" />
              <CardTitle>Profile Information</CardTitle>
            </div>
            <CardDescription>
              Update your account profile details.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...profileForm}>
              <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                <FormField
                  control={profileForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={profileForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="example@example.com" {...field} disabled />
                      </FormControl>
                      <FormDescription>
                        Email address cannot be changed.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button type="submit" className="w-full mt-4" disabled={loading}>
                  {loading ? "Updating..." : "Update Profile"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              <CardTitle>Change Password</CardTitle>
            </div>
            <CardDescription>
              Update your password to keep your account secure.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...passwordForm}>
              <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                <FormField
                  control={passwordForm.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={passwordForm.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={passwordForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button type="submit" className="w-full mt-4" disabled={loading}>
                  {loading ? "Updating..." : "Change Password"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-8">
        <Card className="border-red-200">
          <CardHeader>
            <div className="flex items-center gap-2">
              <LogOut className="h-5 w-5 text-red-500" />
              <CardTitle>Delete Account</CardTitle>
            </div>
            <CardDescription>
              Permanently delete your account and all your data.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Once you delete your account, there is no going back. Please be certain.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="destructive" onClick={() => {
              toast.error("Account deletion is disabled in this demo");
            }}>
              Delete Account
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
} 