import React, { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from "react-native";
import * as Animatable from "react-native-animatable";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { Snackbar } from "react-native-paper";
import { RootStackParamList } from "../../Routes";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../../Services/fireBaseConfig";

const COLORS = {
  primary: "#FF7043",
  secondary: "#FFF3E0",
  textPrimary: "#333",
  white: "#FFF",
  error: "#FF5252",
  success: "#4CAF50",
  placeholder: "#666",
};

type RegisterScreenNavigatorProps = NativeStackNavigationProp<RootStackParamList>;

export default function Register() {
  const navigation = useNavigation<RegisterScreenNavigatorProps>();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarColor, setSnackbarColor] = useState(COLORS.success);
  const [loading, setLoading] = useState(false);

  const showSnackbar = (message: string, color: string) => {
    setSnackbarMessage(message);
    setSnackbarColor(color);
    setSnackbarVisible(true);
  };

  const handleRegister = async () => {
    if (!name || !email || !password) {
      showSnackbar("Preencha todos os campos!", COLORS.error);
      return;
    }

    if (password.length < 6) {
      showSnackbar("A senha deve ter pelo menos 6 caracteres!", COLORS.error);
      return;
    }

    setLoading(true); // Mostra o indicador de carregamento
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        name,
        email,
        createdAt: new Date(),
      });

      showSnackbar("Cadastro realizado com sucesso!", COLORS.success);
      navigation.reset({
        index: 0,
        routes: [{ name: "Tabs" }],
      });
    } catch (error: any) {
      let errorMessage = "Erro ao registrar. Tente novamente!";
      if (error.code === "auth/email-already-in-use") {
        errorMessage = "Email já está em uso!";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "A senha deve ter pelo menos 6 caracteres!";
      }
      showSnackbar(errorMessage, COLORS.error);
    } finally {
      setLoading(false); // Finaliza o indicador de carregamento
    }
  };

  return (
    <View style={styles.container}>
      <Animatable.View animation="fadeInLeft" delay={500} style={styles.containerHeader}>
        <Text style={styles.message}>Crie sua conta!</Text>
      </Animatable.View>

      <Animatable.View animation="fadeInUp" style={styles.containerForm}>
        <Text style={styles.title}>Nome</Text>
        <View style={styles.inputContainer}>
          <Icon name="account-outline" size={20} color={COLORS.primary} />
          <TextInput
            placeholder="Digite seu nome..."
            style={styles.input}
            placeholderTextColor={COLORS.placeholder}
            value={name}
            onChangeText={setName}
          />
        </View>

        <Text style={styles.title}>Email</Text>
        <View style={styles.inputContainer}>
          <Icon name="email-outline" size={20} color={COLORS.primary} />
          <TextInput
            placeholder="Digite seu email..."
            style={styles.input}
            placeholderTextColor={COLORS.placeholder}
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <Text style={styles.title}>Senha</Text>
        <View style={styles.inputContainer}>
          <Icon name="lock-outline" size={20} color={COLORS.primary} />
          <TextInput
            placeholder="Digite sua senha..."
            style={styles.input}
            placeholderTextColor={COLORS.placeholder}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
          {loading ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <Text style={styles.buttonText}>Cadastrar</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.buttonBack} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Voltar para tela de Login</Text>
        </TouchableOpacity>
      </Animatable.View>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={2000}
        style={{ backgroundColor: snackbarColor }}
        action={{
          label: "OK",
          onPress: () => setSnackbarVisible(false),
        }}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.primary },
  containerHeader: { marginTop: "14%", marginBottom: "8%", paddingStart: "5%" },
  message: { fontSize: 28, fontWeight: "bold", color: COLORS.white },
  containerForm: {
    backgroundColor: COLORS.secondary,
    flex: 1,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: "5%",
  },
  title: { fontSize: 18, fontWeight: "bold", color: COLORS.textPrimary, marginTop: 20 },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    marginTop: 10,
    marginBottom: 20,
  },
  input: { flex: 1, height: 40, marginLeft: 10, fontSize: 16, color: COLORS.textPrimary },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: { color: COLORS.white, fontSize: 18, fontWeight: "bold" },
  buttonBack: { marginTop: 30, alignSelf: "center" },
  backButtonText: { color: COLORS.primary, fontSize: 14, fontWeight: "bold" },
});
