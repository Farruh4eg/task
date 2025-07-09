import request from 'supertest';
import app from '../src/app';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Auth Endpoints', () => {
    let server: any;

    beforeAll(async () => {
        server = app.listen();
        await prisma.user.deleteMany({});
    });

    afterAll(async () => {
        await prisma.user.deleteMany({});
        await prisma.$disconnect();
        if (server) {
            server.close();
        }
    });

    const testUser = {
        email: 'testuser@example.com',
        password: 'Password123!',
        first_name: "Test First Name",
        last_name: "Test Last Name",
        birth_date: new Date().toISOString()
    };
    
    let authToken = '';
    let refreshToken = '';

    describe('POST /api/auth/register', () => {
        it('should register a new user successfully', async () => {
            const response = await request(server)
                .post('/api/auth/register')
                .send(testUser);
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('id');
            expect(response.body.email).toBe(testUser.email);
            expect(response.body.first_name).toBe(testUser.first_name);
        });

        it('should fail to register a user with an existing email', async () => {
            const response = await request(server)
                .post('/api/auth/register')
                .send(testUser);
            expect(response.status).toBe(409);
            expect(response.body).toHaveProperty('message');
        });

        it('should fail to register a user with invalid data (missing email)', async () => {
            const { email, ...userWithoutEmail } = testUser;
            const response = await request(server)
                .post('/api/auth/register')
                .send(userWithoutEmail);
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('message');
        });
        it('should fail to register a user with invalid data (missing password)', async () => {
            const { password, ...userWithoutPassword } = testUser;
            const response = await request(server)
                .post('/api/auth/register')
                .send(userWithoutPassword);
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('message');
        });
        it('should fail to register a user with invalid data (missing name)', async () => {
            const { first_name, ...userWithoutName } = testUser;
            const response = await request(server)
                .post('/api/auth/register')
                .send(userWithoutName);
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('message');
        });
    });

    describe('POST /api/auth/login', () => {
        beforeAll(async () => {
            await prisma.user.deleteMany({});
            await request(server).post('/api/auth/register').send(testUser);
        });

        it('should login an existing user successfully', async () => {
            const response = await request(server)
                .post('/api/auth/login')
                .send({
                    email: testUser.email,
                    password: testUser.password,
                });
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('user');
            expect(response.body.user.email).toBe(testUser.email);
            expect(response.body).toHaveProperty('accessToken');
            expect(response.body).toHaveProperty('refreshToken');
            authToken = response.body.accessToken;
            refreshToken = response.body.refreshToken;
        });

        it('should fail to login with incorrect password', async () => {
            const response = await request(server)
                .post('/api/auth/login')
                .send({
                    email: testUser.email,
                    password: 'WrongPassword123!',
                });
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('message');
        });

        it('should fail to login with a non-existent email', async () => {
            const response = await request(server)
                .post('/api/auth/login')
                .send({
                    email: 'nonexistent@example.com',
                    password: testUser.password,
                });
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('message');
        });
    });
});
