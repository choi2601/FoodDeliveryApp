import React, {useState} from 'react';
import {NavigationContainer, ParamListBase} from '@react-navigation/native';
import {
  createNativeStackNavigator,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import {
  Text,
  TouchableHighlight,
  View,
  LogBox,
  Pressable,
  StyleSheet,
  Dimensions,
} from 'react-native';
import {useCallback} from 'react';

type RootStackParamList = {
  Home: undefined;
  Details: undefined;
};
type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;
type DetailsScreenProps = NativeStackScreenProps<ParamListBase, 'Details'>;

function HomeScreen({navigation, route}: HomeScreenProps) {
  const [isVisible, setIsVisible] = useState<boolean>(false);

  const onClick = useCallback(() => {
    navigation.navigate('Details');
  }, [navigation]);

  return (
    <>
      <View
        style={{
          flex: 1,
          backgroundColor: 'yellow',
          alignItems: 'flex-end',
          justifyContent: 'center',
        }}>
        <Pressable
          onPress={onClick}
          style={{paddingTop: 20, paddingBottom: 20, backgroundColor: 'blue'}}>
          <Text style={{color: 'white'}}>Home Screen</Text>
        </Pressable>
      </View>
      <View style={{flex: 2, backgroundColor: 'orange'}}>
        <Text>Seconds</Text>
      </View>
      <Pressable
        style={{position: 'absolute', ...StyleSheet.absoluteFillObject}}
        onPress={() => setIsVisible(true)}>
        <Text>모달 켜기</Text>
      </Pressable>
      {isVisible && (
        <Pressable onPress={() => setIsVisible(false)} style={styles.modal}>
          <View style={styles.modalInner}>
            <Text
              style={{flex: 5, position: 'relative', backgroundColor: 'blue'}}>
              Hello
            </Text>
            <View style={{flexDirection: 'row', marginTop: 20}}>
              <Pressable style={{flex: 1, alignItems: 'center'}}>
                <Text>네</Text>
              </Pressable>
              <Pressable style={{flex: 1, alignItems: 'center'}}>
                <Text>아니요</Text>
              </Pressable>
            </View>
          </View>
        </Pressable>
      )}
    </>
  );
}

function DetailsScreen({navigation}: DetailsScreenProps) {
  const onClick = useCallback(() => {
    navigation.navigate('Home');
  }, [navigation]);

  const onBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return (
    <>
      <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
        <TouchableHighlight onPress={onClick}>
          <Text>Details Screen</Text>
        </TouchableHighlight>
      </View>
      <View>
        <Pressable onPress={onBack}>
          <Text>뒤로 가기</Text>
        </Pressable>
      </View>
    </>
  );
}

const Stack = createNativeStackNavigator();

function App() {
  LogBox.ignoreLogs(['Remote debugger']);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{title: 'Overview', headerShown: false}}
        />
        <Stack.Screen name="Details">
          {props => <DetailsScreen {...props} />}
        </Stack.Screen>
        {/* <Stack.Screen
          name='Details'
          component={DetailScreen}
        /> */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  modal: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    // position: 'absolute',
    // left: 0,
    // right: 0,
    // top: 0,
    // bottom: 0,
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
  },
  modalInner: {
    position: 'absolute',
    backgroundColor: 'orange',
    top: 50,
    bottom: 50,
    left: 50,
    right: 50,
    width: Dimensions.get('window').width - 100,
    height: 300,
    marginVertical: 50,
    borderRadius: 20,
    padding: 20,
    shadowColor: 'black',
    shadowOpacity: 0.5,
    shadowRadius: 5,
    shadowOffset: {width: 5, height: 5},
    elevation: 15, // 안드로이드 그림자 효과
  },
});

export default App;
