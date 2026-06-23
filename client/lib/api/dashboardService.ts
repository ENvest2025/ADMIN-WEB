import { apiClient } from './client';

export interface DashboardStatsPayload {
    year: number;
    month?: string;
    day?: string;
}

export interface UserRegistrationStatus {
    labels: string[];
    values: number[];
    year: number;
    total_in_year: number;
    is_filtered: boolean;
    filtered_month: string | null;
}

export interface DashboardData {
    "Total Users": number;
    "Completed KYC": number;
    "Pending KYC": number;
    "Available Products": number;
    "Recent Transactions": number;
    "User Registration Status": UserRegistrationStatus;
    "TotalRegistrations": number;
    "DisplayedYear": number;
    "FilteredByMonth": string | null;
    "FilteredByDay": string | null;
}

export interface DashboardResponse {
    code: number;
    status: boolean;
    message: string;
    data: DashboardData;
}

// Transaction History Types
export interface TransactionHistoryPayload {
    email?: string;
    tnx_type?: string;
    status?: string;
    limit?: number;
    page?: number;
    start_date?: string;
    end_date?: string;
}

export interface Transaction {
    id: number;
    tnx_id: string;
    tnx_descript: string;
    tnx_type: string;
    email: string;
    fname: string;
    lname: string;
    full_name: string;
    clientID: string;
    amount: string;
    status: number;
    created: string;
    paid_to: string;
    currency: string;
    method: string;
    payment_type: string;
    access_code: string;
    authorization_url: string;
}

export interface Pagination {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
}

export interface TransactionHistoryResponse {
    code: number;
    status: boolean;
    message: string;
    data: {
        transactions: Transaction[];
        pagination: Pagination;
        filters_applied: {
            email: string;
            start_date: string;
            end_date: string;
            status: string;
            tnx_type: string;
        };
    };
}

// Pagination Interface
export interface StandardPagination {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
}

// Fetch Clients Types
export interface FetchClientsPayload {
    limit?: number;
    page?: number;
    start_date?: string;
    end_date?: string;
}

export interface Client {
    name: string;
    email: string;
    clientID: string;
    phone: string;
    status: string;
    last_login: string;
}

export interface FetchClientsResponse {
    code: number;
    status: boolean;
    message: string;
    data: {
        users: Client[];
        total: number;
        page: number;
        limit: number;
        total_pages: number;
    };
}

// Fetch Single Client Types
export interface FetchSingleClientPayload {
    id: string;
}

export interface ClientBasicInfo {
    full_name: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    clientID: string;
    date_joined: string;
    last_login: string;
    account_status: string;
}

export interface ClientIdentityVerification {
    nin: string;
    bvn: string;
    banks: {
        accountName: string;
        accountNumber: string;
        bankName: string;
    }[];
    bvn_verified: boolean;
    nin_verified: boolean;
}

export interface ClientPersonalDetails {
    id: number;
    email: string;
    clientID: string;
    nok_fname: string;
    nok_lname: string;
    nok_phone: string;
    mom_maiden: string;
    address: string;
    state_residence: string;
    state_origin: string;
    lga_origin: string;
}

export interface ClientInvestmentProfile {
    investment_goals: string;
    long_term_holding: string;
    risk_tolerance: string;
    experience: string;
    source_of_wealth: string;
    liquid: string;
    yearly_income: string;
    net_worth: string;
    affiliate: string;
    job: string;
}

export interface FetchSingleClientResponse {
    code: number;
    status: boolean;
    message: string;
    data: {
        basic_info: ClientBasicInfo;
        identity_verification: ClientIdentityVerification;
        personal_details: ClientPersonalDetails;
        investment_profile: ClientInvestmentProfile;
    };
}

// KYC List Types
export interface KycListPayload {
    email?: string;
    tnx_type?: string;
    status?: string;
    limit?: number;
    page?: number;
    start_date?: string;
    end_date?: string;
}

export interface KycUser {
    ID: string;
    NAME: string;
    email: string;
    progress: string;
    status: string;
    lastupdated: string;
}

export interface KycListResponse {
    code: number;
    status: boolean;
    message: string;
    data: {
        users: KycUser[];
        pagination: Pagination;
    };
}

// KYC Approve / Decline Types
export interface KycActionPayload {
    id: string;
}

export interface KycDeclinePayload {
    id: string;
    reason: string;
}

export interface KycActionResponse {
    code: number;
    status: boolean;
    message: string;
}

// Portfolio Stats Types
export interface PortfolioStatsResponse {
    code: number;
    status: boolean;
    message: string;
    data: {
        total_port_value: {
            currency: string;
            total: string;
        }[];
        number_active_port: number;
        total_returns_generated: any[];
        port_pending_actions: number;
        Investment_products_by_performance: {
            product_name: string;
            currency: string;
            average_roi: string;
        }[];
        Investment_products_by_volume: {
            product_name: string;
            currency: string;
            volume: string;
        }[];
    };
}

// All User Portfolios Types
export interface AllUserPortfoliosPayload {
    search?: string;
    status?: 'pending' | 'active' | 'matured' | 'liquidated' | 'cancelled';
    currency?: 'NGN' | 'USD';
    start: number;
    length: number;
    order_column: string;
    order_dir: 'ASC' | 'DESC';
}

export interface UserPortfolioItem {
    userID: string;
    full_name: string;
    email: string;
    created: string;
    total_investments: number;
    total_value_ngn: string;
    total_value_usd: string;
    avg_roi: string | null;
}

export interface AllUserPortfoliosResponse {
    code: number;
    status: boolean;
    message: string;
    data: UserPortfolioItem[];
}

// Single User Portfolio Types
export interface SingleUserPortfolioPayload {
    userID: string;
}

export interface SingleUserPortfolioResponse {
    code: number;
    status: boolean;
    message: string;
    data: {
        profile: {
            id: number;
            email: string;
            phone: string;
            fname: string;
            lname: string;
            clientID: string;
            kyc_level: string;
        };
        transaction_history: {
            id: number;
            tnx_id: string;
            date: string;
            type: string;
            amount: string;
            currency: string;
        }[];
        investment_breakdown: {
            investment_id: number;
            product_name: string;
            amount_paid: number;
            current_value: number;
            roi_percentage: string;
            maturity_date: string;
            status: string;
            currency: string;
        }[];
    };
}

export const dashboardService = {
    getDashboardStats: async (payload: DashboardStatsPayload) => {
        try {
            const response = await apiClient<DashboardResponse>('POST', 'dashboard_stats', payload);
            return response;
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            throw error;
        }
    },

    getTransactionHistory: async (payload: TransactionHistoryPayload) => {
        try {
            const response = await apiClient<TransactionHistoryResponse>('POST', 'tranxHist', payload);
            return response;
        } catch (error) {
            console.error('Error fetching transaction history:', error);
            throw error;
        }
    },

    getKycList: async (payload: KycListPayload) => {
        try {
            const response = await apiClient<KycListResponse>('POST', 'kycLists', payload);
            return response;
        } catch (error) {
            console.error('Error fetching KYC list:', error);
            throw error;
        }
    },

    approveKyc: async (payload: KycActionPayload) => {
        try {
            const response = await apiClient<KycActionResponse>('POST', 'approveKyc', payload);
            return response;
        } catch (error) {
            console.error('Error approving KYC:', error);
            throw error;
        }
    },

    declineKyc: async (payload: KycDeclinePayload) => {
        try {
            const response = await apiClient<KycActionResponse>('POST', 'declineKyc', payload);
            return response;
        } catch (error) {
            console.error('Error declining KYC:', error);
            throw error;
        }
    },

    fetchClients: async (payload: FetchClientsPayload) => {
        try {
            const response = await apiClient<FetchClientsResponse>('POST', 'fetchClients', payload);
            return response;
        } catch (error) {
            console.error('Error fetching clients:', error);
            throw error;
        }
    },

    fetchSingleClient: async (payload: FetchSingleClientPayload) => {
        try {
            const response = await apiClient<FetchSingleClientResponse>('POST', 'fetchSingleClient', payload);
            return response;
        } catch (error) {
            console.error('Error fetching single client:', error);
            throw error;
        }
    },

    getPortfolioStats: async () => {
        try {
            const response = await apiClient<PortfolioStatsResponse>('POST', 'portfolioStats', {});
            return response;
        } catch (error) {
            console.error('Error fetching portfolio stats:', error);
            throw error;
        }
    },

    getAllUserPortfolios: async (payload: AllUserPortfoliosPayload) => {
        try {
            const response = await apiClient<AllUserPortfoliosResponse[]>('POST', 'allUserPortfolios', payload);
            return response as unknown as AllUserPortfoliosResponse;
        } catch (error) {
            console.error('Error fetching all user portfolios:', error);
            throw error;
        }
    },

    getSingleUserPortfolio: async (payload: SingleUserPortfolioPayload) => {
        try {
            const response = await apiClient<SingleUserPortfolioResponse[]>('POST', 'singleUserPortfolio', payload);
            return response as unknown as SingleUserPortfolioResponse;
        } catch (error) {
            console.error('Error fetching single user portfolio:', error);
            throw error;
        }
    },
};