import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp";

interface OTPInputProps {
    value: string;
    onChange: (value: string) => void;
    length?: number;
}

export function OTPInput({ value, onChange, length = 6 }: OTPInputProps) {
    return (
        <div className="flex justify-center">
            <InputOTP
                maxLength={length}
                value={value}
                onChange={onChange}
            >
                <InputOTPGroup className="gap-2">
                    {Array.from({ length }).map((_, index) => (
                        <InputOTPSlot
                            key={index}
                            index={index}
                            className="w-12 h-14 border-slate-200 text-2xl font-bold bg-white rounded-lg focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400"
                        />
                    ))}
                </InputOTPGroup>
            </InputOTP>
        </div>
    );
}
