import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SignalingServerModule } from './signaling-server/signaling-server.module';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from '../winston.config';
import { StudyRoomModule } from './study-room/study-room.module';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }), // TypeORM 설정
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DATABASE_LOCAL_HOST'),
        port: parseInt(configService.get('DATABASE_LOCAL_PORT'), 10),
        username: configService.get('DATABASE_LOCAL_USER'),
        password: configService.get('DATABASE_LOCAL_PASSWORD'),
        database: configService.get('DATABASE_LOCAL_NAME'),
        entities: [__dirname + '/**/*.entity.{js,ts}'],
        synchronize: true, // 배포 시 false로 변경
      }),
      inject: [ConfigService],
    }),
    SignalingServerModule,
    WinstonModule.forRoot(winstonConfig),
    StudyRoomModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
