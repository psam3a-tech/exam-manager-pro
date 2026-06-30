import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { User, Lock, CheckCircle2 } from "lucide-react";

const infoSchema = z.object({
  name: z.string().min(2, "Full name must be at least 2 characters"),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Please enter your current password"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Please confirm your new password"),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type InfoForm = z.infer<typeof infoSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

export default function AdminProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [infoLoading, setInfoLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwSuccess, setPwSuccess] = useState(false);

  const infoForm = useForm<InfoForm>({
    resolver: zodResolver(infoSchema),
    defaultValues: { name: user?.name ?? "" },
  });

  const pwForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  async function saveInfo(values: InfoForm) {
    setInfoLoading(true);
    try {
      await api.put("/auth/me", { name: values.name });
      toast({ title: "Profile updated", description: "Your name has been saved." });
    } catch (err: any) {
      toast({ title: "Error", description: err?.message || "Failed to update profile.", variant: "destructive" });
    } finally {
      setInfoLoading(false);
    }
  }

  async function changePassword(values: PasswordForm) {
    setPwLoading(true);
    try {
      await api.put("/auth/me", {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      setPwSuccess(true);
      pwForm.reset();
      setTimeout(() => setPwSuccess(false), 4000);
      toast({ title: "Password changed", description: "You can now sign in with your new password." });
    } catch (err: any) {
      toast({ title: "Error", description: err?.message || "Failed to change password.", variant: "destructive" });
    } finally {
      setPwLoading(false);
    }
  }

  if (!user) return null;

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-2xl font-bold">My Profile</h1>
          <p className="text-muted-foreground mt-1">Manage your personal information and account security.</p>
        </div>

        {/* Avatar + read-only summary */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl shrink-0">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-lg font-semibold truncate">{user.name}</p>
                <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="capitalize text-xs">
                    {user.role.replace("_", " ")}
                  </Badge>
                  {user.departmentName && (
                    <span className="text-xs text-muted-foreground">{user.departmentName}</span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal information */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">Personal Information</CardTitle>
            </div>
            <CardDescription>Update your display name shown across the platform.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...infoForm}>
              <form onSubmit={infoForm.handleSubmit(saveInfo)} className="space-y-4">
                <FormField
                  control={infoForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none">Email Address</label>
                  <Input value={user.email} disabled className="bg-muted/50 cursor-not-allowed" />
                  <p className="text-xs text-muted-foreground">
                    Email cannot be changed here. Use the database directly if needed.
                  </p>
                </div>

                <Button type="submit" disabled={infoLoading} className="w-full sm:w-auto">
                  {infoLoading ? "Saving..." : "Save changes"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Change password */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">Change Password</CardTitle>
            </div>
            <CardDescription>Choose a strong password you haven't used before.</CardDescription>
          </CardHeader>
          <CardContent>
            {pwSuccess && (
              <div className="flex items-center gap-2 p-3 rounded-md bg-green-50 border border-green-200 text-green-800 text-sm mb-4">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                Password changed successfully!
              </div>
            )}
            <Form {...pwForm}>
              <form onSubmit={pwForm.handleSubmit(changePassword)} className="space-y-4">
                <FormField
                  control={pwForm.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Password</FormLabel>
                      <FormControl>
                        <Input type="password" autoComplete="current-password" placeholder="Your current password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={pwForm.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <Input type="password" autoComplete="new-password" placeholder="At least 6 characters" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={pwForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm New Password</FormLabel>
                      <FormControl>
                        <Input type="password" autoComplete="new-password" placeholder="Repeat your new password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" disabled={pwLoading} variant="outline" className="w-full sm:w-auto">
                  {pwLoading ? "Changing..." : "Change password"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
