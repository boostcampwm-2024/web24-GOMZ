import { Test, TestingModule } from '@nestjs/testing';
import { SignalingServerGateway } from './signaling-server.gateway';

describe('SignalingServerGateway', () => {
  let gateway: SignalingServerGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SignalingServerGateway],
    }).compile();

    gateway = module.get<SignalingServerGateway>(SignalingServerGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
