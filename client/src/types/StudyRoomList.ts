interface Room {
  roomId: string;
  roomName: string;
  categoryName: string;
  isPrivate: boolean;
  curParticipant: number;
  maxParticipant: number;
}

interface ErrorResponse {
  message: string;
  error: string;
  statusCode: number;
}

interface ResponseData {
  canAccess: boolean;
  error?: ErrorResponse;
}

interface ItemCard {
  roomId: string;
  roomName: string;
  categoryName: string;
  isPrivate: boolean;
  curParticipant: number;
  maxParticipant: number;
  openModal: () => void;
}

interface JoinRoomModal {
  currentRoom: Partial<Room>;
  closeModal: () => void;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
}

export type { Room, ResponseData, ItemCard, JoinRoomModal, Pagination };
