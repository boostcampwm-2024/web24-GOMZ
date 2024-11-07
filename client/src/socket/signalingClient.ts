import { io } from 'socket.io-client';

const SIGNALING_SERVER_URL = import.meta.env.VITE_SIGNALING_SERVER_URL;
const SIGNALING_SERVER_PORT = import.meta.env.VITE_SIGNALING_SERVER_PORT;

type SocketId = string | undefined;

const configuration = {
  iceServers: [
    {
      urls: [
        'stun:stun.l.google.com:19302',
        'stun:stun1.l.google.com:19302',
        'stun:stun2.l.google.com:19302',
        'stun:stun3.l.google.com:19302',
        'stun:stun4.l.google.com:19302',
      ],
    },
  ],
};

export default (localStream: MediaStream | null, remoteStreamMap: Map<SocketId, MediaStream>) => {
  const socket = io(`${SIGNALING_SERVER_URL}:${SIGNALING_SERVER_PORT}`);
  const peerConnectionMap = new Map<SocketId, RTCPeerConnection>();

  // ICE candidate 수신 및 추가
  socket.on('setIceCandidate', (data) => {
    const { senderId, iceCandidate } = JSON.parse(data);
    peerConnectionMap.get(senderId)!.addIceCandidate(new RTCIceCandidate(iceCandidate));
  });

  socket.on('offerRequest', async (data) => {
    const { users } = JSON.parse(data);
    for (const oldId of users) {
      // RTCPeerConnection 생성
      const peerConnection = new RTCPeerConnection(configuration);
      peerConnectionMap.set(oldId, peerConnection);

      // 미디어 스트림 트랙 전송
      if (!localStream) {
        return;
      }
      localStream.getTracks().forEach((track) => peerConnection.addTrack(track, localStream));

      // offer 생성
      const offer = await peerConnection.createOffer();

      socket.emit('sendOffer', { oldId, offer });

      // LocalDescription 설정
      await peerConnection.setLocalDescription(offer);

      // ICE candidate 전송
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit('sendIceCandidate', { targetId: oldId, iceCandidate: event.candidate });
        }
      };

      peerConnection.onconnectionstatechange = () => {
        if (
          peerConnection.connectionState === 'disconnected' ||
          peerConnection.connectionState === 'failed' ||
          peerConnection.connectionState === 'closed'
        ) {
          remoteStreamMap.delete(oldId);
          peerConnectionMap.delete(oldId);
          peerConnection.close();
        }
      };
    }
  });

  socket.on('answerRequest', async (data) => {
    const { newId, offer } = JSON.parse(data);

    // RTCPeerConnection 생성
    const peerConnection = new RTCPeerConnection(configuration);
    peerConnectionMap.set(newId, peerConnection);

    // 미디어 스트림 트랙 수신
    peerConnection.ontrack = (event) => {
      remoteStreamMap.set(newId, event.streams[0]);
    };

    // RemoteDescription 설정
    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

    // 미디어 스트림 트랙 전송
    if (!localStream) {
      return;
    }
    localStream.getTracks().forEach((track) => peerConnection.addTrack(track, localStream));

    // Answer 생성
    const answer = await peerConnection.createAnswer();

    socket.emit('sendAnswer', { newId, answer });

    // LocalDescription 설정
    await peerConnection.setLocalDescription(answer);

    // ICE candidate 전송
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('sendIceCandidate', { targetId: newId, iceCandidate: event.candidate });
      }
    };

    peerConnection.onconnectionstatechange = () => {
      if (
        peerConnection.connectionState === 'disconnected' ||
        peerConnection.connectionState === 'failed' ||
        peerConnection.connectionState === 'closed'
      ) {
        remoteStreamMap.delete(newId);
        peerConnectionMap.delete(newId);
        peerConnection.close();
      }
    };
  });

  socket.on('completeConnection', async (data) => {
    const { oldId, answer } = JSON.parse(data);

    // RTCPeerConnection 완료
    const peerConnection = peerConnectionMap.get(oldId)!;

    // 미디어 스트림 트랙 수신
    peerConnection.ontrack = (event) => {
      remoteStreamMap.set(oldId, event.streams[0]);
    };

    // RemoteDescription 설정
    await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
  });
};
