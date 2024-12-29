import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Appbar, Card } from 'react-native-paper';

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
  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.header}>
        <Appbar.Content title="Política de Privacidade" color={COLORS.white} />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.title}>Bem-vindo à nossa aplicação de Culinária!</Text>
            <Text style={styles.paragraph}>
              Sua privacidade é muito importante para nós. Este documento explica como
              coletamos, usamos e protegemos suas informações.
            </Text>

            <Text style={styles.subtitle}>1. Informações Coletadas</Text>
            <Text style={styles.paragraph}>
              Utilizamos o Firebase para gerenciar funcionalidades como autenticação
              e armazenamento de dados. As informações coletadas incluem seu nome,
              email e preferências de receitas. Não compartilhamos esses dados com
              terceiros.
            </Text>

            <Text style={styles.subtitle}>2. Como Utilizamos as Informações</Text>
            <Text style={styles.paragraph}>
              As informações coletadas são utilizadas para personalizar sua
              experiência, sugerir receitas e aprimorar nossos serviços.
            </Text>

            <Text style={styles.subtitle}>3. Segurança</Text>
            <Text style={styles.paragraph}>
              Adotamos medidas rigorosas para proteger suas informações. O Firebase
              garante o armazenamento seguro e criptografado de seus dados.
            </Text>

            <Text style={styles.subtitle}>4. Seus Direitos</Text>
            <Text style={styles.paragraph}>
              Você pode acessar, corrigir ou excluir suas informações a qualquer
              momento. Entre em contato conosco para suporte.
            </Text>

            <Text style={styles.subtitle}>5. Contato</Text>
            <Text style={styles.paragraph}>
              Caso tenha dúvidas sobre esta política, entre em contato pelo email:
              lucasReserva571@gmail.com
            </Text>

            <Text style={styles.footer}>
              Agradecemos por confiar em nossa aplicação! Boas receitas e bom apetite!
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
