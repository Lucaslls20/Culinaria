import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Image,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Text, Card, Appbar, Button, Portal, Chip, Provider, Searchbar } from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import axios from 'axios';
import * as Animatable from 'react-native-animatable';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from '../../Routes';
import Modal from 'react-native-modal'

const API_KEY = '7f5896bcc0644617a509b22ffc142782'; // Substitua pela sua chave

type HomeProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Tabs">;
};

interface Recipe {
  id: number;
  title: string;
  image: string;
  readyInMinutes: number;
  servings: number;
}

const Home = ({ navigation }: HomeProps) => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [visible, setVisible] = useState(false);
  const [cuisines, setCuisines] = useState<string[]>(['Italian', 'Mexican', 'Indian', 'Chinese']);
  const [selectedCuisine, setSelectedCuisine] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [hasMoreResults, setHasMoreResults] = useState(true);


  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchRecipes = useCallback(
    async (query: string = '', page = 1, cuisine: string = '') => {
      if (page === 1) setLoading(true);
      else setLoadingMore(true);

      try {
        const response = await axios.get(
          `https://api.spoonacular.com/recipes/complexSearch?apiKey=${API_KEY}&query=${query}&number=10&offset=${(page - 1) * 10}${cuisine ? `&cuisine=${cuisine}` : ''
          }`
        );
        const newRecipes = response.data.results.map((recipe: any) => ({
          id: recipe.id,
          title: recipe.title,
          image: recipe.image,
          readyInMinutes: recipe.readyInMinutes || 0,
          servings: recipe.servings || 0,
        }));

        if (page === 1) {
          setRecipes(newRecipes);
          setFilteredRecipes(newRecipes);
          setHasMoreResults(newRecipes.length > 0);
        } else {
          setRecipes((prevRecipes) => [...prevRecipes, ...newRecipes]);
          setFilteredRecipes((prevRecipes) => [...prevRecipes, ...newRecipes]);
          setHasMoreResults(newRecipes.length > 0);
        }
      } catch (error) {
        console.error('Erro ao buscar receitas:', error);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    []
  );

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);

    if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);

    debounceTimeoutRef.current = setTimeout(() => {
      if (query.trim()) {
        fetchRecipes(query.trim());
      } else {
        fetchRecipes(); // Retorna à lista padrão se o campo de busca for limpo
      }
    }, 500);
  }, [fetchRecipes]);

  const loadMoreRecipes = useCallback(() => {
    if (!loadingMore && hasMoreResults) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchRecipes(searchQuery, nextPage);
    }
  }, [currentPage, fetchRecipes, hasMoreResults, loadingMore, searchQuery]);

  const renderRecipe = ({ item }: { item: Recipe }) => (
    <Animatable.View animation="slideInUp" duration={500} style={styles.cardWrapper}>
      <Card style={styles.card}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.image }} style={styles.image} accessibilityLabel={`Imagem da receita ${item.title}`} />
        </View>
        <Card.Content>
          <Text variant="titleLarge" style={styles.recipeTitle}>{item.title}</Text>
        </Card.Content>
        <View style={styles.buttonContainer}>
          <Button
            mode="outlined"
            icon="eye-outline"
            textColor="#FFF"
            style={styles.cardButton}
            labelStyle={{ fontWeight: 'bold' }}
            accessibilityRole="button"
            accessibilityLabel={`View recipe: ${item.title}`}
            buttonColor="#FF5722"
            onPress={() => navigation.navigate("RecipeDetails", { recipeId: item.id })}>
            See Recipe
          </Button>
        </View>
      </Card>
    </Animatable.View>
  );

  useEffect(() => {
    fetchRecipes();
  }, []);

  return (
    <Provider>
      <View style={styles.container}>
        <LinearGradient colors={['#FF7043', '#FF5722']} style={styles.headerGradient}>
          <Appbar.Header style={styles.header}>
            <Image source={{ uri: 'https://img.icons8.com/ios/50/ffffff/cooking-book.png' }} style={styles.headerIcon} accessibilityLabel="Ícone de livro de receitas" />
            <Appbar.Content title="Recipes" titleStyle={styles.headerTitle} />
            <Icon
              name="food"
              size={30}
              onPress={() => setVisible(true)}
              color="white"
              style={styles.menuIcon}
              accessibilityLabel="Abrir filtro de tipos de comida"
            />
          </Appbar.Header>
          <Searchbar
            placeholder="Search recipes..."
            placeholderTextColor="white"
            iconColor="white"
            onChangeText={handleSearch}
            inputStyle={{ color: 'white' }}
            value={searchQuery}
            style={styles.searchBar}
            accessibilityLabel="Campo de busca de receitas"
          />
        </LinearGradient>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF7043" />
            <Text style={styles.loadingText}>Looking for recipes, wait a minute...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredRecipes}
            renderItem={renderRecipe}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContent}
            onEndReached={loadMoreRecipes}
            onEndReachedThreshold={0.5}
            getItemLayout={(data, index) => ({
              length: 150, // Altura aproximada de cada item
              offset: 150 * index,
              index,
            })}
            initialNumToRender={10}
            maxToRenderPerBatch={5}
            windowSize={10}

            ListFooterComponent={
              loadingMore ? (
                <View style={styles.loadingMoreContainer}>
                  <ActivityIndicator size="small" color="#FF7043" />
                </View>
              ) : null
            }
          />
        )}

        <Portal>
          <Modal
            isVisible={visible}
            onBackdropPress={() => setVisible(false)}
            onSwipeComplete={() => setVisible(false)}
            swipeDirection="down"
            style={styles.modal}
          >
            <Animatable.View animation="slideInUp" duration={400} style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select a Cuisine</Text>
              <View style={styles.chipContainer}>
                <Chip style={styles.chip} selected={selectedCuisine === ''} onPress={() => {
                  setSelectedCuisine(''); // Remove seleção de culinária específica
                  fetchRecipes('', 1); // Carrega receitas como na tela inicial
                  setVisible(false); // Fecha o modal
                }}>
                  All
                </Chip>
                {cuisines.map((cuisine, index) => (
                  <Chip
                    key={index}
                    style={styles.chip}
                    selected={selectedCuisine === cuisine}
                    onPress={() => {
                      setSelectedCuisine(cuisine);
                      fetchRecipes('', 1, cuisine); // Busca receitas para a culinária selecionada
                      setVisible(false); // Fecha o modal
                    }}
                  >
                    {cuisine}
                  </Chip>
                ))}
              </View>
              <Button mode="text" onPress={() => setVisible(false)}>
                Close
              </Button>
            </Animatable.View>
          </Modal>
        </Portal>
      </View>
    </Provider>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF3E0',
  },
  headerGradient: {
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingBottom: 8,
  },
  header: {
    backgroundColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    width: 30,
    height: 30,
    marginLeft: 10,
  },
  headerTitle: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 20,
  },
  menuIcon: {
    marginRight: 10,
  },
  searchBar: {
    margin: 10,
    backgroundColor: '#FF8A65',
    borderRadius: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#FF7043',
    fontSize: 16,
  },
  listContent: {
    padding: 10,
  },
  cardWrapper: {
    marginBottom: 15,
  },
  card: {
    elevation: 6,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  imageContainer: {
    height: 150,
  },
  image: {
    height: '100%',
    width: '100%',
  },
  recipeTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#333', // Cor neutra para contraste
    textAlign: 'center',
  },
  detailsText: {
    marginTop: 5,
    fontSize: 14,
    color: '#757575',
  },
  buttonContainer: {
    margin: 10,
  },
  cardButton: {
    borderColor: '#FF5722',
    borderWidth: 1,
    elevation: 3, // Sombra leve
    borderRadius: 10,
    marginTop: 10,
    paddingVertical: 5,
  },
  loadingMoreContainer: {
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    flex: 1, // Garante que o modal ocupe a tela inteira
    justifyContent: 'center',
    alignItems: 'center',
    margin: 0, // Remove margem para evitar espaço extra ao redor do modal
   
  },
  modalContent: {
    alignItems: 'center',
    backgroundColor: '#FF7043',
    borderRadius: 10,
    padding: 15,
    width: '90%', // Ajuste para controlar a largura do conteúdo
  },
  
  modalTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    color: 'white',
    marginBottom: 15,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  chip: {
    margin: 5,
    backgroundColor: 'orange',
  },
  emptyContainer: {
    backgroundColor: '#FF5722',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  emptyText: {
    color: '#FFF', // Texto branco para contraste
    fontSize: 20,
    fontWeight: 'bold',
  }
});

export default Home;