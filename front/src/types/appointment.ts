export interface Appointment {
    id: number;
    client_name: string;
    psychologist_name: string;
    date: string;
    start_time: string;
    end_time: string;
    status: string;
    status_display: string;
    payment_amount: number;
    payment_proof: string | null;
    is_first_appointment?: boolean;
    payment_detail?: {
        id: number;
        appointment: number;
        transaction_id?: string;
        payment_date?: string;
        payment_method?: string;
        created_at: string;
        updated_at: string;
    };
}