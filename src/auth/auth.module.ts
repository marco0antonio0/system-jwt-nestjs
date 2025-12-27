import { AuthController } from './auth.controller';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UserRepository } from './auth.repositories';
import * as dotenv from 'dotenv';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseModule } from 'src/database/database.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { UserModel } from './models/user.model';
import { JwtStrategy } from './jwt/jwt.strategy';
// Permissoes removed
dotenv.config();

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET') || 'default_secret',
        signOptions: { expiresIn: '24h' },
      }),
    }),
    DatabaseModule,
    SequelizeModule.forFeature([UserModel])
  ],
  controllers: [AuthController],
  providers: [AuthService, UserRepository, JwtStrategy],
  exports: [AuthService, UserRepository],
})
export class AuthModule { }