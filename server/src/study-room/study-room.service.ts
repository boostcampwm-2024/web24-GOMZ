import { Injectable } from '@nestjs/common';

@Injectable()
export class StudyRoomsService {
    private rooms: { [key: string]: string[] } = {};

    addUserToRoom(room: string, clientId: string) {
        if (!this.rooms[room]) {
            this.rooms[room] = [];
        }
        this.rooms[room].push(clientId);
    }

    removeUserFromRoom(room: string, clientId: string) {
        this.rooms[room] = this.rooms[room]?.filter((id) => id !== clientId);
    }

    getRoomUsers(room: string): string[] {
        return this.rooms[room] || [];
    }

    leaveAllRooms(clientId: string) {
        Object.keys(this.rooms).forEach((room) => {
            this.rooms[room] = this.rooms[room]?.filter((id) => id !== clientId);
        });
    }
}
