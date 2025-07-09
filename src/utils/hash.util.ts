import bcrypt from 'bcrypt'

export async function hashPassword(password: string, saltRounds: number = 14) {
    return bcrypt.hash(password, saltRounds);
}

export async function comparePassword(password: string, hash: string) {
    return bcrypt.compare(password, hash);
}

