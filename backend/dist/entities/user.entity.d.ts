export declare enum UserRole {
    CUSTOMER = "customer",
    ADMIN = "admin",
    VENDOR = "vendor"
}
export declare class User {
    id: string;
    name: string;
    email: string;
    password_hash: string;
    role: UserRole;
    reset_token: string;
    reset_token_expires: Date;
    created_at: Date;
    updated_at: Date;
}
