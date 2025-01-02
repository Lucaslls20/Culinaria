import React, { useEffect, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import * as Animatable from 'react-native-animatable';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../Routes';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../Services/fireBaseConfig';
import { CommonActions } from '@react-navigation/native';

type SplashScreenNavigationProps = NativeStackNavigationProp<RootStackParamList>;

const SplashScreen: React.FC = () => {
  const navigation = useNavigation<SplashScreenNavigationProps>();

  const checkAuth = useCallback(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigation.navigate('Tabs');
      } else {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'Welcome' }],
          })
        );
      }
    });

    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    const unsubscribe = checkAuth();
    return () => unsubscribe();
  }, [checkAuth]);

  
  return (
    <View style={styles.container}>
      {/* Título do App com animação */}
      <Animatable.Text animation="bounceInDown" duration={1500} style={styles.title}>
        Cookly
      </Animatable.Text>

      {/* Subtítulo com animação */}
      <Animatable.Text animation="fadeIn" delay={1000} duration={2000} style={styles.subtitle}>
        Delicious recipes and cooking tips
      </Animatable.Text>

      {/* Indicador de carregamento */}
      <ActivityIndicator
        animating={true}
        color="#ffffff"
        size="large"
        style={styles.loader}
      />

      {/* Mensagem no rodapé com animação */}
      <Animatable.Text animation="fadeInUp" delay={2000} duration={2000} style={styles.footerText}>
        Loading the best recipes for you...
      </Animatable.Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FF7043",
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 40,
    color: '#ffffff',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 30,
  },
  loader: {
    marginVertical: 20,
  },
  footerText: {
    position: 'absolute',
    bottom: 30,
    fontSize: 14,
    color: '#ffffff',
    textAlign: 'center',
  },
});

export default SplashScreen;
