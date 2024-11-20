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

const signalingClient = (localStream: MediaStream, webRTCMap: Map<string, WebRTCData>) => {
  const socket = io(import.meta.env.VITE_SIGNALING_SERVER_URL);

  socket.on('setIceCandidate', (data: string) => {
    const { senderId, iceCandidate } = JSON.parse(data);
    const { peerConnection } = webRTCMap.get(senderId)!;
    if (peerConnection) {
      peerConnection.addIceCandidate(new RTCIceCandidate(iceCandidate));
    }
  });

  socket.on('offerRequest', async (data: string) => {
    const { users } = JSON.parse(data);
    for (const oldId of users) {
      const peerConnection = new RTCPeerConnection(configuration);

      const dataChannel = peerConnection.createDataChannel('stopWatch');

      localStream.getTracks().forEach((track) => peerConnection.addTrack(track, localStream));

      const offer = await peerConnection.createOffer();

      await peerConnection.setLocalDescription(offer);

      peerConnection.onicecandidate = ({ candidate }) => {
        if (candidate) {
          socket.emit('sendIceCandidate', { targetId: oldId, iceCandidate: candidate });
        }
      };

      peerConnection.onconnectionstatechange = () => {
        if (
          peerConnection.connectionState === 'disconnected' ||
          peerConnection.connectionState === 'failed' ||
          peerConnection.connectionState === 'closed'
        ) {
          webRTCMap.delete(oldId);
          peerConnection.close();
        }
      };

      socket.emit('sendOffer', { oldId, offer, newRandomId: localStorage.getItem('nickName') });

      webRTCMap.set(oldId, { ...webRTCMap.get(oldId)!, peerConnection, dataChannel });
    }
  });

  socket.on('answerRequest', async (data) => {
    const { newId, offer, newRandomId } = JSON.parse(data);

    const peerConnection = new RTCPeerConnection(configuration);

    peerConnection.ondatachannel = ({ channel }) => {
      // dataChannel 이벤트 발생 시점에 webRTCMap의 최신 데이터를 가져와서 dataChannel을 업데이트
      webRTCMap.set(newId, { ...webRTCMap.get(newId)!, dataChannel: channel });
    };

    peerConnection.ontrack = ({ streams }) => {
      // track 이벤트 발생 시점에 webRTCMap의 최신 데이터를 가져와서 remoteStream을 업데이트
      webRTCMap.set(newId, { ...webRTCMap.get(newId)!, remoteStream: streams[0] });
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

    peerConnection.onconnectionstatechange = () => {
      if (
        peerConnection.connectionState === 'disconnected' ||
        peerConnection.connectionState === 'failed' ||
        peerConnection.connectionState === 'closed'
      ) {
        webRTCMap.delete(newId);
        peerConnection.close();
      }
    };

    socket.emit('sendAnswer', { newId, answer, oldRandomId: localStorage.getItem('nickName') });

    webRTCMap.set(newId, { ...webRTCMap.get(newId)!, peerConnection, nickName: newRandomId });
  });

  socket.on('completeConnection', async (data) => {
    const { oldId, answer, oldRandomId } = JSON.parse(data);

    const { peerConnection } = webRTCMap.get(oldId)!;

    peerConnection.ontrack = ({ streams }) => {
      // track 이벤트 발생 시점에 webRTCMap의 최신 데이터를 가져와서 remoteStream을 업데이트
      webRTCMap.set(oldId, { ...webRTCMap.get(oldId)!, remoteStream: streams[0] });
    };

    await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));

    webRTCMap.set(oldId, { ...webRTCMap.get(oldId)!, nickName: oldRandomId });
  });

  return socket;
};

export default signalingClient;
