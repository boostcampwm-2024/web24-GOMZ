import { io } from 'socket.io-client';
import { create } from 'zustand';

import type { State, Action } from '@customTypes/WebRTC';

import signalingClient from '@socket/signalingClient';
import { getConfiguration } from '@APIs/StudyRoomAPI';
import { getVideoDevices, getAudioDevices, createDummyStream, checkPermission } from '@utils/media';

const requiredWebRTCData = ['peerConnection', 'remoteStream', 'dataChannel', 'nickName'];

const createInitialState = () => ({
  socket: null,
  localStream: null,
  webRTCMap: {},
  pendingConnectionsMap: {},
  curParticipant: 1,
  videoDeviceId: 'default',
  audioDeviceId: 'default',
  isVideoOn: false,
  isAudioOn: true,
  videoPermission: '',
  audioPermission: '',
});

const useWebRTCStore = create<State & Action>((set, get) => ({
  ...createInitialState(),

  addWebRTCData: (socketId, webRTCData) => {
    set((state) => {
      const updatedPendingConnectionsMap = {
        ...state.pendingConnectionsMap,
        [socketId]: {
          ...state.pendingConnectionsMap[socketId],
          ...webRTCData,
        },
      };

      const currentData = updatedPendingConnectionsMap[socketId];

      if (requiredWebRTCData.every((key) => key in currentData)) {
        const updatedWebRTCMap = {
          ...state.webRTCMap,
          [socketId]: currentData,
        };

        return {
          pendingConnectionsMap: updatedPendingConnectionsMap,
          webRTCMap: updatedWebRTCMap,
          curParticipant: Object.keys(updatedWebRTCMap).length + 1,
        };
      }

      return {
        pendingConnectionsMap: updatedPendingConnectionsMap,
      };
    });
  },

  removeWebRTCData: (socketId) => {
    set((state) => {
      const newWebRTCMap = { ...state.webRTCMap };
      const newPendingConnectionsMap = { ...state.pendingConnectionsMap };

      delete newWebRTCMap[socketId];
      delete newPendingConnectionsMap[socketId];

      return {
        webRTCMap: newWebRTCMap,
        pendingConnectionsMap: newPendingConnectionsMap,
        curParticipant: Object.keys(newPendingConnectionsMap).length + 1,
      };
    });
  },

  joinRoom: async (roomId) => {
    set({
      socket: io(`${import.meta.env.VITE_SIGNALING_SERVER_URL}/mesh`, {
        transports: ['websocket'],
      }),
    });
    const {
      setVideoDeviceId,
      setAudioDeviceId,
      toggleAudio,
      setVideoPermission,
      setAudioPermission,
    } = get();

    const audioPermission = await checkPermission('microphone');
    setAudioPermission(audioPermission);
    const audioDevices = await getAudioDevices();

    if (audioPermission === 'granted' && audioDevices.length !== 0) {
      const hasDefaultAudioDevice = audioDevices.some(({ deviceId }) => deviceId === 'default');
      setAudioDeviceId(hasDefaultAudioDevice ? 'default' : audioDevices[0].deviceId);

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: { deviceId: { ideal: 'default' } },
      });

      set({ localStream: mediaStream });
    } else {
      const dummyStream = createDummyStream();
      set({ localStream: dummyStream });
    }

    toggleAudio();

    const videoPermission = await checkPermission('camera');
    setVideoPermission(videoPermission);
    const videoDevices = await getVideoDevices();

    if (videoPermission === 'granted' && videoDevices.length !== 0) {
      const hasDefaultVideoDevice = videoDevices.some(({ deviceId }) => deviceId === 'default');
      setVideoDeviceId(hasDefaultVideoDevice ? 'default' : videoDevices[0].deviceId);
    }

    const configuration = await getConfiguration();

    const { socket, localStream } = get();
    signalingClient(socket!, configuration, localStream!);
    socket!.emit('joinRoom', { roomId });
  },

  closeAllConnections: () => {
    const { socket, localStream, webRTCMap } = get();

    Object.values(webRTCMap).forEach(({ peerConnection, dataChannel }) => {
      dataChannel.close();
      peerConnection.close();
    });

    localStream!.getTracks().forEach((track) => track.stop());

    socket!.close();
    set({ ...createInitialState() });
  },

  toggleVideo: async () => {
    const { localStream, webRTCMap, videoDeviceId } = get();

    const currentVideoTrack = localStream!.getVideoTracks()[0];

    if (currentVideoTrack) {
      currentVideoTrack.stop();
      localStream!.removeTrack(currentVideoTrack);

      Object.values(webRTCMap).forEach(({ peerConnection }) => {
        const sender = peerConnection.getSenders().find(({ track }) => track?.kind === 'video')!;
        peerConnection.removeTrack(sender);
      });

      set({ isVideoOn: false });
    } else {
      const videoTrack = await navigator.mediaDevices
        .getUserMedia({
          video: { deviceId: { ideal: videoDeviceId } },
        })
        .then((stream) => stream.getVideoTracks()[0]);

      if (videoDeviceId === 'default') {
        const videoDevices = await getVideoDevices();
        if (videoDevices.every(({ deviceId }) => deviceId !== 'default')) {
          set({ videoDeviceId: videoDevices[0].deviceId });
        }
      }

      localStream!.addTrack(videoTrack);

      Object.values(webRTCMap).forEach(({ peerConnection }) => {
        peerConnection.addTrack(videoTrack, localStream!);
      });

      set({ isVideoOn: true });
    }
  },

  startAudio: async () => {
    const { localStream, webRTCMap, audioDeviceId } = get();

    const audioTrack = await navigator.mediaDevices
      .getUserMedia({
        audio: { deviceId: { ideal: audioDeviceId } },
      })
      .then((stream) => stream.getAudioTracks()[0]);

    localStream!.addTrack(audioTrack);

    Object.values(webRTCMap).forEach(({ peerConnection }) => {
      peerConnection.addTrack(audioTrack, localStream!);
    });

    set({ isAudioOn: true });
  },

  toggleAudio: () => {
    const { localStream } = get();
    localStream!.getAudioTracks().forEach((track) => (track.enabled = !track.enabled));
    set((state) => ({ isAudioOn: !state.isAudioOn }));
  },

  changeVideoDevice: async () => {
    const { localStream, webRTCMap, videoDeviceId } = get();

    const currentVideoTrack = localStream!.getVideoTracks()[0];

    if (!currentVideoTrack) return;

    const videoTrack = await navigator.mediaDevices
      .getUserMedia({
        video: { deviceId: { ideal: videoDeviceId } },
      })
      .then((stream) => stream.getVideoTracks()[0]);

    Object.values(webRTCMap).forEach(({ peerConnection }) => {
      const sender = peerConnection.getSenders().find(({ track }) => track?.kind === 'video')!;
      sender.replaceTrack(videoTrack);
    });

    currentVideoTrack.stop();
    localStream!.removeTrack(currentVideoTrack);
    localStream!.addTrack(videoTrack);
  },

  changeAudioDevice: async () => {
    const { localStream, webRTCMap, audioDeviceId } = get();

    const currentAudioTrack = localStream?.getAudioTracks()[0];

    if (!currentAudioTrack) return;

    const audioTrack = await navigator.mediaDevices
      .getUserMedia({
        audio: { deviceId: { ideal: audioDeviceId } },
      })
      .then((stream) => stream.getAudioTracks()[0]);

    Object.values(webRTCMap).forEach(({ peerConnection }) => {
      const sender = peerConnection.getSenders().find(({ track }) => track?.kind === 'audio')!;
      sender.replaceTrack(audioTrack);
    });

    currentAudioTrack.stop();
    localStream!.removeTrack(currentAudioTrack);
    localStream!.addTrack(audioTrack);
  },

  setVideoDeviceId: (deviceId) => {
    const { changeVideoDevice } = get();
    set({ videoDeviceId: deviceId });
    changeVideoDevice();
  },

  setAudioDeviceId: (deviceId) => {
    const { changeAudioDevice } = get();
    set({ audioDeviceId: deviceId });
    changeAudioDevice();
  },

  setVideoPermission: (permissionState) => {
    set({ videoPermission: permissionState });
  },

  setAudioPermission: (permissionState) => {
    set({ audioPermission: permissionState });
  },

  sendMessage: (message: string) => {
    const { socket } = get();
    socket!.emit('sendMessage', { message });
  },
}));

export default useWebRTCStore;
