import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Appbar, Card } from 'react-native-paper';
import { Linking } from 'react-native';
import Feather from 'react-native-vector-icons/Feather'
import { useNavigation } from '@react-navigation/native';

const COLORS = {
  primary: "#FF7043",
  secondary: "#FFF8E1",
  textPrimary: "#4E342E",
  textSecondary: "#757575",
  white: "#FFF",
  cardBackground: "#FFE0B2",
  shadow: "#D7CCC8",
  placeholder: "#FFAB91",
};

const PrivacyPolicyScreen: React.FC = () => {
  const navigation = useNavigation()
  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.header}>
        <View style={{gap:10, flexDirection:'row', marginLeft:10,alignItems:'center', justifyContent:'center'}}>
          <Feather name='arrow-left' size={25} color='#333' onPress={() => navigation.goBack()} />
          <Appbar.Content title="Privacy Policy" color={COLORS.white} />
        </View>
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.title}>Welcome to our Cooking Application!</Text>
            <Text style={styles.paragraph}>
              Your privacy is very important to us. This document explains how we
              collect, use, and protect your information.
            </Text>

            <Text style={styles.subtitle}>1. Information Collected</Text>
            <Text style={styles.paragraph}>
              We use Firebase to manage features such as authentication and data
              storage. The information collected includes your name, email, and
              recipe preferences. We do not share this data with third parties.
            </Text>

            <Text style={styles.subtitle}>2. How We Use Information</Text>
            <Text style={styles.paragraph}>
              The information collected is used to personalize your experience,
              suggest recipes, and improve our services.
            </Text>

            <Text style={styles.subtitle}>3. Security</Text>
            <Text style={styles.paragraph}>
              We adopt strict measures to protect your information. Firebase
              ensures secure and encrypted storage of your data.
            </Text>

            <Text style={styles.subtitle}>4. Your Rights</Text>
            <Text style={styles.paragraph}>
              You can access, correct, or delete your information at any time.
              Contact us for support.
            </Text>

            <Text style={styles.subtitle}>5. Contact</Text>
            <Text style={styles.paragraph} onPress={() => Linking.openURL('mailto:lucasReserva571@gmail.com')}>
              If you have questions about this policy, contact us via email: 
              <Text style={{textDecorationLine:'underline'}}>lucasReserva571@gmail.com</Text>
            </Text>

            <Text style={styles.footer}>
              Thank you for trusting our application! Happy cooking and enjoy your meal!
            </Text>
          </Card.Content>
        </Card>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.secondary,
  },
  header: {
    backgroundColor: COLORS.primary,
  },
  scrollViewContent: {
    padding: 16,
  },
  card: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 8,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 16,
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
  footer: {
    fontSize: 16,
    color: COLORS.textPrimary,
    marginTop: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default PrivacyPolicyScreen;
