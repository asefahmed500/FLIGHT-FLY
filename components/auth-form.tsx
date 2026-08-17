"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Mail, Lock, User, ArrowRight, KeyRound, ArrowLeft, CheckCircle2 } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

// Zod Validation Schemas
const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Please enter a valid corporate or personal email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

const signupSchema = z.object({
  fullname: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

const forgotSchema = z.object({
  email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
})

type LoginFormValues = z.infer<typeof loginSchema>
type SignupFormValues = z.infer<typeof signupSchema>
type ForgotFormValues = z.infer<typeof forgotSchema>

interface AuthFormProps {
  initialTab?: "login" | "signup"
  onSuccess?: () => void
}

export function AuthForm({ initialTab = "login", onSuccess }: AuthFormProps) {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle, resetPassword } = useAuth()
  const [tab, setTab] = useState<"login" | "signup" | "forgot">(initialTab)
  const [successMsg, setSuccessMsg] = useState("")
  const [authError, setAuthError] = useState("")

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  const signupForm = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { fullname: "", email: "", password: "" },
  })

  const forgotForm = useForm<ForgotFormValues>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: "" },
  })

  const finish = (message: string) => {
    setSuccessMsg(message)
    setTimeout(() => {
      setSuccessMsg("")
      loginForm.reset()
      signupForm.reset()
      forgotForm.reset()
      setTab(initialTab)
      onSuccess?.()
    }, 1000)
  }

  const onLoginSubmit = async (data: LoginFormValues) => {
    setAuthError("")
    try {
      await signInWithEmail(data.email, data.password)
      finish(`Welcome back! Logged in as ${data.email}`)
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : "Failed to sign in. Please check your credentials.")
    }
  }

  const onSignupSubmit = async (data: SignupFormValues) => {
    setAuthError("")
    try {
      await signUpWithEmail(data.email, data.password, data.fullname)
      finish(`Account created successfully for ${data.fullname}!`)
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : "Failed to create account. Please try again.")
    }
  }

  const onForgotSubmit = async (data: ForgotFormValues) => {
    setAuthError("")
    try {
      await resetPassword(data.email)
      setSuccessMsg(`Password reset link sent to ${data.email}!`)
      setTimeout(() => {
        setSuccessMsg("")
        forgotForm.reset()
        setTab("login")
      }, 1800)
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : "Failed to send reset email.")
    }
  }

  const handleGoogleSignIn = async () => {
    setAuthError("")
    try {
      await signInWithGoogle()
      finish("Signed in with Google successfully!")
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : "Google Sign-In failed.")
    }
  }

  return (
    <div>
      {authError && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-medium text-rose-600 text-center">
          {authError}
        </div>
      )}

      {successMsg ? (
        <div className="py-8 text-center space-y-3">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-xl font-bold animate-bounce">
            <CheckCircle2 className="w-7 h-7 text-emerald-600" />
          </div>
          <p className="font-semibold text-slate-800 text-base max-w-xs mx-auto">{successMsg}</p>
        </div>
      ) : (
        <>
          {/* Google Sign-In Button */}
          {tab !== "forgot" && (
            <div className="mb-5">
              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleSignIn}
                className="w-full h-11 border-slate-200 hover:bg-slate-50 font-medium text-slate-700 text-sm rounded-xl flex items-center justify-center gap-2 shadow-sm"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                Continue with Google
              </Button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-200" /></div>
                <div className="relative flex justify-center text-[10px] uppercase font-semibold text-slate-400">
                  <span className="bg-white px-3">or continue with email</span>
                </div>
              </div>
            </div>
          )}

          {tab === "forgot" ? (
            <form onSubmit={forgotForm.handleSubmit(onForgotSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="forgot-email" className="text-xs font-medium text-slate-700 uppercase tracking-wider">Email Address</Label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                  <Input
                    id="forgot-email"
                    type="email"
                    placeholder="name@company.com"
                    {...forgotForm.register("email")}
                    className="pl-9 h-11 border-slate-200 font-normal focus:border-[#1E40AF]"
                  />
                </div>
                {forgotForm.formState.errors.email && (
                  <p className="text-xs text-rose-500 font-medium">{forgotForm.formState.errors.email.message}</p>
                )}
              </div>

              <Button type="submit" disabled={forgotForm.formState.isSubmitting} className="w-full h-11 bg-[#1E40AF] hover:bg-[#0F172A] text-white font-medium shadow-md transition-all flex items-center justify-center gap-2">
                <KeyRound className="w-4 h-4" /> {forgotForm.formState.isSubmitting ? "Sending link..." : "Send Reset Instructions"}
              </Button>

              <button
                type="button"
                onClick={() => setTab("login")}
                className="w-full flex items-center justify-center gap-1.5 text-xs text-slate-600 hover:text-[#1E40AF] font-medium pt-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
              </button>
            </form>
          ) : (
            <Tabs value={tab} onValueChange={(v) => setTab(v as "login" | "signup")}>
              <TabsList className="grid grid-cols-2 mb-6 bg-slate-100 p-1 rounded-xl">
                <TabsTrigger value="login" className="rounded-lg font-medium text-sm data-[state=active]:bg-white data-[state=active]:text-[#0F172A] data-[state=active]:shadow-sm">
                  Sign In
                </TabsTrigger>
                <TabsTrigger value="signup" className="rounded-lg font-medium text-sm data-[state=active]:bg-white data-[state=active]:text-[#0F172A] data-[state=active]:shadow-sm">
                  Create Account
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="login-email" className="text-xs font-medium text-slate-700 uppercase tracking-wider">Email Address</Label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="name@company.com"
                        {...loginForm.register("email")}
                        className="pl-9 h-11 border-slate-200 font-normal focus:border-[#1E40AF]"
                      />
                    </div>
                    {loginForm.formState.errors.email && (
                      <p className="text-xs text-rose-500 font-medium">{loginForm.formState.errors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="login-pass" className="text-xs font-medium text-slate-700 uppercase tracking-wider">Password</Label>
                      <button
                        type="button"
                        onClick={() => setTab("forgot")}
                        className="text-xs text-[#1E40AF] hover:underline font-medium cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                      <Input
                        id="login-pass"
                        type="password"
                        placeholder="••••••••"
                        {...loginForm.register("password")}
                        className="pl-9 h-11 border-slate-200 font-normal focus:border-[#1E40AF]"
                      />
                    </div>
                    {loginForm.formState.errors.password && (
                      <p className="text-xs text-rose-500 font-medium">{loginForm.formState.errors.password.message}</p>
                    )}
                  </div>

                  <Button type="submit" disabled={loginForm.formState.isSubmitting} className="w-full h-11 bg-[#0F172A] hover:bg-[#1E40AF] text-white font-medium shadow-md transition-all">
                    {loginForm.formState.isSubmitting ? "Signing in..." : "Sign In to Account"} <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="fullname" className="text-xs font-medium text-slate-700 uppercase tracking-wider">Full Name</Label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                      <Input
                        id="fullname"
                        type="text"
                        placeholder="John Doe"
                        {...signupForm.register("fullname")}
                        className="pl-9 h-11 border-slate-200 font-normal focus:border-[#1E40AF]"
                      />
                    </div>
                    {signupForm.formState.errors.fullname && (
                      <p className="text-xs text-rose-500 font-medium">{signupForm.formState.errors.fullname.message}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="signup-email" className="text-xs font-medium text-slate-700 uppercase tracking-wider">Email Address</Label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="name@company.com"
                        {...signupForm.register("email")}
                        className="pl-9 h-11 border-slate-200 font-normal focus:border-[#1E40AF]"
                      />
                    </div>
                    {signupForm.formState.errors.email && (
                      <p className="text-xs text-rose-500 font-medium">{signupForm.formState.errors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="signup-pass" className="text-xs font-medium text-slate-700 uppercase tracking-wider">Password</Label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                      <Input
                        id="signup-pass"
                        type="password"
                        placeholder="Min 8 characters"
                        {...signupForm.register("password")}
                        className="pl-9 h-11 border-slate-200 font-normal focus:border-[#1E40AF]"
                      />
                    </div>
                    {signupForm.formState.errors.password && (
                      <p className="text-xs text-rose-500 font-medium">{signupForm.formState.errors.password.message}</p>
                    )}
                  </div>

                  <Button type="submit" disabled={signupForm.formState.isSubmitting} className="w-full h-11 bg-[#D97706] hover:bg-[#B45309] text-white font-medium shadow-md transition-all">
                    {signupForm.formState.isSubmitting ? "Creating..." : "Create VIP Account"} <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          )}
        </>
      )}

      <div className="mt-6 pt-4 border-t border-slate-100 text-center">
        <p className="text-xs text-slate-500 font-normal">
          By continuing, you agree to FlightFly&apos;s <a href="#" className="underline text-slate-700">Terms of Service</a> & <a href="#" className="underline text-slate-700">Privacy Policy</a>.
        </p>
      </div>
    </div>
  )
}