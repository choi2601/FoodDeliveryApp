import * as React from 'react';
import {NavigationContainer, ParamListBase} from '@react-navigation/native';
import {
  createNativeStackNavigator,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import {Text, TouchableHighlight, View, LogBox, Pressable} from 'react-native';
import {useCallback} from 'react';

type RootStackParamList = {
  Home: undefined;
  Details: undefined;
};
type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;
type DetailsScreenProps = NativeStackScreenProps<ParamListBase, 'Details'>;

function HomeScreen({navigation, route}: HomeScreenProps) {
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

export default App;
