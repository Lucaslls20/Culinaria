import React, { useEffect, useState, useCallback } from "react";
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
import { Avatar, Divider, Card, IconButton, Snackbar, Title } from "react-native-paper";
import LinearGradient from "react-native-linear-gradient";
import { auth, db } from "../../Services/fireBaseConfig";
import { logOut } from "../../Components/LogOut/function";
import { collection, query, where, getDocs, getDoc, doc, deleteDoc } from "firebase/firestore";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from '../../Routes';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'

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
  const [isFavoritesEmpty, setIsFavoritesEmpty] = useState(false);
  const [snackbarMessage, setSnackBarMessage] = useState<string>('')
  const [snackbarVisible, setSnackBarVisible] = useState<boolean>(false)
  const [isRemovingFavorite, setIsRemovingFavorite] = useState(false);

  function onDismissSnackBar(): void {
    setSnackBarVisible(false)
  }

  const handleRemoveFavorite = useCallback(async (recipeId: string) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setSnackBarMessage(`Error, You must be logged in to remove a favorite.`);
        setSnackBarVisible(true)
        return;
      }

      setIsRemovingFavorite(true);
      const favoriteDocRef = doc(db, "favorites", recipeId);
      await deleteDoc(favoriteDocRef);

      // Atualiza a lista local de favoritos.
      setFavorites((prevFavorites) =>
        prevFavorites.filter((favorite) => favorite.id !== recipeId)
      );
      setSnackBarMessage(`Success, Recipe removed from favorites.`);
      setSnackBarVisible(true)
    } catch (error) {
      console.error("Error removing favorite:", error);
      Alert.alert("Error", "Could not remove the recipe.");
    } finally {
      setIsRemovingFavorite(false);
    }
  }, []);

  const favoritesEmpty = () => (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ color: COLORS.shadow, textAlign: 'center', fontSize: 25, fontWeight: 'bold' }}>Your favorites list is still empty.</Text>
    </View>
  )

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

  const fetchFavorites = useCallback(async () => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      Alert.alert("Error", "You must be logged in to view bookmarks.");
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
      setIsFavoritesEmpty(favoritesList.length === 0);
    }
    catch (error) {
      console.error("Error fetching favorites:", error);
      Alert.alert("Error", "Could not load favorites.");
    } finally {
      setLoadingFavorites(false);
    }
  }, []);

  const menuItems = [
    { id: '6', title: 'Terms and Conditions', icon: 'file-document-multiple-outline', onPress: () => navigation.navigate('TermsAndConditions') },
    { id: "2", title: "Favorites Recipes", icon: "heart", onPress: fetchFavorites },
    { id: "3", title: "Favorites Videos", icon: "vimeo", onPress: () => navigation.navigate('FavoriteVideos') },
    { id: "4", title: "Privacy Policy", icon: "file-document", onPress: () => navigation.navigate('PrivacyPolitic') },
    { id: "1", title: "Settings", icon: "cog", onPress: () => navigation.navigate('Settings') },
    { id: "5", title: "Log out", icon: "exit-to-app", onPress: logOut },
  ];

  const keyExtractor = (item: { id: string }) => `menu-item-${item.id}`;

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
          windowSize={5}
          maxToRenderPerBatch={5}
          getItemLayout={(data, index) => ({
            length: 60,
            offset: 60 * index,
            index,
          })}
        />

      </LinearGradient>

      <Modal visible={isFavoritesVisible} animationType="slide" onRequestClose={() => setFavoritesVisible(false)}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Favorites</Text>
          {loadingFavorites ? (
            <ActivityIndicator size="large" color={COLORS.primary} />
          ) : isFavoritesEmpty ? (
            favoritesEmpty()
          ) : (
            <FlatList
              data={favorites}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => { }}>
                  <Card style={styles.card}>
                    <Card.Cover source={{ uri: item.image }} />
                    <Card.Content>
                      <View style={styles.cardContent}>
                        <Text style={styles.cardTitle}>{item.title}</Text>
                        <MaterialCommunityIcons
                          name="delete"
                          color={COLORS.primary}
                          size={30}
                          style={{ textAlignVertical: 'center' }}
                          onPress={() => handleRemoveFavorite(item.id)}
                        />
                      </View>
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

      <Snackbar
        visible={snackbarVisible}
        onDismiss={onDismissSnackBar}
        duration={4000}
        style={{ backgroundColor: COLORS.primary }}
        action={{
          label: "Dismiss",
          onPress: () => setSnackBarVisible(false),
        }}
      >
        {snackbarMessage}
      </Snackbar>
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
  cardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    textAlign: 'center',
    marginRight: 10,
    marginHorizontal: 10,
    marginTop: 10
  },
  snackbarText: {
    color: COLORS.placeholder,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default Profile;