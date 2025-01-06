import React, { useEffect, useState } from "react";
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity } from "react-native";
import { WebView } from "react-native-webview";
import { auth, db } from '../../Services/fireBaseConfig'
import { doc, getDoc } from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";

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

  const renderFavoriteItem = ({ item }: { item: { id: string; title: string; url: string } }) => (
    <View style={styles.videoContainer}>
      <WebView source={{ uri: item.url }} style={styles.video} javaScriptEnabled allowsFullscreenVideo />
      <Text style={styles.title}>{item.title}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={{marginBottom:20}}>
      <Text style={{fontSize:24, fontWeight:'bold', color:COLORS.textPrimary, marginBottom:5, marginTop:10}}>Favorites Videos</Text>
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : favorites.length > 0 ? (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id}
          renderItem={renderFavoriteItem}
        />
      ) : (
        <Text style={styles.noFavoritesText}>Nenhum vídeo favorito encontrado.</Text>
      )}
      <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
        <Text style={styles.closeButtonText}>Close</Text>
      </TouchableOpacity>
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
    marginBottom: 20,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    overflow: "hidden",
    elevation: 3,
  },
  video: {
    height: 200,
  },
  title: {
    padding: 4,
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
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
  },
  closeButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default FavoriteVideos;
