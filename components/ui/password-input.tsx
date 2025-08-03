"use client";
import * as React from "react";
import { Input, InputProps } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const PasswordInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const togglePasswordVisibility = () => setShowPassword(!showPassword);

    return (
      <div className="relative">
        <Input
          type={showPassword ? "text" : "password"}
          className={cn("pr-10", className)}
          ref={ref}
          {...props}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
          onClick={togglePasswordVisibility}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              togglePasswordVisibility();
            }
          }}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={showPassword ? "eye" : "eye-off"}
              initial={{
                rotate: showPassword ? -45 : 45,
                opacity: 0,
                scale: 0.8,
              }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{
                rotate: showPassword ? 45 : -45,
                opacity: 0,
                scale: 0.8,
              }}
              transition={{ duration: 0.2 }}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Eye className="h-4 w-4" aria-hidden="true" />
              )}
            </motion.div>
          </AnimatePresence>
          <span className="sr-only">
            {showPassword ? "Hide password" : "Show password"}
          </span>
        </Button>
      </div>
    );
  }
);

PasswordInput.displayName = "PasswordInput";

export { PasswordInput }; 