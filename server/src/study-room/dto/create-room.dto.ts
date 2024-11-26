import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

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
    this.maxParticipant = 8;
    Object.freeze(this);
  }

  @IsNumber()
  readonly roomId: number;

  @IsNumber()
  readonly maxParticipant: number;
}

export class CheckAccessRequestDto {
  constructor(password: string, roomId: number) {
    this.password = password;
    this.roomId = roomId;
    Object.freeze(this);
  }

  @IsString()
  readonly password: string;

  @IsNumber()
  readonly roomId: number;
}
