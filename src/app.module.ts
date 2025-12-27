import { Module } from '@nestjs/common';
import { AppController } from './health.controller';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    DatabaseModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule { }
