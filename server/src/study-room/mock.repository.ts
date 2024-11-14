import { Injectable } from '@nestjs/common';
import { StudyRoom } from './study-room.entity';

@Injectable()
export class MockStudyRoomRepository {
  private rooms: Map<string, StudyRoom> = new Map();

  createRoom(roomId: string, clientId: string): StudyRoom {
    const newRoom = new StudyRoom(roomId, clientId);
    this.rooms.set(roomId, newRoom);
    return newRoom;
  }

  findRoom(roomId: string): StudyRoom | undefined {
    return this.rooms.get(roomId);
  }

  addUserToRoom(roomId: string, clientId: string) {
    const room = this.rooms.get(roomId);
    if (!room) {
      this.createRoom(roomId, clientId);
    }
    this.rooms.get(roomId)?.users.push(clientId);
  }

  removeUserFromRoom(roomId: string, clientId: string) {
    const room = this.rooms.get(roomId);
    if (room) {
      room.users = room.users.filter((id) => id !== clientId);
    }
  }

  getRoomUsers(roomId: string): string[] {
    return this.rooms.get(roomId)?.users || [];
  }

  leaveAllRooms(clientId: string) {
    this.rooms.forEach((room) => {
      room.users = room.users.filter((id) => id !== clientId);
    });
  }

  getAllRooms(): Record<string, string[]> {
    const allRooms: Record<string, string[]> = {};

    this.rooms.forEach((room, roomId) => {
      allRooms[roomId] = room.users;
    });

    return allRooms;
  }
}
