import { Test, TestingModule } from '@nestjs/testing';
import { SfuServerGateway } from './sfu-server.gateway';

describe('SfuServerGateway', () => {
  let gateway: SfuServerGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SfuServerGateway],
    }).compile();

    gateway = module.get<SfuServerGateway>(SfuServerGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
