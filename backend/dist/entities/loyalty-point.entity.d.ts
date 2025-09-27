import { User } from './user.entity';
export declare class LoyaltyPoint {
    id: string;
    user_id: string;
    points: number;
    user: User;
}
