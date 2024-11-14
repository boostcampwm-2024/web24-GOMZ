import { Controller, Get } from '@nestjs/common';
import { generateRandomNickname } from '../util/nicknameGenerator';

@Controller('user')
export class UserController {
  @Get('/random-name')
  getRandomName(): { nickName: string } {
    // random 닉네임 호출
    const nickName = generateRandomNickname();
    return { nickName };
  }
}
