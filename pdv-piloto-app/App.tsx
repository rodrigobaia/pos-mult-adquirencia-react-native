import React from 'react';
import { StatusBar } from 'react-native';
import { PaymentScreen } from './src/screens/PaymentScreen';

function App(): React.JSX.Element {
  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#F3F4F6" />
      <PaymentScreen />
    </>
  );
}

export default App;