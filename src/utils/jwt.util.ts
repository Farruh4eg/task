import jwt, {SignOptions} from 'jsonwebtoken';
import config from "../config";

interface JwtPayload {
    userId: number;
    roleId: number;
    statusId: number;
}

export function generateTokens(payload: JwtPayload): { accessToken: string; refreshToken: string } {
    const accessSecret = config.jwt.access.secret;
    const accessExpiresIn = config.jwt.access.expiresIn;

    const refreshSecret = config.jwt.refresh.secret;
    const refreshExpiresIn = config.jwt.refresh.expiresIn;

    const accessToken = jwt.sign(
        payload,
        accessSecret,
        {
            expiresIn: accessExpiresIn,
        } as SignOptions);

    const refreshToken = jwt.sign(
        payload,
        refreshSecret,
        {
            expiresIn: refreshExpiresIn,
        } as SignOptions
    )

    return {
        accessToken,
        refreshToken,
    }
}