"use client";
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { CanvasRevealEffectDemo3 } from "#components/features/backgrounds/background";
import { Label } from "../../../ui/label";
import { Input } from "../../../ui/input";
import { cn } from "@/lib/utils";
import { IconBrandGithub, IconBrandGoogle } from "@tabler/icons-react";

export function SignupFormDemo() {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
  });

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    // EXACT MATCH PAYLOAD: Sending separate parameters instead of combining them
    const submissionPayload = {
      firstname: formData.firstname.trim(),
      lastname: formData.lastname.trim(),
      email: formData.email.trim(),
      password: formData.password,
    };

    try {
      const response = await axios.post("http://localhost:5000/api/auth/signup", submissionPayload);
      
      if (response.data?.token) {
        localStorage.setItem("authToken", response.data.token);
      } else if (response.data?.authToken) {
        localStorage.setItem("authToken", response.data.authToken);
      }

      alert("Account created successfully! Redirecting to your photo feed...");
      navigate("/gallery");
    } catch (err: any) {
      console.error("Backend Error Details:", err.response?.data);
      alert(err.response?.data?.message || "Signup failed. Please check credentials and retry.");
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
          Welcome to PxePhotos
        </h2>
        <p className="mt-2 max-w-sm text-sm text-neutral-600 dark:text-neutral-300">
          Create an account to build your distributed production-grade media vault pipeline.
        </p>

        <form className="my-8" onSubmit={handleSignup}>
          <div className="mb-4 flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
            <LabelInputContainer>
              <Label htmlFor="firstname">First name</Label>
              <Input 
                id="firstname" 
                placeholder="Tyler" 
                type="text" 
                required
                value={formData.firstname}
                onChange={(e) => setFormData({ ...formData, firstname: e.target.value })}
              />
            </LabelInputContainer>
            
            <LabelInputContainer>
              <Label htmlFor="lastname">Last name</Label>
              <Input 
                id="lastname" 
                placeholder="Durden" 
                type="text" 
                required
                value={formData.lastname}
                onChange={(e) => setFormData({ ...formData, lastname: e.target.value })}
              />
            </LabelInputContainer>
          </div>

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
              placeholder="••••••••" 
              type="password" 
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </LabelInputContainer>

          <button 
            className="group/btn relative flex items-center justify-center h-11 w-full rounded-md font-medium text-white transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 shadow-[0px_1px_0px_0px_rgba(255,255,255,0.1)_inset] bg-linear-to-r from-zinc-900 via-neutral-800 to-zinc-900 border border-white/8 disabled:opacity-50 cursor-pointer"
            type="submit"
            disabled={loading}
          >
            <span>{loading ? "Verifying Context..." : "Sign up →"}</span>
            <BottomGradient />
          </button>

          <div className="my-8 h-px w-full bg-linear-to-r from-transparent via-neutral-300 to-transparent dark:via-neutral-700" />

          <div className="flex flex-col space-y-2">
            <button 
              type="button"
              className="group/btn shadow-input relative flex h-10 w-full items-center justify-start space-x-2 rounded-md bg-gray-50 px-4 font-medium text-black dark:bg-zinc-900 dark:shadow-[0px_0px_1px_1px_#262626]"
            >
              <IconBrandGithub className="h-4 w-4 text-neutral-800 dark:text-neutral-300" />
              <span className="text-sm text-neutral-700 dark:text-neutral-300">GitHub</span>
              <BottomGradient />
            </button>
            
            <button 
              type="button"
              className="group/btn shadow-input relative flex h-10 w-full items-center justify-start space-x-2 rounded-md bg-gray-50 px-4 font-medium text-black dark:bg-zinc-900 dark:shadow-[0px_0px_1px_1px_#262626]"
            >
              <IconBrandGoogle className="h-4 w-4 text-neutral-800 dark:text-neutral-300" />
              <span className="text-sm text-neutral-700 dark:text-neutral-300">Google</span>
              <BottomGradient />
            </button>
          </div>
        </form>

        <div className="text-center">
          <p className="text-neutral-600 dark:text-neutral-400 text-sm">
            Already have an account? 
            <Link to="/login" className="ml-2 text-neutral-800 dark:text-white font-semibold hover:underline">
              Login here
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
