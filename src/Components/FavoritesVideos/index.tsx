import React, { useEffect, useState } from "react";
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity,Alert } from "react-native";
import { Snackbar } from "react-native-paper";
import { WebView } from "react-native-webview";
import { auth, db } from '../../Services/fireBaseConfig'
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";
import FontAwesome from 'react-native-vector-icons/FontAwesome'

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

const FavoriteVideos = () => {
  const [favorites, setFavorites] = useState<{ id: string; title: string; url: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const navigation = useNavigation()

  const fetchFavorites = async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error("Usuário não autenticado");

      const userFavoritesRef = doc(db, "users", userId);
      const docSnapshot = await getDoc(userFavoritesRef);

      if (docSnapshot.exists()) {
        const favoriteIds = docSnapshot.data()?.favorites || [];
        if (favoriteIds.length > 0) {
          const videos = favoriteIds.map((id: string) => ({
            id,
            // title: `Your Favorites Videos`, // Adapte para buscar títulos reais se necessário
            url: `https://www.youtube.com/embed/${id}`,
          }));
          setFavorites(videos);
        }
      }
    } catch (error) {
      console.error("Erro ao buscar favoritos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const removeFavorite = async (id: string) => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error("Usuário não autenticado");

      const userFavoritesRef = doc(db, "users", userId);
      const updatedFavorites = favorites.filter((video) => video.id !== id);
      await updateDoc(userFavoritesRef, { favorites: updatedFavorites.map((video) => video.id) });

      setFavorites(updatedFavorites);
      setSnackbarMessage("Vídeo removido dos favoritos.");
      setSnackbarVisible(true);
    } catch (error) {
      console.error("Erro ao remover favorito:", error);
      setSnackbarMessage("Erro ao remover favorito.");
      setSnackbarVisible(true);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);


  const renderFavoriteItem = ({ item }: { item: { id: string; title: string; url: string } }) => (
    <TouchableOpacity style={styles.videoContainer}>
      <WebView source={{ uri: item.url }} style={styles.video} javaScriptEnabled allowsFullscreenVideo />
      <View style={styles.row}>
        <Text style={styles.title}>{item.title}</Text>
        <TouchableOpacity onPress={() => removeFavorite(item.id)} style={styles.iconContainer}>
          <FontAwesome name="trash" size={20} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
  

  return (
    <View style={styles.container}>
      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 5, marginTop: 10 }}>Favorites Videos</Text>
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : favorites.length > 0 ? (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id}
          renderItem={renderFavoriteItem}
          initialNumToRender={5}
          windowSize={10}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      ) : (
        <Text style={styles.noFavoritesText}>Nenhum vídeo favorito encontrado.</Text>
      )}
      <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
        <FontAwesome name="arrow-left" size={20} color={COLORS.white} />
        <Text style={styles.closeButtonText}>Close</Text>
      </TouchableOpacity>

      <Snackbar
        visible={snackbarVisible}
        style={{backgroundColor:COLORS.cardBackground}}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        action={{
          label: "Fechar",
          onPress: () => setSnackbarVisible(false),
        }}
      >
       <Text style={{color:'#333'}}>{snackbarMessage}</Text> 
      </Snackbar>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.secondary,
    padding: 10,
  },
  videoContainer: {
    padding: 10,
    marginBottom: 15,
    backgroundColor: COLORS.cardBackground,
    borderRadius: 8,
  },
  video: {
    height: 200,
    borderRadius: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  iconContainer: {
    marginLeft: 10,
    padding: 5,
  },
  noFavoritesText: {
    textAlign: "center",
    fontSize: 18,
    color: "#666",
    marginTop: 20,
  },
  closeButton: {
    backgroundColor: COLORS.primary,
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 5
  },
  closeButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default FavoriteVideos;
