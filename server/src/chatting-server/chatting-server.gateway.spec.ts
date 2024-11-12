import { Test, TestingModule } from '@nestjs/testing';
import { ChattingServerGateway } from './chatting-server.gateway';

describe('ChattingServerGateway', () => {
  let gateway: ChattingServerGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChattingServerGateway],
    }).compile();

    gateway = module.get<ChattingServerGateway>(ChattingServerGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
