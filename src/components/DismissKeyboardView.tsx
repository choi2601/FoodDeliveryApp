import React, {PropsWithChildren} from 'react';
import {
  TouchableWithoutFeedback,
  Keyboard,
  StyleProp,
  ViewStyle,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scrollview';

type DismissKeyboardViewProps = {style?: StyleProp<ViewStyle>};

function DismissKeyboardView({
  children,
  ...props
}: PropsWithChildren<DismissKeyboardViewProps>) {
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      {/* <KeyboardAvoidingView
        behavior={Platform.OS === 'android' ? 'position' : 'padding'}
        {...props}
        style={props.style}>
        {children}
      </KeyboardAvoidingView> */}
      <KeyboardAwareScrollView {...props} style={props.style}>
        {children}
      </KeyboardAwareScrollView>
    </TouchableWithoutFeedback>
  );
}

export default DismissKeyboardView;
