import React, { useState, useEffect } from "react";
import {
  FlatList,
  StyleSheet,
  View,
  Dimensions,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import { IconButton, Button, Searchbar } from "react-native-paper";
import { WebView } from "react-native-webview";
import * as Animatable from "react-native-animatable";

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
  duration: string; // Nova informação
}

const API_KEY = ""; // tirei a chave da api por segurança
const BASE_API_URL = `https://api.spoonacular.com/food/videos/search`;

const Videos: React.FC = () => {
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState(""); 
  const [searchLoading, setSearchLoading] = useState(false);

  // Função para embaralhar os vídeos
  const shuffleArray = (array: VideoData[]) => {
    return array.sort(() => Math.random() - 0.5);
  };

  const fetchVideos = async (pageNum: number, query: string = "pasta") => {
    try {
      const url = `${BASE_API_URL}?query=${query}&number=5&offset=${(pageNum - 1) * 5}&apiKey=${API_KEY}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();

      if (data.videos && data.videos.length > 0) {
        const formattedVideos = data.videos.map((video: any) => ({
          id: video.youTubeId,
          title: video.title,
          videoUrl: `https://www.youtube.com/embed/${video.youTubeId}`,
          channel: video.channel,
          duration: video.duration, // Nova informação
        }));

        // Embaralha os vídeos antes de atualizar o estado
        setVideos((prevVideos) =>
          pageNum === 1 ? shuffleArray(formattedVideos) : shuffleArray([...prevVideos, ...formattedVideos])
        );
      } else {
        Alert.alert("Nenhum vídeo encontrado", "Tente novamente mais tarde.");
      }
    } catch (error) {
      console.error("Error fetching videos:", error);
      Alert.alert("Erro", "Não foi possível carregar os vídeos. Tente novamente.");
    } finally {
      setLoading(false);
      setIsFetchingMore(false);
      setButtonLoading(false);
      setSearchLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos(page);
  }, [page]);

  const handleSearch = () => {
    setSearchLoading(true);
    setVideos([]);
    setPage(1);
    fetchVideos(1, searchTerm);
  };

  const loadMoreVideos = () => {
    if (!isFetchingMore) {
      setIsFetchingMore(true);
      setPage((prevPage) => prevPage + 1);
    }
  };

  const reloadVideos = () => {
    setLoading(true);
    setVideos([]);
    setPage(1);
    setSearchTerm("");
    fetchVideos(1);
  };

  if (loading && !searchLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Carregando vídeos...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.secondary }}>
      <Searchbar
        placeholder="Pesquisar receitas..."
        placeholderTextColor={COLORS.placeholder}
        iconColor={COLORS.white}
        value={searchTerm}
        onChangeText={setSearchTerm}
        onSubmitEditing={handleSearch}
        style={styles.searchBar}
        accessibilityLabel="Campo de pesquisa de receitas"
      />
      {searchLoading ? (
        <ActivityIndicator size="large" color={COLORS.primary} />
      ) : (
        <FlatList
          data={videos}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Animatable.View
              animation="fadeInUp"
              duration={500}
              style={styles.videoContainer}
            >
              <WebView
                source={{ uri: item.videoUrl }}
                style={styles.video}
                javaScriptEnabled
                allowsFullscreenVideo
              />
              <View style={styles.overlay}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.channel}>{item.channel}</Text>
                <Text style={styles.duration}>{item.duration}</Text>
                <IconButton
                  icon="play-circle"
                  size={30}
                  style={styles.playIcon}
                  accessibilityLabel="Reproduzir vídeo"
                />
              </View>
            </Animatable.View>
          )}
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
                <Text style={styles.footerButtonText}>
                  Carregar mais vídeos
                </Text>
              </TouchableOpacity>
            )
          }
          onEndReached={loadMoreVideos}
          onEndReachedThreshold={0.5}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      )}
      <Button
        mode="contained"
        onPress={reloadVideos}
        style={styles.reloadButton}
        labelStyle={{ color: COLORS.white }}
        accessibilityLabel="Recarregar vídeos"
      >
        Recarregar
      </Button>
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
    position: "absolute",
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
});

export default Videos;
