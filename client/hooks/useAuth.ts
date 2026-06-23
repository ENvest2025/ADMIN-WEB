import { useMutation } from '@tanstack/react-query';
import { authService } from '@/lib/api/authService';
import { useAuthStore } from '@/stores/authStore';
import { useNavigate } from 'react-router-dom';

export function useLogin() {
    const { setUser } = useAuthStore();
    const navigate = useNavigate();

    return useMutation({
        mutationFn: authService.login,
        onSuccess: (user) => {
            setUser(user);
            navigate('/dashboard');
        },
    });
}

export function useSignUp() {
    const navigate = useNavigate();

    return useMutation({
        mutationFn: authService.signUp,
        onSuccess: () => {
            navigate('/verify-email');
        },
    });
}

export function useVerifyOtp() {
    const navigate = useNavigate();

    return useMutation({
        mutationFn: authService.verifyOtp,
        onSuccess: () => {
            navigate('/complete-profile');
        },
    });
}

export function useCompleteProfile() {
    const { setUser } = useAuthStore();
    const navigate = useNavigate();

    return useMutation({
        mutationFn: authService.completeProfile,
        onSuccess: (user) => {
            setUser(user);
            navigate('/dashboard');
        },
    });
}
