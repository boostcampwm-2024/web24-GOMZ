export class StudyRoom {
  roomId: string;
  users: string[];

  constructor(roomId: string, clientId: string) {
    this.roomId = roomId;
    this.users = [clientId];
  }
}
