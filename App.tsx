import React, {useEffect, useState} from 'react';
import {Platform, Alert} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import axios, {AxiosError} from 'axios';
import Config from 'react-native-config';
import {Provider, useSelector} from 'react-redux';
import EncryptedStorage from 'react-native-encrypted-storage';
import SplashScreen from 'react-native-splash-screen';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
// import FontAwesome from 'react-native-vector-icons/FontAwesome';
import messaging from '@react-native-firebase/messaging';
import PushNotification from 'react-native-push-notification';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import CodePush, {CodePushOptions} from 'react-native-code-push';
import Settings from './src/pages/Settings';
import Orders from './src/pages/Orders';
import Delivery from './src/pages/Delivery';
import SignIn from './src/pages/SignIn';
import SignUp from './src/pages/SignUp';
import store, {useAppDispatch} from './src/store';
import {RootState} from './src/store/reducer';
import useSocket from './src/hooks/useSocket';
import usePermissions from './src/hooks/usePermissions';
import userSlice from './src/slices/user';
import orderSlice from './src/slices/order';

export type LoggedInParamList = {
  Orders: undefined;
  Settings: undefined;
  Delivery: undefined;
  Complete: {orderId: string};
};

export type RootStackParamList = {
  SignIn: undefined;
  SignUp: undefined;
};

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function AppInner() {
  const dispatch = useAppDispatch();

  const isLoggedIn = useSelector((state: RootState) => !!state.user.email);
  const [socket, disconnect] = useSocket();

  usePermissions();

  useEffect(() => {
    const callback = (data: any) => {
      console.log(data);
      dispatch(orderSlice.actions.addOrder(data));
    };
    if (socket && isLoggedIn) {
      socket.emit('acceptOrder', 'hello');
      socket.on('order', callback);
    }
    return () => {
      if (socket) {
        socket.off('order', callback);
      }
    };
  }, [isLoggedIn, socket]);

  useEffect(() => {
    if (!isLoggedIn) {
      disconnect();
    }
  }, [isLoggedIn, disconnect]);

  useEffect(() => {
    // axios.interceptors.request.use();
    axios.interceptors.response.use(
      response => {
        return response;
      },
      async error => {
        const {
          config,
          response: {status},
        } = error;
        if (status === 419) {
          if (error.response.data.code === 'expired') {
            const originalRequest = config;
            const refreshToken = await EncryptedStorage.getItem('refreshToken');
            const {data} = await axios.post(
              `
            ${
              Platform.OS === 'android'
                ? Config.API_ANDROLD_URL
                : Config.API_IOS_URL
            }/refreshToken
        `,
              {},
              {
                headers: {
                  Authorization: `Bearer ${refreshToken}`,
                },
              },
            );
            dispatch(userSlice.actions.setAccessToken(data.data.accessToken));
            originalRequest.headers.authorization = `Bearer ${data.data.accessToken}`;
            return axios(originalRequest);
          }
        }
        return Promise.reject(error);
      },
    );
  }, []);

  useEffect(() => {
    const getTokenAndRefresh = async () => {
      try {
        const token = await EncryptedStorage.getItem('refreshToken');
        if (!token) {
          SplashScreen.hide();
          return;
        }
        const response = await axios.post(
          `${
            Platform.OS === 'android'
              ? Config.API_ANDROID_URL
              : Config.API_IOS_URL
          }/refreshToken`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        dispatch(
          userSlice.actions.setUser({
            name: response.data.data.name,
            email: response.data.data.email,
            accessToken: response.data.data.accessToken,
          }),
        );
      } catch (error) {
        if ((error as AxiosError).response?.data.code === 'expired') {
          Alert.alert('알림', '다시 로그인 해주세요.');
        }
      } finally {
        // TODO: splash screen active off
        SplashScreen.hide();
      }
    };
    getTokenAndRefresh();
  }, [dispatch]);

  // 토큰 설정
  useEffect(() => {
    async function getToken() {
      try {
        if (!messaging().isDeviceRegisteredForRemoteMessages) {
          await messaging().registerDeviceForRemoteMessages();
        }
        const token = await messaging().getToken();
        console.log('phone token', token);
        dispatch(userSlice.actions.setPhoneToken(token));
        return axios.post(
          `${
            Platform.OS === 'android'
              ? Config.API_ANDROID_URL
              : Config.API_IOS_URL
          }/phonetoken`,
          {token},
        );
      } catch (error) {
        console.error(error);
      }
    }
    getToken();
  }, [dispatch]);

  return (
    <NavigationContainer>
      {isLoggedIn ? (
        <Tab.Navigator>
          <Tab.Group>
            <Tab.Screen
              name="Orders"
              component={Orders}
              options={{
                title: '오더 목록',
                tabBarIcon: ({color}) => (
                  <FontAwesome5 name="list" size={20} style={{color}} />
                ),
                // tab 글자와 아이콘 스타일 공통 적용
                tabBarActiveTintColor: 'blue',
              }}
            />
            <Tab.Screen
              name="Delivery"
              component={Delivery}
              options={{
                headerShown: false,
                tabBarIcon: () => <FontAwesome5 name="map" size={20} />,
              }}
            />
            <Tab.Screen
              name="Settings"
              component={Settings}
              options={{
                title: '내 정보',
                unmountOnBlur: true,
                tabBarIcon: () => <FontAwesome5 name="info-circle" size={20} />,
              }}
            />
          </Tab.Group>
        </Tab.Navigator>
      ) : (
        <Stack.Navigator>
          <Stack.Screen
            name="SignIn"
            component={SignIn}
            options={{title: '로그인'}}
          />
          <Stack.Screen
            name="SignUp"
            component={SignUp}
            options={{title: '회원가입'}}
          />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}

messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Message handled in the background!', remoteMessage);
});
PushNotification.configure({
  // (optional) 토큰이 생성될 때 실행됨(토큰을 서버에 등록할 때 쓸 수 있음)
  onRegister: function (token: any) {
    console.log('TOKEN:', token);
  },

  // (required) 리모트 노티를 수신하거나, 열었거나 로컬 노티를 열었을 때 실행
  onNotification: function (notification: any) {
    console.log('NOTIFICATION:', notification);
    if (notification.channelId === 'riders') {
      // if (notification.message || notification.data.message) {
      //   store.dispatch(
      //     userSlice.actions.showPushPopup(
      //       notification.message || notification.data.message,
      //     ),
      //   );
      // }
    }
    // process the notification

    // (required) 리모트 노티를 수신하거나, 열었거나 로컬 노티를 열었을 때 실행
    notification.finish(PushNotificationIOS.FetchResult.NoData);
  },

  // (optional) 등록한 액션을 누렀고 invokeApp이 false 상태일 때 실행됨, true면 onNotification이 실행됨 (Android)
  onAction: function (notification: any) {
    console.log('ACTION:', notification.action);
    console.log('NOTIFICATION:', notification);

    // process the action
  },

  // (optional) Called when the user fails to register for remote notifications. Typically occurs when APNS is having issues, or the device is a simulator. (iOS)
  onRegistrationError: function (err: Error) {
    console.error(err.message, err);
  },

  // IOS ONLY (optional): default: all - Permissions to register.
  permissions: {
    alert: true,
    badge: true,
    sound: true,
  },

  // Should the initial notification be popped automatically
  // default: true
  popInitialNotification: true,

  /**
   * (optional) default: true
   * - Specified if permissions (ios) and token (android and ios) will requested or not,
   * - if not, you must call PushNotificationsHandler.requestPermissions() later
   * - if you are not using remote notification or do not have Firebase installed, use this:
   *     requestPermissions: Platform.OS === 'ios'
   */
  requestPermissions: true,
});
PushNotification.createChannel(
  {
    channelId: 'riders', // (required)
    channelName: '앱 전반', // (required)
    channelDescription: '앱 실행하는 알림', // (optional) default: undefined.
    soundName: 'default', // (optional) See `soundName` parameter of `localNotification` function
    importance: 4, // (optional) default: 4. Int value of the Android notification importance
    vibrate: true, // (optional) default: true. Creates the default vibration patten if true.
  },
  (created: boolean) =>
    console.log(`createChannel riders returned '${created}'`), // (optional) callback returns whether the channel was created, false means it already existed.
);

const codePushOptions: CodePushOptions = {
  checkFrequency: CodePush.CheckFrequency.MANUAL,
  // 언제 업데이트를 체크하고 반영할지를 정한다.
  // ON_APP_RESUME은 Background에서 Foreground로 오는 것을 의미
  // ON_APP_START은 앱이 실행되는(켜지는) 순간을 의미

  installMode: CodePush.InstallMode.IMMEDIATE,
  mandatoryInstallMode: CodePush.InstallMode.IMMEDIATE,
  // 업데이트를 어떻게 설치할 것인지 (IMMEDIATE는 강제설치를 의미)
};

function App() {
  useEffect(() => {
    CodePush.sync(
      {
        installMode: CodePush.InstallMode.IMMEDIATE,
        mandatoryInstallMode: CodePush.InstallMode.IMMEDIATE,
        updateDialog: {
          mandatoryUpdateMessage:
            '필수 업데이트가 있어 설치 후 앱을 재시작합니다.',
          mandatoryContinueButtonLabel: '재시작',
          optionalIgnoreButtonLabel: '나중에',
          optionalInstallButtonLabel: '재시작',
          optionalUpdateMessage: '업데이트가 있습니다. 설치하시겠습니까?',
          title: '업데이트 안내',
        },
      },
      status => {
        console.log(`Changed ${status}`);
      },
      downloadProgress => {
        // 여기서 몇 % 다운로드되었는지 체크 가능
      },
    ).then(status => {
      console.log(`CodePush ${status}`);
    });
  }, []);
  return (
    <Provider store={store}>
      <AppInner />
    </Provider>
  );
}

export default CodePush(codePushOptions)(App);
