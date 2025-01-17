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

const TermsAndConditions: React.FC = () => {
  const navigation = useNavigation()
  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.header} accessible accessibilityLabel="Terms and Conditions Header">
        <View style={{gap:10,flexDirection:'row', marginLeft:10, alignItems:'center', justifyContent:'center'}}>
        <Feather name='arrow-left' size={25} color='#333' onPress={() => navigation.goBack()} />
        <Appbar.Content title="Terms and Conditions" color={COLORS.white} />
        </View>
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.title}>Welcome to Our Cooking Application!</Text>
            <Text style={styles.paragraph}>
              These Terms and Conditions govern your use of our cooking app. By using
              this application, you agree to comply with these terms.
            </Text>

            <Text style={styles.subtitle}>1. Acceptance of Terms</Text>
            <Text style={styles.paragraph}>
              By accessing and using the app, you accept and agree to be bound by these
              Terms and Conditions. If you do not agree, you must not use the app.
            </Text>

            <Text style={styles.subtitle}>2. User Responsibilities</Text>
            <Text style={styles.paragraph}>
              You are responsible for maintaining the confidentiality of your account
              information and for all activities that occur under your account. You must
              not use the app for any unlawful purposes.
            </Text>

            <Text style={styles.subtitle}>3. Content</Text>
            <Text style={styles.paragraph}>
              All content provided on the app is for informational purposes only. We do
              not guarantee the accuracy or completeness of the content, and we reserve
              the right to modify or remove any content at any time.
            </Text>

            <Text style={styles.subtitle}>4. Limitation of Liability</Text>
            <Text style={styles.paragraph}>
              We are not liable for any damages or losses resulting from the use of the
              app. This includes any issues arising from data loss, inaccuracies, or
              other technical failures.
            </Text>

            <Text style={styles.subtitle}>5. Privacy</Text>
            <Text style={styles.paragraph}>
              Please refer to our Privacy Policy for information about how we collect,
              use, and protect your data.
            </Text>

            <Text style={styles.subtitle}>6. Modifications</Text>
            <Text style={styles.paragraph}>
              We reserve the right to modify or update these Terms and Conditions at any
              time. Any changes will be effective immediately upon posting.
            </Text>

            <Text style={styles.subtitle}>7. Contact</Text>
            <Text style={styles.paragraph} onPress={() => Linking.openURL('mailto:lucasReserva571@gmail.com')}>
              If you have any questions or concerns regarding these Terms and Conditions,
              please contact us via email at: <Text style={{textDecorationLine:'underline'}}>lucasReserva571@gmail.com</Text>
            </Text>

            <Text style={styles.footer}>
              Thank you for using our application! We hope you enjoy your culinary journey!
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

export default TermsAndConditions;
