import { TeeLogService, TeeLogQuery, PageQuery, TeeLog } from "@elizaos/plugin-tee-log";
import { IAgentRuntime, Service, ServiceType } from "@elizaos/core";

// Constants
const DEFAULT_ORDER = 'asc' as const;
const MIN_PAGE = 1;
const MIN_PAGE_SIZE = 1;
const MAX_PAGE_SIZE = 100;

export type OrderDirection = 'asc' | 'desc';

export interface OrderedTeeLogQuery extends TeeLogQuery {
    orderBy?: OrderDirection;
    cursorTimestamp?: number;
}

export interface CursorMetadata {
    prev?: number;
    next?: number;
}

export interface PageQueryWithCursor<T> extends PageQuery<T> {
    cursor: CursorMetadata;
}

export interface IEnhancedTeeLogService {
    getOrderedLogs(query: OrderedTeeLogQuery, page: number, pageSize: number): Promise<PageQueryWithCursor<TeeLog[]>>;
}

export class ValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ValidationError';
    }
}

export function isValidOrderedTeeLogQuery(query: unknown): query is OrderedTeeLogQuery {
    if (!query || typeof query !== 'object') return false;

    const typedQuery = query as OrderedTeeLogQuery;
    if (typedQuery.orderBy && !['asc', 'desc'].includes(typedQuery.orderBy)) return false;
    if (typedQuery.cursorTimestamp && typeof typedQuery.cursorTimestamp !== 'number') return false;

    return true;
}

/**
 * Enhanced logging service that provides ordered and cursor-based pagination
 * for TEE logs while maintaining compatibility with the base service.
 */
export class EnhancedTeeLogService extends Service implements IEnhancedTeeLogService {
    private cache = new Map<string, PageQueryWithCursor<TeeLog[]>>();
    private readonly cacheTTL = 5000; // 5 seconds
    private teeLogService?: TeeLogService;

    static get serviceType(): ServiceType {
        return ServiceType.TEE_LOG_ENHANCED;
    }

    getInstance(): EnhancedTeeLogService {
        return this;
    }

    async initialize(runtime: IAgentRuntime): Promise<void> {
        this.teeLogService = runtime.getService<TeeLogService>(ServiceType.TEE_LOG).getInstance();
        await this.teeLogService.initialize(runtime);
    }

    /**
     * Retrieves ordered logs with cursor-based pagination
     * @param query - The query parameters including ordering and cursor
     * @param page - The page number (1-based)
     * @param pageSize - Number of items per page
     * @returns PageQuery containing ordered logs and cursor metadata
     * @throws ValidationError if invalid parameters
     * @throws Error if fetch fails
     */
    async getOrderedLogs(
        query: OrderedTeeLogQuery,
        page: number,
        pageSize: number
    ): Promise<PageQueryWithCursor<TeeLog[]>> {
        // Input validation
        this.validateInput(query, page, pageSize);

        // Check cache
        const cacheKey = this.getCacheKey(query, page, pageSize);
        const cached = this.cache.get(cacheKey);
        if (cached) return cached;

        try {
            const result = await this.fetchOrderedLogs(query, page, pageSize);
            this.cache.set(cacheKey, result);
            setTimeout(() => this.cache.delete(cacheKey), this.cacheTTL);
            return result;
        } catch (error) {
            console.error('Failed to fetch ordered logs:', error);
            throw new Error('Failed to fetch logs');
        }
    }

    private validateInput(query: OrderedTeeLogQuery, page: number, pageSize: number): void {
        if (!isValidOrderedTeeLogQuery(query)) {
            throw new ValidationError('Invalid query parameters');
        }

        if (page < MIN_PAGE) {
            throw new ValidationError(`Page must be greater than or equal to ${MIN_PAGE}`);
        }

        if (pageSize < MIN_PAGE_SIZE || pageSize > MAX_PAGE_SIZE) {
            throw new ValidationError(`Page size must be between ${MIN_PAGE_SIZE} and ${MAX_PAGE_SIZE}`);
        }

        if (query.cursorTimestamp && isNaN(query.cursorTimestamp)) {
            throw new ValidationError('Invalid cursor timestamp');
        }
    }

    private async fetchOrderedLogs(
        query: OrderedTeeLogQuery,
        page: number,
        pageSize: number
    ): Promise<PageQueryWithCursor<TeeLog[]>> {
        type TimestampKey = 'startTimestamp' | 'endTimestamp';
        const timestampKey: TimestampKey = query.orderBy === 'desc' ? 'endTimestamp' : 'startTimestamp';

        const baseQuery: TeeLogQuery = {
            ...query,
            ...(query.cursorTimestamp && {
                [timestampKey]: query.cursorTimestamp
            })
        };

        const result = await this.teeLogService?.getLogs(baseQuery, page, pageSize);
        const orderedData = query.orderBy === "desc"
            ? this.reverseLogOrder(result)
            : result;

        return this.addCursorMetadata(orderedData);
    }

    private getCacheKey(query: OrderedTeeLogQuery, page: number, pageSize: number): string {
        return JSON.stringify({ query, page, pageSize });
    }

    private reverseLogOrder(result: PageQuery<TeeLog[]>): PageQuery<TeeLog[]> {
        return {
            ...result,
            data: result.data ? [...result.data].reverse() : []
        };
    }

    private addCursorMetadata(result: PageQuery<TeeLog[]>): PageQueryWithCursor<TeeLog[]> {
        if (!result.data?.length) {
            return {
                ...result,
                cursor: { prev: undefined, next: undefined }
            };
        }

        return {
            ...result,
            cursor: {
                prev: result.data[0]?.timestamp,
                next: result.data[result.data.length - 1]?.timestamp
            }
        };
    }
}