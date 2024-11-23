export const MESSAGE_SENT = (clientId: string, userList: string[], message: string) =>
  `Message from ${clientId} in room ${userList}: ${message}`;
export const ROOM_NOT_FOUND = (clientId: string) => `사용자 ${clientId}가 속한 방이 없습니다.`;
export const ROOM_ID_NOT_FOUND_ERROR = 'Room ID does not exist for the user.';
