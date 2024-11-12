import { Injectable } from '@nestjs/common';
import { MockStudyRoomRepository } from './mock.repository';

@Injectable()
export class StudyRoomsService {
    constructor(private readonly roomRepository: MockStudyRoomRepository) { }

    addUserToRoom(room: string, clientId: string) {
        this.roomRepository.addUserToRoom(room, clientId);
    }

    removeUserFromRoom(room: string, clientId: string) {
        this.roomRepository.removeUserFromRoom(room, clientId);
    }

    getRoomUsers(room: string): string[] {
        return this.roomRepository.getRoomUsers(room);
    }

    leaveAllRooms(clientId: string) {
        this.roomRepository.leaveAllRooms(clientId);
    }
}
