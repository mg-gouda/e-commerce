import { UserRole } from '../../entities/user.entity';
export declare class UpdateUserDto {
    name?: string;
    email?: string;
    password?: string;
}
export declare class UpdateUserProfileDto {
    name?: string;
    password?: string;
}
export declare class AdminUpdateUserDto extends UpdateUserDto {
    role?: UserRole;
    status?: string;
}
