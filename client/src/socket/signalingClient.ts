import { io } from 'socket.io-client';

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
    {
      urls: import.meta.env.VITE_TURN_SERVER_URL,
      username: import.meta.env.VITE_TURN_SERVER_USERNAME,
      credential: import.meta.env.VITE_TURN_SERVER_CREDENTIAL,
    },
  ],
};

export default (
  localStream: MediaStream | null,
  remoteStreamMap: Map<SocketId, MediaStream>,
  nickNameMap: Map<SocketId, string>,
  stopWatchMap: Map<SocketId, RTCDataChannel>,
) => {
  const socket = io(import.meta.env.VITE_SIGNALING_SERVER_URL);
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

      const dataChannel = peerConnection.createDataChannel('stopWatch');
      let interval: NodeJS.Timeout;
      dataChannel.onopen = () => {
        console.log(`Data channel from ${oldId} is open`);
        console.log(`Socket Id is ${socket.id}`);

        // 채널이 열린 후에 메시지 전송 시작
        interval = setInterval(() => {
          console.log('interval');
          dataChannel.send('22:56:00');
        }, 1000);
      };

      dataChannel.onmessage = ({ data }) => {
        console.log('Received:', data);
      };

      dataChannel.onclose = () => {
        console.log('DataChannel closed');
        clearInterval(interval);
      };

      stopWatchMap.set(oldId, dataChannel);

      // 미디어 스트림 트랙 전송
      if (!localStream) {
        return;
      }
      localStream.getTracks().forEach((track) => peerConnection.addTrack(track, localStream));

      // offer 생성
      const offer = await peerConnection.createOffer();

      socket.emit('sendOffer', { oldId, offer, newRandomId: localStorage.getItem('nickName') });

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
          stopWatchMap.delete(oldId);
          peerConnection.close();
        }
      };
    }
  });

  socket.on('answerRequest', async (data) => {
    const { newId, offer, newRandomId } = JSON.parse(data);

    nickNameMap.set(newId, newRandomId);

    // RTCPeerConnection 생성
    const peerConnection = new RTCPeerConnection(configuration);
    peerConnectionMap.set(newId, peerConnection);

    peerConnection.ondatachannel = ({ channel }) => {
      // 채널 상태 핸들러 설정
      channel.onopen = () => {
        console.log(`Data channel from ${newId} is open`);
        console.log(`Socket Id is ${socket.id}`);
      };

      channel.onmessage = (event) => {
        console.log(`Message from ${newId}:`, event.data);
      };

      channel.onclose = () => {
        console.log(`Data channel from ${newId} closed`);
        stopWatchMap.delete(newId);
      };

      stopWatchMap.set(newId, channel);
    };

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

    socket.emit('sendAnswer', { newId, answer, oldRandomId: localStorage.getItem('nickName') });

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
        stopWatchMap.delete(newId);
        peerConnection.close();
      }
    };
  });

  socket.on('completeConnection', async (data) => {
    const { oldId, answer, oldRandomId } = JSON.parse(data);

    nickNameMap.set(oldId, oldRandomId);

    // RTCPeerConnection 완료
    const peerConnection = peerConnectionMap.get(oldId)!;

    // 미디어 스트림 트랙 수신
    peerConnection.ontrack = (event) => {
      remoteStreamMap.set(oldId, event.streams[0]);
    };

    // RemoteDescription 설정
    await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
  });

  return { peerConnectionMap, socket };
};
