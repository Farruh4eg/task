export enum AppErrorCode {
    ServerError = 'SERVER_ERROR',

    EmailAlreadyExists = 'EMAIL_ALREADY_EXISTS',
    InvalidCredentials = 'INVALID_CREDENTIALS',
    AccountInactive = 'ACCOUNT_INACTIVE',

    UserNotFound = 'USER_NOT_FOUND',
    UserUpdateFailed = 'USER_UPDATE_FAILED',
}