import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import AuthLayout from '@/components/AuthLayout';
import { FormInput } from '@/components/FormInput';
import { loginSchema, LoginValues } from '@/lib/validations/auth';
import { useLogin } from '@/hooks/useAuth';

export default function Login() {
  const { mutate: login } = useLogin();
  const [rememberMe, setRememberMe] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = (data: LoginValues) => {
    login(data);
  };

  return (
    <AuthLayout
      title="Sign In"
      subtitle="Enter your email and password to access your account."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormInput
          label="Email address"
          placeholder="Email address"
          required
          {...register('email')}
          error={errors.email?.message}
        />

        <FormInput
          label="Password"
          type="password"
          placeholder="••••••"
          required
          {...register('password')}
          error={errors.password?.message}
        />

        {/* Remember me */}
        <div className="flex items-center">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded accent-yellow-500 border-slate-300"
            />
            <span className="text-sm text-slate-600 font-medium">Remember me</span>
          </label>
        </div>

        <Button
          type="submit"
          className="w-full bg-[#8B6914] hover:bg-[#6F520F] text-white h-12 rounded-xl text-base font-semibold mt-2"
        >
          Login
        </Button>
      </form>
    </AuthLayout>
  );
}