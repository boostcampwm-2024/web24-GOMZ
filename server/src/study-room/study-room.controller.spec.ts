import { Test, TestingModule } from '@nestjs/testing';
import { StudyRoomController } from './study-room.controller';

describe('StudyRoomController', () => {
  let controller: StudyRoomController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StudyRoomController],
    }).compile();

    controller = module.get<StudyRoomController>(StudyRoomController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
