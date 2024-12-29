import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Snackbar } from "react-native-paper";
import * as Animatable from "react-native-animatable";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { RootStackParamList } from "../../Routes";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { auth } from "../../Services/fireBaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";

type LoginScreenNavigatorProps = NativeStackNavigationProp<RootStackParamList>;

export default function Login() {
  const navigation = useNavigation<LoginScreenNavigatorProps>();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarColor, setSnackbarColor] = useState("#4CAF50");
  const [isLoading, setIsLoading] = useState(false); // Estado de carregamento

  const showSnackbar = (message: string, color: string) => {
    setSnackbarMessage(message);
    setSnackbarColor(color);
    setSnackbarVisible(true);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      showSnackbar("Preencha todos os campos!", "#FF5252");
      return;
    }

    setIsLoading(true); // Ativa o carregamento
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigation.reset({
        index: 0,
        routes: [{ name: "Tabs" }],
      });
    } catch (error: any) {
      let errorMessage = "Erro ao fazer login.";
      if (error.code === "auth/user-not-found") {
        errorMessage = "Usuário não encontrado.";
      } else if (error.code === "auth/wrong-password") {
        errorMessage = "Senha incorreta.";
      }
      showSnackbar(errorMessage, "#FF5252");
    } finally {
      setIsLoading(false); // Desativa o carregamento
    }
  };

  return (
    <View style={styles.container}>
      {/* Header com animação */}
      <Animatable.View animation="fadeInLeft" delay={500} style={styles.containerHeader}>
        <Text style={styles.message}>Bem-vindo(a)!</Text>
      </Animatable.View>

      {/* Formulário com animação */}
      <Animatable.View animation="fadeInUp" style={styles.containerForm}>
        {/* Campo de Email */}
        <Text style={styles.title}>Email</Text>
        <View style={styles.inputContainer}>
          <Icon name="email-outline" size={20} color="#FF7043" />
          <TextInput
            placeholder="Digite seu email..."
            style={styles.input}
            placeholderTextColor="#666"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        {/* Campo de Senha */}
        <Text style={styles.title}>Senha</Text>
        <View style={styles.inputContainer}>
          <Icon name="lock-outline" size={20} color="#FF7043" />
          <TextInput
            placeholder="Digite sua senha..."
            style={styles.input}
            placeholderTextColor="#666"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        {/* Botão de Login com loading */}
        <Animatable.View animation="pulse" iterationCount="infinite">
          <TouchableOpacity
            style={[styles.button, isLoading && { opacity: 0.7 }]}
            onPress={handleLogin}
            disabled={isLoading} // Desativa o botão enquanto carrega
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Text style={styles.buttonText}>Acessar</Text>
            )}
          </TouchableOpacity>
        </Animatable.View>

        {/* Botão de Cadastro */}
        <TouchableOpacity
          style={styles.buttonRegister}
          onPress={() => navigation.navigate("Register")}
        >
          <Text style={styles.registerButtonText}>
            Não possui conta? <Text style={styles.registerButtonHighlight}>Cadastre-se</Text>
          </Text>
        </TouchableOpacity>
      </Animatable.View>

      {/* Snackbar para mensagens */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        action={{
          label: "OK",
          onPress: () => setSnackbarVisible(false),
        }}
        style={{ backgroundColor: snackbarColor }}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FF7043",
  },
  containerHeader: {
    marginTop: "14%",
    marginBottom: "8%",
    paddingStart: "5%",
  },
  message: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFF",
  },
  containerForm: {
    backgroundColor: "#FFF3E0",
    flex: 1,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: "5%",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginTop: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    marginTop: 10,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    height: 40,
    marginLeft: 10,
    fontSize: 16,
    color: "#333",
  },
  button: {
    backgroundColor: "#FF7043",
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  buttonRegister: {
    marginTop: 30,
    alignSelf: "center",
  },
  registerButtonText: {
    color: "#666",
    fontSize: 14,
  },
  registerButtonHighlight: {
    color: "#FF7043",
    fontWeight: "bold",
  },
});
