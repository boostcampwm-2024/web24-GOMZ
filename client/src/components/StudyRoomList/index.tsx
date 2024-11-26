import { useEffect, useState } from 'react';

import StudyRoomHeader from '@components/StudyRoomList/Header';
import AddItemCard from '@components/StudyRoomList/AddItemCard';
import ItemCard from '@components/StudyRoomList/ItemCard';
import Pagination from '@components/StudyRoomList/Pagination';
import AddItemModal from '@components/StudyRoomList/AddItemModal';
import JoinRoomModal from '@components/StudyRoomList/JoinRoomModal';

interface Room {
  roomId: string;
  roomName: string;
  categoryName: string;
  isPrivate: boolean;
  curParticipant: number;
  maxParticipant: number;
}

const API_BASE_URL = import.meta.env.DEV ? 'api' : import.meta.env.VITE_SIGNALING_SERVER_URL;

const StudyRoomList = () => {
  const [isJoinRoomModalOpen, setIsJoinRoomModalOpen] = useState(false);
  const [isAddRoomModalOpen, setIsAddRoomModalOpen] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [currentRoom, setCurrentRoom] = useState<Partial<Room>>();

  const totalStudyTime =
    Number(localStorage.getItem('totalStudyTime')) + Number(localStorage.getItem('studyTime'));
  localStorage.setItem('studyTime', '0');
  localStorage.setItem('totalStudyTime', totalStudyTime.toString());

  useEffect(() => {
    const fetchRooms = async () => {
      const response = await fetch(`${API_BASE_URL}/study-room/rooms`);
      const room = await response.json();
      setRooms(room);
    };

    fetchRooms();
  }, []);

  return (
    <div className="flex h-screen w-screen flex-col items-center">
      <div className="flex h-[56.25rem] w-[90rem] flex-col items-center gap-8">
        <StudyRoomHeader className="mt-1" />
        <div className="flex h-[41.25rem] flex-col gap-3">
          <AddItemCard openModal={() => setIsAddRoomModalOpen(true)} />
          {rooms
            .slice(0, 5)
            .map(
              ({ roomId, roomName, categoryName, isPrivate, curParticipant, maxParticipant }) => (
                <ItemCard
                  key={roomId}
                  roomId={roomId}
                  roomName={roomName}
                  categoryName={categoryName}
                  curParticipant={curParticipant}
                  maxParticipant={maxParticipant}
                  isPrivate={isPrivate}
                  openModal={() => {
                    setCurrentRoom({
                      roomId,
                      roomName,
                      maxParticipant,
                    });
                    setIsJoinRoomModalOpen(true);
                  }}
                />
              ),
            )}
        </div>
        <Pagination />
      </div>
      {isJoinRoomModalOpen && (
        <div
          className="absolute inset-0 flex items-center justify-center backdrop-blur-sm"
          onClick={({ target, currentTarget }) =>
            target === currentTarget && setIsJoinRoomModalOpen(false)
          }
        >
          <JoinRoomModal
            currentRoom={currentRoom!}
            closeModal={() => setIsJoinRoomModalOpen(false)}
          />
        </div>
      )}
      {isAddRoomModalOpen && (
        <div
          className="absolute inset-0 flex items-center justify-center backdrop-blur-sm"
          onClick={({ target, currentTarget }) =>
            target === currentTarget && setIsAddRoomModalOpen(false)
          }
        >
          <AddItemModal closeModal={() => setIsAddRoomModalOpen(false)} />
        </div>
      )}
    </div>
  );
};

export default StudyRoomList;
