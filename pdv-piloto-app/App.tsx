import React, { useState, useEffect } from 'react';
import { StatusBar } from 'react-native';
import { SplashScreen } from './src/screens/SplashScreen';
import { PaymentScreen } from './src/screens/PaymentScreen';

function App(): React.JSX.Element {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Mostrar splash por 2 segundos
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor="#662D91" 
      />
      {showSplash ? <SplashScreen /> : <PaymentScreen />}
    </>
  );
}

export default App;