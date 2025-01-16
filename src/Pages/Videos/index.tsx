import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  FlatList,
  StyleSheet,
  View,
  Dimensions,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Pressable,
} from "react-native";
import { IconButton, Button, Searchbar } from "react-native-paper";
import { WebView } from "react-native-webview";
import * as Animatable from "react-native-animatable";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { db, auth } from "../../Services/fireBaseConfig";
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove, onSnapshot } from "firebase/firestore";
import Comment from "../../Components/Comment";


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

const { height } = Dimensions.get("window");

interface VideoData {
  id: string;
  title: string;
  videoUrl: string;
  channel: string;
  duration: string;
}


const API_KEY = "7f5896bcc0644617a509b22ffc142782";
const BASE_API_URL = `https://api.spoonacular.com/food/videos/search`;

const Videos: React.FC = () => {
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]); // Armazena IDs dos vídeos favoritos
  const [isCommentVisible, setIsCommentVisible] = useState(false); // Novo estado para o Comment
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);


  const toggleComment = useCallback((videoId: string) => {
    setSelectedVideoId(videoId);
    setIsCommentVisible((prev) => !prev);
  }, []);


  useEffect(() => {
    const fetchFavorites = () => {
      const userId = auth.currentUser?.uid;
      if (!userId) return;

      const userFavoritesRef = doc(db, "users", userId);

      const unsubscribe = onSnapshot(userFavoritesRef, (docSnapshot) => {
        if (docSnapshot.exists()) {
          const favoriteIds = docSnapshot.data()?.favorites || [];
          setFavorites(favoriteIds.map((id: string) => id)); // Mantém os IDs
        }
      });

      return () => unsubscribe();
    };

    fetchFavorites();
  }, []);

  useEffect(() => {
    if (videos.length > 0) {
      const ids = videos.map((video) => video.id);
      const uniqueIds = new Set(ids);
      console.log(`Total IDs: ${ids.length}, IDs Únicos: ${uniqueIds.size}`);
    }
  }, [videos]);



  const toggleFavorite = async (id: string) => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) return;
      const userFavoritesRef = doc(db, "users", userId);
      const docSnapshot = await getDoc(userFavoritesRef);

      if (docSnapshot.exists()) {
        const currentFavorites = docSnapshot.data()?.favorites || [];
        const update = currentFavorites.includes(id)
          ? { favorites: arrayRemove(id) }
          : { favorites: arrayUnion(id) };

        await updateDoc(userFavoritesRef, update);
      } else {
        await setDoc(userFavoritesRef, { favorites: [id] });
      }
    } catch (error) {
      Alert.alert("Erro", "Não foi possível atualizar os favoritos.");
    }
  };


  const getVideoId = (id: string): string => {
    return id.startsWith("http") ? id.split("/").pop() || id : id;
  };

  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const shuffleArray = useCallback((array: VideoData[]): VideoData[] => {
    return [...array].sort(() => Math.random() - 0.5);
  }, []);

  const shuffledVideos = useMemo(() => shuffleArray(videos), [videos, shuffleArray]);

  const fetchVideos = useCallback(async (pageNum: number, query: string = "pasta") => {
    try {
      const url = `${BASE_API_URL}?query=${query}&number=5&offset=${(pageNum - 1) * 5}&apiKey=${API_KEY}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Erro na resposta da API");
      const data = await response.json();

      if (data.videos && data.videos.length > 0) {
        const formattedVideos = data.videos.map((video: any) => ({
          id: video.youTubeId, // Certifique-se de armazenar o ID correto do YouTube
          title: video.title,
          videoUrl: `https://www.youtube.com/embed/${video.youTubeId}`,
          channel: video.channel,
          duration: video.duration,
        }));

        setVideos((prevVideos) =>
          pageNum === 1 ? formattedVideos : [...prevVideos, ...formattedVideos]
        );
      } else {
        console.log("Nenhum vídeo encontrado. Tente novamente mais tarde.");
      }
    } catch (error) {
      console.error("Erro ao buscar vídeos:", error);
      Alert.alert("Erro", "Não foi possível carregar os vídeos.");
    } finally {
      setLoading(false);
      setIsFetchingMore(false);
      setButtonLoading(false);
      setSearchLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVideos(page);
  }, [page, fetchVideos]);

  const handleDebouncedSearch = useCallback(
    (text: string) => {
      setSearchTerm(text);
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      debounceTimeoutRef.current = setTimeout(() => {
        setSearchLoading(true);
        setVideos([]);
        setPage(1);
        fetchVideos(1, text);
      }, 500);
    },
    [fetchVideos]
  );

  const loadMoreVideos = useCallback(() => {
    if (!isFetchingMore) {
      setIsFetchingMore(true);
      setPage((prevPage) => prevPage + 1);
    }
  }, [isFetchingMore]);

  const getItemLayout = (data: ArrayLike<VideoData> | null | undefined, index: number) => ({
    length: height / 2,
    offset: (height / 2) * index,
    index,
  });
  


  const renderVideoItem = ({ item }: { item: any }) => (
    <Animatable.View animation="fadeInUp" style={styles.videoContainer}>
      <WebView source={{ uri: item.videoUrl }} style={styles.video} />
      <View style={styles.overlay}>
        <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">{item.title}</Text>
        <Pressable onPress={() => toggleComment(item.id)}>
          <FontAwesome name="comment-o" size={28} color="#FFF"  />
        </Pressable>
        <Pressable onPress={() => toggleFavorite(item.id)}>
          <FontAwesome
            name={favorites.includes(item.id) ? "heart" : "heart-o"}
            size={28}
            color={favorites.includes(item.id) ? "#FF0015" : "#FFF"}
           
          />
        </Pressable>
      </View>
      {selectedVideoId === item.id && (
      <Comment
        onClose={() => setIsCommentVisible(false)}
        visible={isCommentVisible}
        videoId={item.id}
      />
    )}
    </Animatable.View>
  );
  


  if (loading && !searchLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Fetch videos...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.secondary }}>
      <Searchbar
        placeholder="Search recipes..."
        placeholderTextColor={COLORS.placeholder}
        iconColor={COLORS.white}
        value={searchTerm}
        onChangeText={handleDebouncedSearch}
        style={styles.searchBar}
        accessibilityLabel="Campo de pesquisa de receitas"
      />
      {searchLoading ? (
        <ActivityIndicator size="large" color={COLORS.primary} />
      ) : (
        <FlatList
          data={shuffledVideos}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          renderItem={renderVideoItem}
          getItemLayout={getItemLayout}
          initialNumToRender={5}
          ListFooterComponent={
            buttonLoading ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : (
              <TouchableOpacity
                onPress={() => {
                  setButtonLoading(true);
                  loadMoreVideos();
                }}
                style={styles.footerButton}
                accessibilityLabel="Carregar mais vídeos"
              >
                <Text style={styles.footerButtonText}>Upload more videos</Text>
              </TouchableOpacity>
            )
          }
          onEndReached={loadMoreVideos}
          onEndReachedThreshold={0.5}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      )}
      
    </View>
  );
};



const styles = StyleSheet.create({
  listContainer: {
    paddingBottom: 20,
    backgroundColor: COLORS.secondary,
  },
  videoContainer: {
    height: height / 2,
    backgroundColor: COLORS.cardBackground,
    marginVertical: 10,
    borderRadius: 10,
    overflow: "hidden",
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  video: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    position: "absolute",
    bottom: 10,
    left: 15,
    right: 15,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 5,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap:20
  },
  title: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
    textAlign: "left",
    marginRight: 10,
  },
  channel: {
    color: COLORS.white,
    fontSize: 14,
  },
  duration: {
    color: COLORS.white,
    fontSize: 12,
  },
  playIcon: {
    alignSelf: "center",
    margin: 10
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.secondary,
  },
  loadingText: {
    marginTop: 10,
    color: COLORS.textPrimary,
    fontSize: 16,
  },
  footerButton: {
    backgroundColor: COLORS.primary,
    padding: 10,
    margin: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  footerButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  reloadButton: {
    bottom: 20,
    right: 20,
    backgroundColor: COLORS.primary,
    borderRadius: 50,
    padding: 10,
  },
  searchBar: {
    margin: 10,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    elevation: 5,
  },
  overlayPressable: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Fundo semi-transparente
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000, // Garante que fique acima dos outros elementos
  },
  commentContainer: {
    width: "90%",
    maxHeight: "80%",
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 20,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 10,
  },
});

export default Videos;
