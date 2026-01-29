export const HTTP_STATUS = {
    // 4xx Client Errors
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    METHOD_NOT_ALLOWED: 405,
    REQUEST_TIMEOUT: 408,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    TOO_MANY_REQUESTS: 429,

    // 5xx Server Errors
    INTERNAL_SERVER_ERROR: 500,
    NOT_IMPLEMENTED: 501,
    BAD_GATEWAY: 502,
    SERVICE_UNAVAILABLE: 503,
    GATEWAY_TIMEOUT: 504,
};

// Optional: Friendly error messages mapping
export const HTTP_ERROR_MESSAGES: Record<number, string> = {
    [HTTP_STATUS.BAD_REQUEST]: 'The request could not be understood by the server.',
    [HTTP_STATUS.UNAUTHORIZED]: 'Your session has expired. Please log in again.',
    [HTTP_STATUS.FORBIDDEN]: 'You do not have permission to access this resource.',
    [HTTP_STATUS.NOT_FOUND]: 'The requested resource was not found.',
    [HTTP_STATUS.INTERNAL_SERVER_ERROR]: 'An unexpected server error occurred. Please try again later.',
    [HTTP_STATUS.SERVICE_UNAVAILABLE]: 'The server is currently overloaded or down for maintenance.',
};