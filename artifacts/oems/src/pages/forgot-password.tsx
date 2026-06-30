import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { AuthLayout } from "@/components/layout/auth-layout";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { api } from "@/lib/api";
import { KeyRound, ArrowLeft, Copy, Check } from "lucide-react";

const schema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export default function ForgotPassword() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [resetCode, setResetCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: z.infer<typeof schema>) {
    setIsLoading(true);
    try {
      const data = await api.post<{ resetCode: string }>("/auth/forgot-password", {
        email: values.email,
      });
      setResetCode(data.resetCode);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.message || "No account found with that email address.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  function copyCode() {
    if (resetCode) {
      navigator.clipboard.writeText(resetCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  if (resetCode) {
    return (
      <AuthLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <KeyRound className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Reset code generated</h1>
              <p className="text-sm text-muted-foreground">Use this code on the next screen</p>
            </div>
          </div>

          <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Your reset code</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-2xl font-mono font-bold tracking-[0.3em] text-foreground">
                {resetCode}
              </code>
              <Button type="button" variant="ghost" size="icon" onClick={copyCode} className="h-8 w-8 shrink-0">
                {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              This code expires in <strong>1 hour</strong>. In production it would be sent to your email.
            </p>
          </div>

          <Button
            type="button"
            className="w-full"
            onClick={() => setLocation(`/reset-password?code=${resetCode}`)}
          >
            Continue to reset password
          </Button>

          <button
            type="button"
            onClick={() => setLocation("/login")}
            className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Back to sign in
          </button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="space-y-6">
        <div>
          <button
            type="button"
            onClick={() => setLocation("/login")}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to sign in
          </button>
          <h1 className="text-2xl font-bold text-foreground">Forgot your password?</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter your email address and we'll generate a reset code for you.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input placeholder="you@university.edu" type="email" autoComplete="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Generating reset code..." : "Get reset code"}
            </Button>
          </form>
        </Form>
      </div>
    </AuthLayout>
  );
}
