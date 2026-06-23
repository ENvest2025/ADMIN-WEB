import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
    required?: boolean;
}

export const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
    ({ label, error, required, type, className, ...props }, ref) => {
        const [showPassword, setShowPassword] = useState(false);
        const isPassword = type === 'password';
        const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

        return (
            <div className="space-y-1.5 w-full">
                <Label className="text-slate-700 font-semibold text-sm">
                    {label} {required && <span className="text-red-500">*</span>}
                </Label>
                <div className="relative">
                    <Input
                        ref={ref}
                        type={inputType}
                        className={cn(
                            "h-12 border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus-visible:ring-yellow-400 focus-visible:border-yellow-400",
                            isPassword && "pr-10",
                            error && "border-red-500 focus-visible:ring-red-500",
                            className
                        )}
                        {...props}
                    />
                    {isPassword && (
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    )}
                </div>
                {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
            </div>
        );
    }
);

FormInput.displayName = 'FormInput';
