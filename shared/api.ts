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

// ─── Transfers-out report (Paystack payouts) ──────────────────────────────────
export interface TransferOutRow {
    id: number;
    reference: string;
    paystack_transfer_code: string;
    sender_email: string;
    recipient_code: string;
    recipient_name: string;
    recipient_account_number: string;
    recipient_bank_code: string;
    recipient_bank_name: string;
    recipient_currency: string;
    amount: number;
    amount_formatted: string;
    currency: string;
    fee_charged: number;
    source: string;
    reason: string;
    status: string;
    otp_required: number;
    created_at: string;
    transferred_at: string | null;
}

export interface TransfersOutReportParams {
    draw?: number;
    start?: number;
    length?: number;
    order?: { column: number; dir: 'asc' | 'desc' }[];
    search?: { value: string; regex: boolean };
    status?: string;
    currency?: string;
    sender_email?: string;
    date_from?: string;
    date_to?: string;
}

export interface TransfersOutReportResponse {
    code?: number;
    status: boolean;
    message: string;
    data: {
        rows: TransferOutRow[];
        recordsTotal: number;
        recordsFiltered: number;
        draw: number;
        start: number;
        length: number;
        search: string;
    };
}

// ─── In-App Ads ───────────────────────────────────────────────────────────────
// Numeric fields are serialized as strings by the backend.
export interface InAppAd {
    id: string;
    title: string;
    media_path: string;
    media_type: 'image' | 'gif' | 'video' | string;
    mime_type: string;
    size_bytes: string;
    width: string;
    height: string;
    duration_seconds: string | null;
    is_active: string;
    sort_order: string;
    created_by: string;
    updated_by: string;
    created_at: string;
    updated_at: string;
    url: string;
}

export interface InAppAdsReportParams {
    page?: number;
    limit?: number;
}

export interface InAppAdsReportResponse {
    code: number;
    status: boolean;
    message: string;
    data: {
        items: InAppAd[];
        total: number;
        page: number;
        limit: number;
    };
}

export interface EditInAppAdPayload {
    id: number | string;
    title?: string;
    is_active?: number;
    sort_order?: number;
}

// ─── Learning (new Learn) ─────────────────────────────────────────────────────
export interface LearningEntry {
    id: string;
    topic: string;
    details: string;
    created: string;
    edited: string;
    status: string; // posted | pending
}

export interface FetchLearningParams {
    draw?: number;
    start?: number;
    length?: number;
    search?: { value: string; regex: boolean };
    status?: 'posted' | 'pending' | '';
    date_from?: string;
    date_to?: string;
    order?: { column: number; dir: 'asc' | 'desc' }[];
}

// fetchLearning returns DataTables fields at the TOP level (not nested in data).
export interface FetchLearningResponse {
    code: number;
    status: boolean;
    message: string;
    draw: number;
    recordsTotal: number;
    recordsFiltered: number;
    data: LearningEntry[];
    error?: string;
}

export interface EditLearningPayload {
    id: number | string;
    topic?: string;
    details?: string;
    status?: 'posted' | 'pending';
}

export interface CreateLearningPayload {
    topic: string;
    details: string;
    status?: 'posted' | 'pending';
}

// ─── NGX Execution Reports ────────────────────────────────────────────────────
export interface NgxOrderEvent {
    [key: string]: unknown;
}

export interface NgxOrder {
    transaction_id: string;
    client_email?: string;
    product_code?: string;
    side?: string;
    order_quantity?: number | string;
    price?: number | string;
    filled_quantity?: number | string;
    executed_total?: number | string;
    status?: string;
    exchange_order_id?: string;
    created_at?: string;
    updated_at?: string;
    can_cancel?: boolean;
    // Saved request, latest response and event history (shapes vary by order).
    request?: unknown;
    response?: unknown;
    events?: NgxOrderEvent[];
    [key: string]: unknown;
}

export interface NgxExecutionReportsParams {
    limit?: number;
    offset?: number;
    status?: string;
}

export interface NgxExecutionReportsResponse {
    code?: number;
    status: boolean;
    message: string;
    data: {
        orders: NgxOrder[];
        total?: number;
        limit?: number;
        offset?: number;
    };
}

export interface NgxActionPayload {
    action: 'check' | 'cancel';
    transaction_id: string;
}

// ─── NGX FIX Protocol Logs ────────────────────────────────────────────────────
export interface FixTagField {
    tag: string;
    name: string;
    value: string;
    meaning?: string;
}

export interface FixMessage {
    direction: 'inbound' | 'outbound' | string;
    raw: string;
    fields: FixTagField[];
}

export interface NgxFixLogEntry {
    timestamp: string;
    level: string;
    event: string;
    summary: string;
    file?: string;
    raw: string;
    fields?: Record<string, string>;
    fix_messages?: FixMessage[];
}

export interface NgxFixLogsFilters {
    date?: string | null;
    level?: string | null;
    event?: string | null;
    search?: string | null;
}

export interface NgxFixLogsParams {
    limit?: number;
    offset?: number;
    date?: string;
    level?: string;
    event?: string;
    search?: string;
}

export interface NgxFixLogsResponse {
    code?: number;
    status: boolean;
    message: string;
    data: {
        entries: NgxFixLogEntry[];
        total: number;
        limit: number;
        offset: number;
        filters?: NgxFixLogsFilters;
    };
}

// ─── Investment Products (getAllProducts) ─────────────────────────────────────
export interface ProductStock {
    product_code: string;
    product_name: string;
    short_name: string;
    image: string;
    investment_focus: string;
}

export interface ProductNote {
    product_code: string;
    product_name: string;
    short_name: string;
    category: string;
    target_audience: string;
    investment_focus: string;
    benefits: string;
    risk_level: string;
    maturity_period: string;
    min_investment: string;
    currency_symbol: string;
    description: string;
    image: string;
}

export interface GetAllProductsResponse {
    code: number;
    status: boolean;
    message: string;
    data: {
        all: Record<string, unknown>;
        stocks: ProductStock[];
        investment_notes: ProductNote[];
    };
}

// ─── Investment Notes (inv-notes CRUD) ────────────────────────────────────────
// Slim record returned by the inv-notes list endpoint.
export interface NoteListItem {
    id: number;
    product_name: string;
    investment_focus: string;
    short_name: string;
}

// Full record returned by inv-notes-single (keyed by `id`).
export interface InvestmentNoteModel {
    id: number;
    product_code: string;
    product_name: string;
    short_name?: string;
    category: string;
    target_audience: string;
    investment_focus: string;
    benefits: string;
    risk_level: string;
    maturity_period: string;
    min_investment: string;
    currency_symbol: string;
    description: string;
    status: string;
    semi_roi: string;
    annual_roi: string;
    quarterly_roi?: string;
    semi_roi_days: string;
    annual_roi_days: string;
    quarterly_roi_days?: string;
    custody_fee?: string;
    rollover?: number;
    created_at?: string;
    image?: string;
}

// inv-notes (GET) — returns a flat array of slim notes.
export interface FetchAllNotesResponse {
    code: number;
    status: boolean;
    message: string;
    data: NoteListItem[];
}

// inv-notes-single (POST { note_id }) — full note (object, sometimes array-wrapped).
export interface SingleNoteResponse {
    code: number;
    status: boolean;
    message: string;
    data: InvestmentNoteModel | InvestmentNoteModel[];
}

export interface CreateNotePayload {
    product_code: string;
    product_name: string;
    category: string;
    target_audience: string;
    investment_focus: string;
    benefits: string;
    risk_level: string;
    maturity_period: string;
    min_investment: string;
    currency_symbol: string;
    description: string;
    status: string;
    semi_roi: string;
    annual_roi: string;
    quarterly_roi: string;
    semi_roi_days: string;
    annual_roi_days: string;
    quarterly_roi_days: string;
    custody_fee?: string;
}

export interface UpdateNotePayload extends CreateNotePayload {
    note_id: number;
    rollover?: number;
}
