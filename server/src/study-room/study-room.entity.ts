export class StudyRoom {
    roomId: string;
    users: string[];

    constructor(roomId: string) {
        this.roomId = roomId;
        this.users = [];
    }
}
