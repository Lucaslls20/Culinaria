import { signOut } from "firebase/auth";
import { auth } from "../../Services/fireBaseConfig"; // Certifique-se de ajustar o caminho correto

export const logOut = async () => {
  try {
    await signOut(auth);
    console.log("Usuário desconectado com sucesso.");
    return true;
  } catch (error) {
    console.error("Erro ao desconectar:", error);
    return false;
  }
};
