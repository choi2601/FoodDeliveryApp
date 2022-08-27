import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import {useNavigation, NavigationProp} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import axios, {AxiosError} from 'axios';
import Config from 'react-native-config';
import {RootState} from '../store/reducer';
import orderSlice, {Order} from '../slices/order';
import {LoggedInParamList} from '../../App';

interface EachOrderProps {
  item: Order;
}

function EachOrder({item}: EachOrderProps) {
  const dispatch = useDispatch();
  const navigation = useNavigation<NavigationProp<LoggedInParamList>>();

  const accessToken = useSelector((state: RootState) => state.user.accessToken);

  const [loading, setLoading] = useState<boolean>(false);
  const [detail, setDetail] = useState<boolean>(false);

  const onToggleDetail = useCallback(() => {
    setDetail(p => !p);
  }, []);

  const onAcept = useCallback(async () => {
    if (!accessToken) {
      return;
    }
    try {
      setLoading(false);
      await axios.post(
        `${
          Platform.OS === 'android'
            ? Config.API_ANDROID_URL
            : Config.API_IOS_URL
        }/accept`,
        {orderId: item.orderId},
        {headers: {authorization: `Bearer ${accessToken}`}},
      );
      dispatch(orderSlice.actions.acceptOrder(item.orderId));
      navigation.navigate('Delivery');
    } catch (error) {
      let errorResponse = (error as AxiosError).response;
      if (errorResponse?.status === 400) {
        // 타인이 이미 수락한 경우
        Alert.alert('알림', errorResponse.data.message);
        dispatch(orderSlice.actions.rejectOrder(item.orderId));
      }
    } finally {
      setLoading(false);
    }
  }, [dispatch, item.orderId, accessToken]);

  const onReject = useCallback(() => {
    dispatch(orderSlice.actions.rejectOrder(item.orderId));
  }, [dispatch, item.orderId]);

  return (
    <View key={item.orderId} style={styles.orderContainer}>
      <Pressable onPress={onToggleDetail} style={styles.info}>
        <Text style={styles.eachInfo}>
          {item.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}원
        </Text>
        <Text>삼성동</Text>
        <Text>왕십리동</Text>
      </Pressable>
      {detail && (
        <View>
          <View>
            <Text>네이버맵</Text>
          </View>
          <View style={styles.buttonWrapper}>
            <Pressable onPress={onAcept} style={styles.acceptButton}>
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.buttonText}>수락</Text>
              )}
            </Pressable>
            <Pressable onPress={onReject} style={styles.rejectButton}>
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.buttonText}>수락</Text>
              )}
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  orderContainer: {
    borderRadius: 5,
    margin: 5,
    padding: 10,
    backgroundColor: 'lightgray',
  },
  info: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  eachInfo: {},
  buttonWrapper: {
    flexDirection: 'row',
  },
  acceptButton: {
    backgroundColor: 'blue',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomLeftRadius: 5,
    borderTopLeftRadius: 5,
    flex: 1,
  },
  rejectButton: {
    backgroundColor: 'red',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomRightRadius: 5,
    borderTopRightRadius: 5,
    flex: 1,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default EachOrder;
