import React, { useState, useCallback, useMemo } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { Snackbar } from "react-native-paper";
import * as Animatable from "react-native-animatable";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import { auth } from "../../Services/fireBaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../Routes";

type LoginScreenNavigatorProps = NativeStackNavigationProp<RootStackParamList>;

 const Login = React.memo(() => {
  const navigation = useNavigation<LoginScreenNavigatorProps>();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    visible: false,
    message: "",
    color: "#4CAF50",
  });

  const togglePasswordVisibility = useCallback(() => {
    setIsVisible((prev) => !prev);
  }, []);

  const showSnackbar = useCallback((message: string, color: string) => {
    setSnackbar({ visible: true, message, color });
  }, []);

  const handleLogin = useCallback(async () => {
    if (!email || !password) {
      showSnackbar("Fill in all fields!", "#FF5252");
      return;
    }

    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigation.reset({
        index: 0,
        routes: [{ name: "Tabs" }],
      });
    } catch (error: any) {
      const errorMessage =
        error.code === "auth/user-not-found"
          ? "User not found"
          : error.code === "auth/wrong-password"
          ? "Incorrect password."
          : "Error when logging in";
      showSnackbar(errorMessage, "#FF5252");
    } finally {
      setIsLoading(false);
    }
  }, [email, password, navigation, showSnackbar]);

  const snackbarProps = useMemo(
    () => ({
      visible: snackbar.visible,
      onDismiss: () => setSnackbar((prev) => ({ ...prev, visible: false })),
      duration: 3000,
      style: { backgroundColor: snackbar.color },
    }),
    [snackbar]
  );

  return (
    <View style={styles.container}>
      <Animatable.View animation="fadeInLeft" delay={500} style={styles.containerHeader}>
        <Text style={styles.message}>Welcome!</Text>
      </Animatable.View>

      <Animatable.View animation="fadeInUp" style={styles.containerForm}>
        <Text style={styles.title}>Email</Text>
        <View style={styles.inputContainer}>
          <Icon name="email-outline" size={20} color="#FF7043" />
          <TextInput
            placeholder="Enter your email..."
            style={styles.input}
            placeholderTextColor="#666"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <Text style={styles.title}>Password</Text>
        <View style={styles.inputContainer}>
          <Icon name="lock-outline" size={20} color="#FF7043" />
          <TextInput
            placeholder="Enter your password"
            style={styles.input}
            placeholderTextColor="#666"
            secureTextEntry={!isVisible}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={togglePasswordVisibility}>
            <MaterialIcons
              name={isVisible ? "visibility" : "visibility-off"}
              size={20}
              color="#FF7043"
            />
          </TouchableOpacity>
        </View>

        <Animatable.View animation="pulse" iterationCount="infinite">
          <TouchableOpacity
            style={[styles.button, isLoading && { opacity: 0.7 }]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Text style={styles.buttonText}>Access</Text>
            )}
          </TouchableOpacity>
        </Animatable.View>

        <TouchableOpacity
          style={styles.buttonRegister}
          onPress={() => navigation.navigate("Register")}
        >
          <Text style={styles.registerButtonText}>
            Don't have an account? <Text style={styles.registerButtonHighlight}>Register</Text>
          </Text>
        </TouchableOpacity>
      </Animatable.View>

      <Snackbar {...snackbarProps}>{snackbar.message}</Snackbar>
    </View>
  );
});

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

export default Login