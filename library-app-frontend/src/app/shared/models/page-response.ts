export interface PageResponse<T> {
    content: T[];
    page: {
        totalElements: number;
        totalPages?: number;
        size?: number;
        number?: number;
    };
}

export function emptyPageResponse<T>(): PageResponse<T> {
    return {
        content: [],
        page: {
            totalElements: 0
        }
    };
}
