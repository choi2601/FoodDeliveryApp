import React, {useCallback} from 'react';
import {FlatList} from 'react-native';
import {useSelector} from 'react-redux';
import {RootState} from '../store/reducer';
import EachOrder from '../components/EachOrder';
import {Order} from '../slices/order';

function Orders() {
  const orders = useSelector((state: RootState) => state.order.orders);

  const renderItem = useCallback(({item}: {item: Order}) => {
    return <EachOrder item={item} />;
  }, []);

  return (
    <FlatList
      data={orders}
      keyExtractor={item => item.orderId}
      renderItem={renderItem}
    />
  );
}

export default Orders;
