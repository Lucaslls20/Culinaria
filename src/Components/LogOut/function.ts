import { Alert } from "react-native";
import { signOut } from "firebase/auth";
import { auth } from "../../Services/fireBaseConfig"; // Certifique-se de ajustar o caminho correto

export const logOut = async () => {
  return new Promise((resolve, reject) => {
    Alert.alert(
      "Confirm Logout",
      "Are you sure you want to leave?",
      [
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => resolve(false),
        },
        {
          text: "Go out",
          style: "destructive",
          onPress: async () => {
            try {
              await signOut(auth);
              console.log("Usuário desconectado com sucesso.");
              resolve(true);
            } catch (error) {
              console.error("Erro ao desconectar:", error);
              reject(error);
            }
          },
        },
      ],
      { cancelable: false }
    );
  });
};
