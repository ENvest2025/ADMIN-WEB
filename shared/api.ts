/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

export interface Investment {
    investment_id: number;
    transaction_id: string;
    client_id: number;
    userID: string;
    full_name: string;
    fname: string;
    lname: string;
    email: string;
    phone: string;
    product_type: string;
    product_name: string;
    currency: string;
    amount_paid: string;
    roi_percentage: string;
    total_expected_return: string;
    daily_interest: string;
    monthly_interest: string;
    yearly_interest: string;
    start_date: string;
    maturity_date: string;
    duration_days: number;
    due_date: string;
    liquidation_date: string | null;
    liquidation_reason: string | null;
    liquidated_amount: string | null;
    status: string;
    created_at: string;
    updated_at: string;
}

export interface PullInvestmentsRequest {
    type: string;
    search?: string;
    status?: string;
    currency?: string;
    start: number;
    length: number;
    order_column: string;
    order_dir: 'ASC' | 'DESC';
}

export interface PullInvestmentsResponse {
    code: number;
    status: boolean;
    message: string;
    data: Investment[];
}

export interface ChangeInvestmentStatusRequest {
    tnx_id: string;
    newstatus: string;
}

export interface GenericResponse {
    code: number;
    status: boolean;
    message: string;
    data?: any;
}

export type InvestmentRequestType = 'liquidate' | 'rollover';
export type InvestmentRequestAdminStatus = 'pending' | 'approved' | 'rejected';

export interface InvestmentRequest {
    request_id: number;
    transactionTable_id: number;
    client_id: number;
    trnx_id: string;
    amount_invested: string;
    current_amount: string;
    accrued_interest: string;
    product_id: number;
    request: InvestmentRequestType | string;
    adminStatus: InvestmentRequestAdminStatus | string;
    adminresponse: number;
    request_date: string;
    investment_status: string;
    product_name: string;
    currency: string;
    roi_percentage: string;
    investment_start_date: string;
    due_date: string;
    liquidation_date: string | null;
    client_email: string;
    client_fname: string;
    client_lname: string;
    client_account_id: number;
}

export interface ViewAllRequestsParams {
    limit?: number;
    offset?: number;
    request?: InvestmentRequestType | string;
    adminStatus?: InvestmentRequestAdminStatus | string;
    search?: string;
}

export interface ViewAllRequestsResponse {
    code: number;
    status: boolean;
    message: string;
    data: {
        total: number;
        limit: number;
        offset: number;
        requests: InvestmentRequest[];
    };
}

export interface TakeActionOnRequestPayload {
    request_id: number;
    action: 'approve' | 'reject';
    rollover_days?: number;
}

// ─── Learn / Newsletter Articles ──────────────────────────────────────────────
// Backed by the admin newsLetter endpoints (addnewsLetter / editnewsLetter /
// fetchAllNews). The backend currently persists only `title` and `content`;
// image/views/date fields are read defensively from the response when present.
export interface LearnArticle {
    id: number;
    title: string;
    content: string;
    image?: string | null;
    views?: number;
    // Date published can arrive under different keys depending on the backend.
    created?: string;
    created_at?: string;
    date_published?: string;
    date?: string;
}

export interface FetchAllNewsPayload {
    // "" (or omitted) returns all articles; a specific id returns one.
    id?: string | number;
}

export interface NewsPagination {
    current_page: number;
    per_page: number;
    total_records: number;
    total_pages: number;
}

export interface FetchAllNewsResponse {
    code: number;
    status: boolean;
    message: string;
    data: {
        news: LearnArticle[];
        pagination: NewsPagination;
    };
}

export interface AddNewsLetterPayload {
    title: string;
    content: string;
}

export interface EditNewsLetterPayload {
    id: number;
    title: string;
    content: string;
}

export interface DeleteNewsLetterPayload {
    id: number;
}

// ─── Withdrawal Requests ──────────────────────────────────────────────────────
export interface WithdrawalDetails {
    names: string;
    bankName: string;
    accountNumber: string;
    accountName: string;
    amount: number;
    transactionFee: number;
    totalAmount: number;
    duration: string;
    currency: string;
    tnxId: string;
}

// status: 0 = pending, 1 = approved, 2 = failed, 4 = cancelled
export interface WithdrawalRequest {
    id: number;
    email: string;
    amount: string;
    tnxId: string;
    created: string;
    status: number;
    currency: string;
    status_message: string;
    withdrawal_details: WithdrawalDetails;
}

export interface FetchAllWithdrawalsResponse {
    code: number;
    status: boolean;
    message: string;
    data: WithdrawalRequest[];
}

// 1 = approve (sends money), 2 = fail, 4 = cancel
export type WithdrawalStatusAction = 1 | 2 | 4;

export interface UpdateWithdrawalStatusPayload {
    tnxId: string;
    status: WithdrawalStatusAction | number;
}
