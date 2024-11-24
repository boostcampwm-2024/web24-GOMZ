import { io } from 'socket.io-client';

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
    {
      urls: import.meta.env.VITE_TURN_SERVER_URL,
      username: import.meta.env.VITE_TURN_SERVER_USERNAME,
      credential: import.meta.env.VITE_TURN_SERVER_CREDENTIAL,
    },
  ],
};

interface WebRTCData {
  peerConnection: RTCPeerConnection;
  remoteStream: MediaStream;
  dataChannel: RTCDataChannel;
  nickName: string;
}

const requiredKeys = ['peerConnection', 'remoteStream', 'dataChannel', 'nickName'];

const signalingClient = (localStream: MediaStream, webRTCMap: Map<string, WebRTCData>) => {
  const socket = io(import.meta.env.VITE_SIGNALING_SERVER_URL);
  const pendingConnectionsMap = new Map<string, WebRTCData>();

  const updatePendingConnection = (socketId: string, data: Partial<WebRTCData>) => {
    pendingConnectionsMap.set(socketId, { ...pendingConnectionsMap.get(socketId)!, ...data });
    const currentData = pendingConnectionsMap.get(socketId)!;
    if (requiredKeys.every((key) => key in currentData)) {
      webRTCMap.set(socketId, currentData as WebRTCData);
    }
  };

  const handlePeerDisconnection = (peerConnection: RTCPeerConnection, targetId: string) => {
    webRTCMap.delete(targetId);
    pendingConnectionsMap.delete(targetId);
    peerConnection.close();
  };

  socket.on('offerRequest', async ({ users }) => {
    for (const { socketId: oldId } of users) {
      const peerConnection = new RTCPeerConnection(configuration);
      const dataChannel = peerConnection.createDataChannel('stopWatch');

      updatePendingConnection(oldId, { peerConnection, dataChannel });

      localStream.getTracks().forEach((track) => peerConnection.addTrack(track, localStream));

      const offer = await peerConnection.createOffer();

      await peerConnection.setLocalDescription(offer);

      peerConnection.onicecandidate = ({ candidate }) => {
        if (candidate) {
          socket.emit('sendIceCandidate', { targetId: oldId, iceCandidate: candidate });
        }
      };

      socket.emit('sendOffer', { oldId, offer, newRandomId: localStorage.getItem('nickName') });
    }
  });

  socket.on('answerRequest', async ({ newId, offer, newRandomId }) => {
    const peerConnection = new RTCPeerConnection(configuration);

    updatePendingConnection(newId, { peerConnection, nickName: newRandomId });

    peerConnection.ondatachannel = ({ channel }) => {
      updatePendingConnection(newId, { dataChannel: channel });
    };

    peerConnection.ontrack = ({ streams }) => {
      updatePendingConnection(newId, { remoteStream: streams[0] });
    };

    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

    localStream.getTracks().forEach((track) => peerConnection.addTrack(track, localStream));

    const answer = await peerConnection.createAnswer();

    await peerConnection.setLocalDescription(answer);

    peerConnection.onicecandidate = ({ candidate }) => {
      if (candidate) {
        socket.emit('sendIceCandidate', { targetId: newId, iceCandidate: candidate });
      }
    };

    socket.emit('sendAnswer', { newId, answer, oldRandomId: localStorage.getItem('nickName') });
  });

  socket.on('completeConnection', async ({ oldId, answer, oldRandomId }) => {
    const { peerConnection } = pendingConnectionsMap.get(oldId)!;

    peerConnection.ontrack = ({ streams }) => {
      updatePendingConnection(oldId, { remoteStream: streams[0] });
    };

    await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));

    updatePendingConnection(oldId, { nickName: oldRandomId });
  });

  socket.on('setIceCandidate', ({ senderId, iceCandidate }) => {
    const { peerConnection } = pendingConnectionsMap.get(senderId)!;
    if (peerConnection) {
      peerConnection.addIceCandidate(new RTCIceCandidate(iceCandidate));
    }
  });

  socket.on('userDisconnected', ({ targetId }) => {
    const { peerConnection } = webRTCMap.get(targetId)!;

    handlePeerDisconnection(peerConnection, targetId);
  });

  return socket;
};

export default signalingClient;
