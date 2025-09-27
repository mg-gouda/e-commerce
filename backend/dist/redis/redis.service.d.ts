import { OnModuleDestroy } from '@nestjs/common';
import { RedisClientType } from 'redis';
export declare class RedisService implements OnModuleDestroy {
    private client;
    constructor();
    onModuleDestroy(): Promise<void>;
    getClient(): RedisClientType;
    get(key: string): Promise<string | null>;
    set(key: string, value: string, ttl?: number): Promise<void>;
    del(key: string): Promise<void>;
    exists(key: string): Promise<boolean>;
    expire(key: string, ttl: number): Promise<void>;
}
