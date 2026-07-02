"use client";
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { CanvasRevealEffectDemo3 } from "#components/features/backgrounds/background";
import { Label } from "../../../ui/label";
import { Input } from "../../../ui/input";
import { cn } from "@/lib/utils";

export function LoginFormDemo() {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const submissionPayload = {
      email: formData.email.trim(),
      password: formData.password,
    };

    try {
      const response = await axios.post("http://localhost:5000/api/auth/login", submissionPayload);

      if (response.data?.token) {
        localStorage.setItem("authToken", response.data.token);
      } else if (response.data?.authToken) {
        localStorage.setItem("authToken", response.data.authToken);
      }

      alert("Login successful! Redirecting to your photo feed...");
      navigate("/gallery");
    } catch (err: any) {
      console.error("Backend Error Details:", err.response?.data);
      alert(err.response?.data?.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      onMouseEnter={() => setHovered(true)} 
      onMouseLeave={() => setHovered(false)} 
      className="relative min-h-screen w-full flex items-center justify-center bg-transparent"
    >
      <CanvasRevealEffectDemo3 hovered={hovered} />

      <div className="shadow-input mx-auto w-full max-w-md m-12 rounded-none bg-white p-4 md:rounded-4xl md:p-8 dark:bg-black relative z-10 border border-neutral-200 dark:border-neutral-800">
        <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-200">
          Welcome back
        </h2>
        <p className="mt-2 max-w-sm text-sm text-neutral-600 dark:text-neutral-300">
          Sign in to continue to your PxePhotos vault.
        </p>

        <form className="my-8" onSubmit={handleLogin}>
          <LabelInputContainer className="mb-4">
            <Label htmlFor="email">Email Address</Label>
            <Input 
              id="email" 
              placeholder="projectmayhem@fc.com" 
              type="email" 
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </LabelInputContainer>

          <LabelInputContainer className="mb-7">
            <Label htmlFor="password">Password</Label>
            <Input 
              id="password" 
              placeholder="password"
              type="password" 
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </LabelInputContainer>

          <button 
            className="group/btn relative flex items-center justify-center h-11 w-full rounded-md font-medium text-white transition-all duration-200 hover:-translate-y-0.5 shadow-[0_1px_0_0_rgba(255,255,255,0.1)_inset] bg-linear-to-r from-zinc-900 via-neutral-800 to-zinc-900 dark:bg-linear-to-r dark:from-zinc-900 dark:via-neutral-800 dark:to-zinc-900 border border-white/8 disabled:opacity-50 cursor-pointer"
            type="submit"
            disabled={loading}
          >
            <span>{loading ? "Verifying Credentials..." : "Sign in \u2192"}</span>
            <BottomGradient />
          </button>

          <div className="my-8 h-px w-full bg-linear-to-r from-transparent via-neutral-300 to-transparent dark:via-neutral-700" />
        </form>

        <div className="text-center">
          <p className="text-neutral-600 dark:text-neutral-400 text-sm">
            Don't have account? 
            <Link to="/signup" className="ml-2 text-neutral-800 dark:text-white font-semibold hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const BottomGradient = () => {
  return (
    <>
      <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-linear-to-r from-transparent via-cyan-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
      <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-linear-to-r from-transparent via-indigo-500 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
    </>
  );
};

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex w-full flex-col space-y-2", className)}>
      {children}
    </div>
  );
};
