import { AppErrorCode } from './enums';

export type ServiceResponse<T> = {
    success: boolean;
    data?: T;
    error?: string;
    errorCode?: AppErrorCode;
};