import dotenv from 'dotenv';

dotenv.config();

function getEnvVariable(key: string, required: true): string;
function getEnvVariable(key: string, required?: false): string | undefined;
function getEnvVariable(key: string, required: boolean = false): string | undefined {
    const value = process.env[key];
    if (required && !value) {
        throw new Error(`FATAL ERROR: Environment variable ${key} is not defined.`);
    }
    return value;
}

const config = {
    port: getEnvVariable('PORT') || 8080,

    db: {
        url: getEnvVariable('DATABASE_URL')
    },

    jwt: {
        access: {
            secret: getEnvVariable('JWT_ACCESS_SECRET', true),
            expiresIn: getEnvVariable('JWT_ACCESS_EXPIRES_IN') || '15m',
        },
        refresh: {
            secret: getEnvVariable('JWT_REFRESH_SECRET', true),
            expiresIn: getEnvVariable('JWT_REFRESH_EXPIRES_IN') || '30d',
        },
    },
};

Object.freeze(config);

export default config;