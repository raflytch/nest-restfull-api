import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

describe('User Controller', () => {
  let app: INestApplication<App>;
  let logger: Logger;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    logger = app.get(WINSTON_MODULE_PROVIDER);
  });

  describe('POST /api/v1/users/register', () => {
    it('should be rejected request is invalid', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/users/register')
        .send({
          username: '',
          password: '',
          name: '',
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        status: 'error',
        message: 'Validation error',
      });
    });

    it('should register new user successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/users/register')
        .send({
          username: 'testuser12345',
          password: 'password12345',
          name: 'Test User',
        });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('User registered successfully');
      expect(response.body.data).toBeDefined();
      expect(response.body.data.username).toBe('testuser12345');
      expect(response.body.data.name).toBe('Test User');
      expect(response.body.data.token).toBeUndefined();
    });

    it('should reject duplicate username', async () => {
      await request(app.getHttpServer()).post('/api/v1/users/register').send({
        username: 'duplicateuser',
        password: 'password123',
        name: 'Duplicate User',
      });

      const response = await request(app.getHttpServer())
        .post('/api/v1/users/register')
        .send({
          username: 'duplicateuser',
          password: 'anotherpassword',
          name: 'Another User',
        });

      logger.info(`Response: ${JSON.stringify(response.body)}`);

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('User already exists');
    });

    it('should validate username length', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/users/register')
        .send({
          username: 'ab',
          password: 'password123',
          name: 'Test User',
        });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Validation error');
    });

    it('should validate password length', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/users/register')
        .send({
          username: 'validuser',
          password: '12345',
          name: 'Test User',
        });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Validation error');
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
