import { io } from 'socket.io-client';

interface WebRTCData {
  peerConnection: RTCPeerConnection;
  remoteStream: MediaStream;
  dataChannel: RTCDataChannel;
  nickName: string;
}

interface IceServer {
  urls: string;
  username?: string;
  credential?: string;
}

interface Configuration {
  iceServers: IceServer[];
}

type SignalingClientParams = [Configuration, MediaStream, Map<string, WebRTCData>];

const requiredKeys = ['peerConnection', 'remoteStream', 'dataChannel', 'nickName'];

const signalingClient = (...[configuration, localStream, webRTCMap]: SignalingClientParams) => {
  const socket = io(import.meta.env.VITE_SIGNALING_SERVER_URL, { transports: ['websocket'] });
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

      peerConnection.ontrack = ({ streams }) => {
        updatePendingConnection(oldId, { remoteStream: streams[0] });
      };

      peerConnection.onicecandidate = ({ candidate }) => {
        if (candidate) {
          socket.emit('sendIceCandidate', { targetId: oldId, iceCandidate: candidate });
        }
      };

      localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStream);
      });

      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      socket.emit('sendOffer', { oldId, offer, newRandomId: localStorage.getItem('nickName') });

      peerConnection.onnegotiationneeded = async () => {
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        socket.emit('sendOffer', { oldId, offer, newRandomId: localStorage.getItem('nickName') });
      };
    }
  });

  socket.on('answerRequest', async ({ newId, offer, newRandomId }) => {
    const isRenegotiation = webRTCMap.has(newId);

    if (isRenegotiation) {
      const { peerConnection } = webRTCMap.get(newId)!;
      await peerConnection.setRemoteDescription(offer);

      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      socket.emit('sendAnswer', { newId, answer, oldRandomId: localStorage.getItem('nickName') });

      // removeTrack 이벤트 발생 시 화면 갱신을 위한 remoteStream 수동 업데이트
      updatePendingConnection(newId, { remoteStream: webRTCMap.get(newId)!.remoteStream });

      return;
    }

    const peerConnection = new RTCPeerConnection(configuration);

    updatePendingConnection(newId, { peerConnection, nickName: newRandomId });

    peerConnection.ondatachannel = ({ channel }) => {
      updatePendingConnection(newId, { dataChannel: channel });
    };

    peerConnection.ontrack = ({ streams }) => {
      updatePendingConnection(newId, { remoteStream: streams[0] });
    };

    peerConnection.onicecandidate = ({ candidate }) => {
      if (candidate) {
        socket.emit('sendIceCandidate', { targetId: newId, iceCandidate: candidate });
      }
    };

    await peerConnection.setRemoteDescription(offer);

    localStream.getTracks().forEach((track) => {
      peerConnection.addTrack(track, localStream);
    });

    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    socket.emit('sendAnswer', { newId, answer, oldRandomId: localStorage.getItem('nickName') });

    peerConnection.onnegotiationneeded = async () => {
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      socket.emit('sendOffer', {
        oldId: newId,
        offer,
        newRandomId: localStorage.getItem('nickName'),
      });
    };
  });

  socket.on('completeConnection', async ({ oldId, answer, oldRandomId }) => {
    const { peerConnection } = pendingConnectionsMap.get(oldId)!;

    updatePendingConnection(oldId, { nickName: oldRandomId });

    await peerConnection.setRemoteDescription(answer);
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
