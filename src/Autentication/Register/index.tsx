import React, { useState, useCallback, memo } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import * as Animatable from "react-native-animatable";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { Snackbar } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../../Services/fireBaseConfig";
import { RootStackParamList } from "../../Routes";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";


const COLORS = {
  primary: "#FF7043",
  secondary: "#FFF3E0",
  textPrimary: "#333",
  white: "#FFF",
  error: "#FF5252",
  success: "#4CAF50",
  placeholder: "#666",
};

type RegisterScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, "Register">



// Tipos
type SnackbarProps = {
  visible: boolean;
  message: string;
  color: string;
  onDismiss: () => void;
};

type InputFieldProps = {
  label: string;
  icon: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address";
  onToggleVisibility?: () => void;
  isVisible?: boolean;
};

// Componente Snackbar
const CustomSnackbar = memo(({ visible, message, color, onDismiss }: SnackbarProps) => (
  <Snackbar
    visible={visible}
    onDismiss={onDismiss}
    duration={2000}
    style={{ backgroundColor: color }}
    action={{
      label: "OK",
      onPress: onDismiss,
    }}
  >
    {message}
  </Snackbar>
));

// Componente InputField
const InputField = memo(
  ({ label, icon, onToggleVisibility, isVisible, ...props }: InputFieldProps) => (
    <>
      <Text style={styles.title}>{label}</Text>
      <View style={styles.inputContainer}>
        <Icon name={icon} size={20} color={COLORS.primary} />
        <TextInput
          style={styles.input}
          placeholderTextColor={COLORS.placeholder}
          {...props}
        />
        {onToggleVisibility && (
          <TouchableOpacity onPress={onToggleVisibility}>
            <MaterialIcons
              name={isVisible ? "visibility" : "visibility-off"}
              size={20}
              color={COLORS.primary}
            />
          </TouchableOpacity>
        )}
      </View>
    </>
  )
);

export default function Register() {
  const navigation = useNavigation<RegisterScreenNavigationProp>();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarColor, setSnackbarColor] = useState(COLORS.success);
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const showPassword = useCallback(() => setIsVisible((prev) => !prev), []);
  const showSnackbar = useCallback((message: string, color: string) => {
    setSnackbarMessage(message);
    setSnackbarColor(color);
    setSnackbarVisible(true);
  }, []);

  const handleRegister = useCallback(async () => {
    if (!name || !email || !password) {
      showSnackbar("Fill in all fields!", COLORS.error);
      return;
    }
  
    if (password.length < 6) {
      showSnackbar("Password must be at least 6 characters long!", COLORS.error);
      return;
    }
  
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      await setDoc(doc(db, "users", user.uid), {
        name,
        email,
        createdAt: new Date(),
      });
  
      showSnackbar("Registration completed successfully!", COLORS.success);
  
      navigation.reset({
        index: 0,
        routes: [{ name: "Tabs" as keyof RootStackParamList }], // Adicionado as keyof
      });
    } catch (error: any) {
      const errorMessage =
        error.code === "auth/email-already-in-use"
          ? "Email already in use!"
          : error.code === "auth/weak-password"
          ? "Password must be at least 6 characters long!"
          : "Error registering. Try again!";
      showSnackbar(errorMessage, COLORS.error);
    } finally {
      setLoading(false);
    }
  }, [name, email, password, navigation, showSnackbar]);

  return (
    <View style={styles.container}>
      <Animatable.View animation="fadeInLeft" delay={500} style={styles.containerHeader}>
        <Text style={styles.message}>Create your account!</Text>
      </Animatable.View>

      <Animatable.View animation="fadeInUp" style={styles.containerForm}>
        <InputField
          label="Name"
          placeholder="Enter your name..."
          value={name}
          onChangeText={setName}
          icon="account-outline"
        />
        <InputField
          label="Email"
          placeholder="Enter your email..."
          value={email}
          onChangeText={setEmail}
          icon="email-outline"
          keyboardType="email-address"
        />
        <InputField
          label="Password"
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
          icon="lock-outline"
          secureTextEntry={!isVisible}
          onToggleVisibility={showPassword}
          isVisible={isVisible}
        />

        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.7 }]}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <Text style={styles.buttonText}>Register</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.buttonBack} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Return to Login screen</Text>
        </TouchableOpacity>
      </Animatable.View>

      <CustomSnackbar
        visible={snackbarVisible}
        message={snackbarMessage}
        color={snackbarColor}
        onDismiss={() => setSnackbarVisible(false)}
      />
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
