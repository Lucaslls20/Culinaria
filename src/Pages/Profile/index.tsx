import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Text,
  TouchableOpacity,
  Alert,
  Modal,
  ActivityIndicator,
} from "react-native";
import { Avatar, Divider, Card } from "react-native-paper";
import LinearGradient from "react-native-linear-gradient";
import { auth, db } from "../../Services/fireBaseConfig";
import { logOut } from "../../Components/LogOut/function";
import { collection, query, where, getDocs, getDoc, doc } from "firebase/firestore";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from '../../Routes';

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

interface Favorite {
  id: string;
  title: string;
  image: string;
}

type ProfileProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Tabs'>
}

const Profile = ({ navigation }: ProfileProps) => {

  const [user, setUser] = useState<{
    displayName: string | null;
    email: string | null;
    photoURL: string | null;
  }>({
    displayName: null,
    email: null,
    photoURL: null,
  });

  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [isFavoritesVisible, setFavoritesVisible] = useState(false);
  const [loadingFavorites, setLoadingFavorites] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Favorite | null>(null);
  const [recipeDetails, setRecipeDetails] = useState<any>(null);
  const [isRecipeModalVisible, setRecipeModalVisible] = useState(false);
  const [loadingRecipe, setLoadingRecipe] = useState(false);

  useEffect(() => {
    const fetchUserDetails = async () => {
      const currentUser = auth.currentUser;

      if (currentUser) {
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userDocRef);

        setUser({
          displayName: userDoc.exists() ? userDoc.data()?.name : currentUser.displayName,
          email: currentUser.email,
          photoURL: currentUser.photoURL,
        });
      }
    };

    fetchUserDetails();
  }, []);
  const fetchFavorites = async () => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      Alert.alert("Erro", "Você precisa estar logado para visualizar os favoritos.");
      return;
    }

    setLoadingFavorites(true);
    try {
      const favoritesRef = collection(db, "favorites");
      const q = query(favoritesRef, where("userId", "==", currentUser.uid));
      const querySnapshot = await getDocs(q);

      const favoritesList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Omit<Favorite, 'id'>),
      }));

      setFavorites(favoritesList);
      setFavoritesVisible(true);
    } catch (error) {
      console.error("Erro ao buscar favoritos:", error);
      Alert.alert("Erro", "Não foi possível carregar os favoritos.");
    } finally {
      setLoadingFavorites(false);
    }
  };

  const fetchRecipeDetails = async (id: string) => {
    setLoadingRecipe(true);
    try {
      const response = await fetch(
        `https://api.spoonacular.com/recipes/${id}/information?apiKey=7f5896bcc0644617a509b22ffc142782` // completar está faltando a chave da api por segurança
      );
  
      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }
  
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Resposta não é um JSON válido.");
      }
  
      const data = await response.json();
      setRecipeDetails(data);
      setRecipeModalVisible(true);
    } catch (error) {
      console.error("Erro ao buscar detalhes da receita:",error);
      Alert.alert("Erro", "Não foi possível carregar os detalhes da receita.");
    } finally {
      setLoadingRecipe(false);
    }
  };

 
  {/* { id: "1", title: "Order History", icon: "history", onPress: () => navigation.navigate('OrderHistory') }, */}
  // tirei o orderHistory por enquanto

  const menuItems = [
   
    { id: "1", title: "Settings", icon: "cog", onPress: () =>navigation.navigate('Settings') },
    { id: "2", title: "Favorites", icon: "heart", onPress: fetchFavorites },
    { id: "3", title: "Privacy Policy", icon: "file-document", onPress:() => navigation.navigate('PrivacyPolitic') },
    { id: "4", title: "Log out", icon: "exit-to-app", onPress: logOut },
  ];

  const keyExtractor = (item: { id: string }) => `menu-item-${item.id}`;

  {favorites.length === 0 && !loadingFavorites && (
    <Text style={{ textAlign: "center", marginTop: 20 }}>
        Nenhum favorito encontrado.
    </Text>
)}

const renderMenuItem = ({ item }: { item: typeof menuItems[0] }) => (
  <TouchableOpacity
    style={styles.menuItem}
    onPress={item.onPress}
    activeOpacity={0.6}
  >
    <View style={styles.iconContainer}>
      <Avatar.Icon
        size={40}
        icon={item.icon}
        color={COLORS.primary}
        style={{ backgroundColor: COLORS.secondary }}
      />
    </View>
    <Text style={styles.menuText}>{item.title}</Text>
    <Text style={styles.arrow}>{">"}</Text>
  </TouchableOpacity>
);


  return (
    <>
      <LinearGradient colors={[COLORS.secondary, COLORS.white]} style={styles.container}>
        <View style={styles.header}>
          <Avatar.Image
            size={100}
            source={{
              uri: user.photoURL || "https://cdn.pixabay.com/photo/2020/08/23/06/54/cooking-5510047_960_720.png",
            }}
            style={{ backgroundColor: COLORS.cardBackground }}
          />
          <Text style={styles.name}>{user.displayName || "User"}</Text>
          <Text style={styles.email}>{user.email || "email@exemplo.com"}</Text>
        </View>

        <Divider style={styles.divider} />

        <FlatList
          data={menuItems}
          renderItem={renderMenuItem}
          keyExtractor={keyExtractor}
          initialNumToRender={4}
          contentContainerStyle={styles.listContainer}
      />

      </LinearGradient>

      <Modal visible={isFavoritesVisible} animationType="slide" onRequestClose={() => setFavoritesVisible(false)}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Favorites</Text>
          {loadingFavorites ? (
            <ActivityIndicator size="large" color={COLORS.primary} />
          ) : (
            <FlatList
              data={favorites}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => console.log(setRecipeDetails)}>
                  <Card style={styles.card}>
                    <Card.Cover source={{ uri: item.image }} />
                    <Card.Content>
                      <Text style={styles.cardTitle}>{item.title}</Text>
                    </Card.Content>
                  </Card>
                </TouchableOpacity>
              )}
            />
          )}
          <TouchableOpacity style={styles.closeButton} onPress={() => setFavoritesVisible(false)}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>

    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    marginVertical: 20,
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.textPrimary,
    marginTop: 10,
  },
  email: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 5,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.shadow,
    marginHorizontal: 20,
    marginVertical: 10,
  },
  listContainer: {
    paddingHorizontal: 20,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.shadow,
  },
  iconContainer: {
    marginRight: 15,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  arrow: {
    fontSize: 18,
    color: COLORS.placeholder,
  },
  modalContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: COLORS.secondary,
  },
  modalContent: {
    fontSize: 16,
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  closeButton: {
    backgroundColor: COLORS.primary,
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  closeButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  card: {
    marginBottom: 16,
    borderRadius: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 8,
    color: COLORS.textPrimary,
  },
});

export default Profile;
