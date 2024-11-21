import { useState } from 'react';

import StudyRoomHeader from '@components/StudyRoomList/Header';
import AddItemCard from '@components/StudyRoomList/AddItemCard';
import ItemCard from '@components/StudyRoomList/ItemCard';
import Pagination from '@components/StudyRoomList/Pagination';
import AddItemModal from '@components/StudyRoomList/AddItemModal';
import JoinRoomModal from '@components/StudyRoomList/JoinRoomModal';

const StudyRoomList = () => {
  const [isJoinRoomModalOpen, setIsJoinRoomModalOpen] = useState(false);
  const [isAddRoomModalOpen, setIsAddRoomModalOpen] = useState(false);
  const [roomId, setRoomId] = useState('');

  return (
    <div className="flex h-screen w-screen flex-col items-center">
      <div className="flex h-[56.25rem] w-[90rem] flex-col items-center gap-8">
        <StudyRoomHeader className="mt-1" />
        <div className="flex h-[41.25rem] flex-col gap-3">
          <AddItemCard openModal={() => setIsAddRoomModalOpen(true)} />
          <ItemCard
            id={'1'}
            roomName={'부스트 캠프 공부방'}
            curParticipant={5}
            maxParticipant={16}
            categoryName="부캠"
            isPrivate={true}
            openModal={() => {
              setIsJoinRoomModalOpen(true);
              setRoomId('1');
            }}
          />
          <ItemCard
            id={'2'}
            roomName={'부스트 캠프 공부방'}
            curParticipant={6}
            maxParticipant={16}
            categoryName="부캠"
            isPrivate={true}
            openModal={() => {
              setIsJoinRoomModalOpen(true);
              setRoomId('2');
            }}
          />
          <ItemCard
            id={'3'}
            roomName={'부스트 캠프 공부방'}
            curParticipant={6}
            maxParticipant={16}
            categoryName="부캠"
            isPrivate={true}
            openModal={() => {
              setIsJoinRoomModalOpen(true);
              setRoomId('3');
            }}
          />
          <ItemCard
            id={'4'}
            roomName={'부스트 캠프 공부방'}
            curParticipant={6}
            maxParticipant={16}
            categoryName="부캠"
            isPrivate={true}
            openModal={() => {
              setIsJoinRoomModalOpen(true);
              setRoomId('4');
            }}
          />
          <ItemCard
            id={'5'}
            roomName={'부스트 캠프 공부방'}
            curParticipant={6}
            maxParticipant={16}
            categoryName="부캠"
            isPrivate={true}
            openModal={() => {
              setIsJoinRoomModalOpen(true);
              setRoomId('5');
            }}
          />
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
          <JoinRoomModal id={roomId} closeModal={() => setIsJoinRoomModalOpen(false)} />
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
