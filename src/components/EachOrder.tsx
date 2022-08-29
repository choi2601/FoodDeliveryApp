import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Alert,
  Platform,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import {useNavigation, NavigationProp} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import axios, {AxiosError} from 'axios';
import Config from 'react-native-config';
import NaverMapView, {Marker, Path} from 'react-native-nmap';
import {RootState} from '../store/reducer';
import orderSlice, {Order} from '../slices/order';
import {LoggedInParamList} from '../../App';
import getDistanceFromLatLonInKm from '../util';

interface EachOrderProps {
  item: Order;
}

function EachOrder({item}: EachOrderProps) {
  const dispatch = useDispatch();
  const navigation = useNavigation<NavigationProp<LoggedInParamList>>();

  const accessToken = useSelector((state: RootState) => state.user.accessToken);

  const {start, end} = item;

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
      setLoading(true);
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
        <Text style={styles.eachInfo}>
          {getDistanceFromLatLonInKm(
            start.latitude,
            start.longitude,
            end.latitude,
            end.longitude,
          ).toFixed(1)}
          km
        </Text>
      </Pressable>
      {detail && (
        <View>
          <View
            style={{
              width: Dimensions.get('window').width - 30,
              height: 200,
              marginTop: 10,
            }}>
            <NaverMapView
              style={{width: '100%', height: '100%'}}
              zoomControl={true}
              center={{
                zoom: 10,
                tilt: 20,
                latitude: (start.latitude + end.latitude) / 2,
                longitude: (start.longitude + end.longitude) / 2,
              }}>
              <Marker
                coordinate={{
                  latitude: start.latitude,
                  longitude: start.longitude,
                }}
                pinColor="blue"
              />
              <Path
                coordinates={[
                  {
                    latitude: start.latitude,
                    longitude: start.longitude,
                  },
                  {latitude: end.latitude, longitude: end.longitude},
                ]}
              />
              <Marker
                coordinate={{latitude: end.latitude, longitude: end.longitude}}
              />
            </NaverMapView>
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
                <Text style={styles.buttonText}>거절</Text>
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
