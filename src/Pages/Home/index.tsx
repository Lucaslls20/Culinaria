import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text, Card, Appbar, Button, Portal, Modal, Chip, Provider, Searchbar } from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import axios from 'axios';
import * as Animatable from 'react-native-animatable';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
//import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from '../../Routes';



const API_KEY = '' // tirei a chave da api por segurança

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


  {filteredRecipes.length === 0 && !loading && (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>Nenhuma receita encontrada. Tente novamente.</Text>
    </View>
  )}
  

  const fetchRecipes = async (page = 1) => {
    if (page === 1) setLoading(true);
    else setLoadingMore(true);

    try {
      const response = await axios.get(
        `https://api.spoonacular.com/recipes/complexSearch?apiKey=${API_KEY}&number=10&offset=${(page - 1) * 10}`
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
      } else {
        setRecipes((prevRecipes) => [...prevRecipes, ...newRecipes]);
        setFilteredRecipes((prevRecipes) => [...prevRecipes, ...newRecipes]);
      }
    } catch (error) {
      console.error('Erro ao buscar receitas:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleFilterByCuisine = async (cuisine: string) => {
    setSelectedCuisine(cuisine);
    if (cuisine === '') {
      setFilteredRecipes(recipes);
      return;
    }

    try {
      const response = await axios.get(
        `https://api.spoonacular.com/recipes/complexSearch?apiKey=${API_KEY}&cuisine=${cuisine}&number=10`
      );

      const filtered = response.data.results.map((recipe: any) => ({
        id: recipe.id,
        title: recipe.title,
        image: recipe.image,
        readyInMinutes: recipe.readyInMinutes || 0,
        servings: recipe.servings || 0,
      }));

      setFilteredRecipes(filtered);
    } catch (error) {
      console.error('Erro ao filtrar receitas por tipo de comida:', error);
    }
    setVisible(false);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const filtered = recipes.filter((recipe) =>
      recipe.title.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredRecipes(filtered);
  };

  const loadMoreRecipes = () => {
    if (!loadingMore) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchRecipes(nextPage);
    }
  };

  const renderRecipe = ({ item }: { item: Recipe }) => (
    <Animatable.View animation="fadeIn" duration={500} style={styles.cardWrapper}>
      <Card style={styles.card}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.image }} style={styles.image} accessibilityLabel={`Imagem da receita ${item.title}`} />
        </View>
        <Card.Content>
          <Text variant="titleLarge" style={styles.recipeTitle}>{item.title}</Text>
          {/*} <Text style={styles.detailsText}>⏱️ {item.readyInMinutes} minutos | 🍽️ {item.servings} porções</Text> */}
        </Card.Content>
        <View style={styles.buttonContainer}>
          <Button
            mode="outlined"
            icon="eye-outline"
            textColor="#FFF"
            style={styles.cardButton}
            labelStyle={{ fontWeight: 'bold' }} // Destacar o texto
            buttonColor="#FF5722" // Fundo sólido combinando com o tema
            onPress={() => navigation.navigate("RecipeDetails", { recipeId: item.id })}>
            Ver receita
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
            <Appbar.Content title="Receitas" titleStyle={styles.headerTitle} />
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
            placeholder="Buscar receitas"
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
            <Text style={styles.loadingText}>Buscando as melhores receitas...</Text>
          </View>
        ) : (
          <FlatList
          getItemLayout={(data, index) => ({
            length: 200, // Altura do item
            offset: 200 * index,
            index,
          })}
            data={filteredRecipes}
            renderItem={renderRecipe}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContent}
            onEndReached={loadMoreRecipes}
            onEndReachedThreshold={0.5}
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
          <Modal visible={visible} onDismiss={() => setVisible(false)} contentContainerStyle={styles.modal}>
            <Animatable.View animation="slideInUp" duration={400} style={styles.modalContent}>
              <Text style={styles.modalTitle}>Selecione um Tipo de Comida</Text>
              <View style={styles.chipContainer}>
                <Chip style={styles.chip} selected={selectedCuisine === ''} onPress={() => handleFilterByCuisine('')}>
                  Todos
                </Chip>
                {cuisines.map((cuisine, index) => (
                  <Chip
                    key={index}
                    style={styles.chip}
                    selected={selectedCuisine === cuisine}
                    onPress={() => handleFilterByCuisine(cuisine)}
                  >
                    {cuisine}
                  </Chip>
                ))}
              </View>
              <Button mode="text" onPress={() => setVisible(false)}>
                Fechar
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
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  modalContent: {
    alignItems: 'center',
    backgroundColor: '#FF7043',
    borderRadius: 10,
    padding: 15,
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
  emptyContainer:{
    backgroundColor: '#FF5722',
    flex:1,
    alignItems:'center',
    justifyContent:'center'
  },
    emptyText: {
      color: '#FFF', // Texto branco para contraste
      fontSize: 20,
      fontWeight: 'bold',
    }
});

export default Home;
