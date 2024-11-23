import { IsString, IsNotEmpty, IsObject } from 'class-validator';

export class JoinRoomDto {
  @IsString()
  @IsNotEmpty()
  roomId: string;
}

export class SendOfferDto {
  @IsObject()
  @IsNotEmpty()
  offer: RTCSessionDescriptionInit;

  @IsString()
  @IsNotEmpty()
  oldId: string;

  @IsString()
  @IsNotEmpty()
  newRandomId: string;
}

export class SendAnswerDto {
  @IsObject()
  @IsNotEmpty()
  answer: RTCSessionDescriptionInit;

  @IsString()
  @IsNotEmpty()
  newId: string;

  @IsString()
  @IsNotEmpty()
  oldRandomId: string;
}

export class SendIceCandidateDto {
  @IsString()
  @IsNotEmpty()
  targetId: string;

  @IsObject()
  @IsNotEmpty()
  candidate: RTCIceCandidateInit;
}
