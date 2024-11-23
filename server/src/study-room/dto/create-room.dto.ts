import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class CreateRoomRequestDto {
  constructor(roomName: string, password: string, categoryName?: string) {
    this.roomName = roomName;
    this.password = password;
    this.categoryName = categoryName;
    Object.freeze(this);
  }

  @IsString()
  @IsNotEmpty()
  readonly roomName: string;

  @IsString()
  readonly password: string;

  @IsString()
  readonly categoryName?: string;
}

export class CreateRoomResponseDto {
  constructor(roomId: number) {
    this.roomId = roomId;
    Object.freeze(this);
  }

  @IsNumber()
  readonly roomId: number;
}

export class CheckAccessRequestDto {
  constructor(password: string, roomId: string) {
    this.password = password;
    this.roomId = parseInt(roomId, 10);
    Object.freeze(this);
  }

  @IsString()
  readonly password: string;

  @IsNumber()
  readonly roomId: number;
}
