export interface Group {
    id: string;
    name: string;
    pin_hash: string | null;
    created_at: string;
}

export interface User {
    id: string;
    name: string;
    group_id: string;
    phone_number: string;
}

export type MachineType = 'washer' | 'dryer';
export type LaundryState = 'in_use' | 'ready_to_transfer' | 'done';

export interface LaundrySession {
    id: string;
    group_id: string;
    machine: MachineType;
    user_id: string;
    state: LaundryState;
    checked_in_at: string;
    checked_out_at: string | null;
    user?: User;
}

export interface LaundryNotification {
    id: string;
    session_id: string;
    sent_at: string;
}

export interface DishReport {
    id: string;
    group_id: string;
    reported_user_id: string;
    sent_at: string;
}

export interface MachineStatus {
    machine: MachineType;
    state: 'free' | LaundryState;
    session?: LaundrySession;
    occupant?: string;
    elapsedMinutes?: number;
    lastNotification?: LaundryNotification;
}

export interface Identity {
    userId: string;
    userName: string;
    groupId: string;
}
