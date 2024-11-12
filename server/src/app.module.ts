import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SignalingServerModule } from './signaling-server/signaling-server.module';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from '../winston.config';
import { StudyRoomModule } from './study-room/study-room.module';
import { ChattingServerModule } from './chatting-server/chatting-server.module';

@Module({
  imports: [SignalingServerModule, WinstonModule.forRoot(winstonConfig), StudyRoomModule, ChattingServerModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }

/*
# 프로젝트 생성
$ nest new chat-project
# events 모듈 생성
$ nest g mo events
# events 게이트웨이 생성
$ nest g ga signaling-server
*/
