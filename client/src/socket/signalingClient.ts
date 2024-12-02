import { Socket } from 'socket.io-client';

import type { Configuration } from '@customTypes/WebRTC';

import useWebRTCStore from '@stores/useWebRTCStore';

type SignalingClientParams = [Socket, Configuration, MediaStream];

const signalingClient = (...[socket, configuration, localStream]: SignalingClientParams) => {
  const { addWebRTCData, removeWebRTCData } = useWebRTCStore.getState();

  const handlePeerDisconnection = (targetId: string) => {
    const { webRTCMap } = useWebRTCStore.getState();
    const { peerConnection, dataChannel } = webRTCMap[targetId];

    dataChannel.close();
    peerConnection.close();
    removeWebRTCData(targetId);
  };

  socket.on('offerRequest', async ({ users }) => {
    for (const { socketId: oldId } of users) {
      const peerConnection = new RTCPeerConnection(configuration);
      const dataChannel = peerConnection.createDataChannel('stopWatch');

      addWebRTCData(oldId, { peerConnection, dataChannel });

      peerConnection.ontrack = ({ streams }) => {
        addWebRTCData(oldId, { remoteStream: streams[0] });
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
    const { webRTCMap } = useWebRTCStore.getState();
    const isRenegotiation = newId in webRTCMap;

    if (isRenegotiation) {
      const { peerConnection } = webRTCMap[newId];
      await peerConnection.setRemoteDescription(offer);

      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      socket.emit('sendAnswer', { newId, answer, oldRandomId: localStorage.getItem('nickName') });

      // removeTrack 이벤트 발생 시 화면 갱신을 위한 remoteStream 수동 업데이트
      addWebRTCData(newId, { remoteStream: webRTCMap[newId].remoteStream });

      return;
    }

    const peerConnection = new RTCPeerConnection(configuration);

    addWebRTCData(newId, { peerConnection, nickName: newRandomId });

    peerConnection.ondatachannel = ({ channel }) => {
      addWebRTCData(newId, { dataChannel: channel });
    };

    peerConnection.ontrack = ({ streams }) => {
      addWebRTCData(newId, { remoteStream: streams[0] });
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
    const { pendingConnectionsMap } = useWebRTCStore.getState();
    const { peerConnection } = pendingConnectionsMap[oldId];

    addWebRTCData(oldId, { nickName: oldRandomId });

    await peerConnection.setRemoteDescription(answer);
  });

  socket.on('setIceCandidate', ({ senderId, iceCandidate }) => {
    const { pendingConnectionsMap } = useWebRTCStore.getState();
    const { peerConnection } = pendingConnectionsMap[senderId];
    if (peerConnection) {
      peerConnection.addIceCandidate(new RTCIceCandidate(iceCandidate));
    }
  });

  socket.on('userDisconnected', ({ targetId }) => {
    handlePeerDisconnection(targetId);
  });
};

export default signalingClient;
