import {useCallback} from 'react';
import {Platform} from 'react-native';
import {io, Socket} from 'socket.io-client';
import Config from 'react-native-config';

let socket: Socket | undefined;

const useSocket = (): [typeof socket, () => void] => {
  const disconnect = useCallback(() => {
    if (socket) {
      socket.disconnect();
      socket = undefined;
    }
  }, []);

  if (!socket) {
    socket = io(
      `${
        Platform.OS === 'android' ? Config.API_ANDROID_URL : Config.API_IOS_URL
      }`,
      {
        transports: ['websocket'],
        // path: '/socket-io',
      },
    );
  }
  return [socket, disconnect];
};

export default useSocket;
