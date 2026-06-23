import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    dashboardService,
    DashboardStatsPayload,
    TransactionHistoryPayload,
    KycListPayload,
    KycActionPayload,
    KycDeclinePayload,
} from '@/lib/api/dashboardService';

export const useDashboardStats = (payload: DashboardStatsPayload) => {
    return useQuery({
        queryKey: ['dashboardStats', payload],
        queryFn: () => dashboardService.getDashboardStats(payload),
    });
};

export const useTransactionHistory = (payload: TransactionHistoryPayload) => {
    return useQuery({
        queryKey: ['transactionHistory', payload],
        queryFn: () => dashboardService.getTransactionHistory(payload),
    });
};

export const useKycList = (payload: KycListPayload) => {
    return useQuery({
        queryKey: ['kycList', payload],
        queryFn: () => dashboardService.getKycList(payload),
    });
};

export const useApproveKyc = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: KycActionPayload) => dashboardService.approveKyc(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['kycList'] });
        },
    });
};

export const useDeclineKyc = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: KycDeclinePayload) => dashboardService.declineKyc(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['kycList'] });
        },
    });
};