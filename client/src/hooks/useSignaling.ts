import { useCallback, useEffect } from 'react';
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

interface UseSignalingProps {
  localStream: MediaStream;
  webRTCMap: Map<string, WebRTCData>;
}

const useSignaling = ({ localStream, webRTCMap }: UseSignalingProps) => {
  const socket = io(import.meta.env.VITE_SIGNALING_SERVER_URL);

  const handleSendIceCandidate = (targetId: string, iceCandidate: RTCIceCandidate) => {
    socket.emit('sendIceCandidate', { targetId, iceCandidate });
  };

  const handlePeerDisconnection = (socketId: string, peerConnection: RTCPeerConnection) => {
    if (
      peerConnection.connectionState === 'disconnected' ||
      peerConnection.connectionState === 'failed' ||
      peerConnection.connectionState === 'closed'
    ) {
      webRTCMap.delete(socketId);
      peerConnection.close();
    }
  };

  const handleSetIceCandidate = useCallback(
    (data: string) => {
      const { senderId, iceCandidate } = JSON.parse(data);
      const { peerConnection } = webRTCMap.get(senderId)!;
      peerConnection.addIceCandidate(new RTCIceCandidate(iceCandidate));
    },
    [webRTCMap],
  );

  const handleOfferRequest = useCallback(
    async (data: string) => {
      const { users } = JSON.parse(data);
      for (const oldId of users) {
        // RTCPeerConnection 생성
        const peerConnection = new RTCPeerConnection(configuration);
        const dataChannel = peerConnection.createDataChannel('stopWatch');
        const webRTCData = webRTCMap.get(oldId)!;
        webRTCMap.set(oldId, { ...webRTCData, peerConnection, dataChannel });

        // 연결 확인용: 커밋 전 삭제 필요
        dataChannel.onopen = () => {
          console.log(`Data channel from ${oldId} is open`);
        };

        dataChannel.onclose = () => {
          console.log('Data channel closed');
        };
        // 연결 확인용

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
        peerConnection.onicecandidate = ({ candidate }) => {
          if (candidate) {
            handleSendIceCandidate(oldId, candidate);
          }
        };

        peerConnection.onconnectionstatechange = () => {
          handlePeerDisconnection(oldId, peerConnection);
        };
      }
    },
    [socket, localStream, webRTCMap, handleSendIceCandidate, handlePeerDisconnection],
  );

  const handleAnswerRequest = useCallback(
    async (data: string) => {
      const { newId, offer, newRandomId } = JSON.parse(data);

      // RTCPeerConnection 생성
      const peerConnection = new RTCPeerConnection(configuration);
      const webRTCData = webRTCMap.get(newId)!;

      webRTCMap.set(newId, { ...webRTCData, nickName: newRandomId, peerConnection });

      peerConnection.ondatachannel = ({ channel }) => {
        // 연결 테스트 용
        channel.onopen = () => {
          console.log(`Data channel from ${newId} is open`);
        };

        channel.onclose = () => {
          console.log(`Data channel closed`);
        };

        const webRTCData = webRTCMap.get(newId)!;
        webRTCMap.set(newId, { ...webRTCData, dataChannel: channel });
      };

      // 미디어 스트림 트랙 수신
      peerConnection.ontrack = (event) => {
        const webRTCData = webRTCMap.get(newId)!;
        webRTCMap.set(newId, { ...webRTCData, remoteStream: event.streams[0] });
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
      peerConnection.onicecandidate = ({ candidate }) => {
        if (candidate) {
          handleSendIceCandidate(newId, candidate);
        }
      };

      peerConnection.onconnectionstatechange = () => {
        handlePeerDisconnection(newId, peerConnection);
      };
    },
    [socket, localStream, webRTCMap, handleSendIceCandidate, handlePeerDisconnection],
  );

  const handleCompleteConnection = useCallback(
    async (data: string) => {
      const { oldId, answer, oldRandomId } = JSON.parse(data);
      // RTCPeerConnection 완료
      const webRTCData = webRTCMap.get(oldId)!;
      const peerConnection = webRTCData.peerConnection;
      webRTCMap.set(oldId, { ...webRTCData, nickName: oldRandomId, peerConnection });

      // 미디어 스트림 트랙 수신
      peerConnection.ontrack = (event) => {
        const webRTCData = webRTCMap.get(oldId)!;
        webRTCMap.set(oldId, { ...webRTCData, remoteStream: event.streams[0] });
      };

      // RemoteDescription 설정
      await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    },
    [webRTCMap],
  );

  useEffect(() => {
    socket.on('setIceCandidate', handleSetIceCandidate);
    socket.on('offerRequest', handleOfferRequest);
    socket.on('answerRequest', handleAnswerRequest);
    socket.on('completeConnection', handleCompleteConnection);

    return () => {
      socket.off('setIceCandidate', handleSetIceCandidate);
      socket.off('offerRequest', handleOfferRequest);
      socket.off('answerRequest', handleAnswerRequest);
      socket.off('completeConnection', handleCompleteConnection);
    };
  }, [
    socket,
    handleSetIceCandidate,
    handleOfferRequest,
    handleAnswerRequest,
    handleCompleteConnection,
  ]);

  return socket;
};

export default useSignaling;
