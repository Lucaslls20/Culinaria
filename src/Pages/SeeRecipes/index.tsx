import React, { useEffect, useState } from "react";
import { View, StyleSheet, Image, ScrollView, ActivityIndicator } from "react-native";
import { Text, Card, Appbar, Chip, Button } from "react-native-paper";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../Routes";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from "react-native-linear-gradient";
import Toast from 'react-native-toast-message'; // Biblioteca para feedback visual
import { auth, db } from "../../Services/fireBaseConfig";
import { collection, addDoc } from "firebase/firestore";

type RecipeDetailsProps = NativeStackScreenProps<RootStackParamList, "RecipeDetails">;

type RecipeData = {
  title: string;
  image: string;
  readyInMinutes: number;
  servings: number;
  extendedIngredients: { id: number; original: string }[];
  analyzedInstructions: { name: string; steps: { number: number; step: string }[] }[];
};

const RecipeDetails = ({ route, navigation }: RecipeDetailsProps) => {
  const { recipeId } = route.params;

  const [recipeData, setRecipeData] = useState<RecipeData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecipeDetails = async () => {
    try {
      const apiKey = "7f5896bcc0644617a509b22ffc142782"; // tirei a chave da api por segurança
      const url = `https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${apiKey}&includeNutrition=true`;

      const response = await fetch(url);
      const data = await response.json();

      if (response.ok) {
        setRecipeData(data);
      } else {
        setError("Erro ao buscar detalhes da receita.");
      }
    } catch (error) {
      console.error("Erro ao buscar receita:", error);
      setError("Não foi possível carregar os dados. Tente novamente mais tarde.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipeDetails();
  }, [recipeId]);

  const handleFavorite = async () => {
    const a = auth;
    const user = a.currentUser;

    if (!user) {
      Toast.show({
        type: 'error',
        text1: 'Erro!',
        text2: 'Você precisa estar logado para favoritar receitas.',
      });
      return;
    }

    const data = db;
    const favoriteData = {
      userId: user.uid,
      title: recipeData?.title,
      image: recipeData?.image,
      addedAt: new Date().toISOString(),
    };

    try {
      const docRef = await addDoc(collection(data, "favorites"), favoriteData);
      console.log("Receita salva com ID:", docRef.id);

      Toast.show({
        type: 'success',
        text1: 'Recipe added to favorites!',
        text2: 'You can access it in your favorites list.',
      });
    } catch (error) {
      console.error("Erro ao salvar nos favoritos:", error);

      Toast.show({
        type: 'error',
        text1: 'Erro!',
        text2: 'Não foi possível adicionar a receita aos favoritos.',
      });
    }
  };
  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#FF7043" />
        <Text style={styles.loadingText}>Loading recipe...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loader}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#FF7043", "#FF5722"]} style={styles.headerGradient}>
        <Appbar.Header style={styles.header}>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="Recipe Details" titleStyle={styles.headerTitle} />
        </Appbar.Header>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Card style={styles.card}>
          <Image source={{ uri: recipeData?.image }} style={styles.image} />
          <Card.Content>
            <Text variant="titleLarge" style={styles.title}>
              {recipeData?.title}
            </Text>
            <View style={styles.details}>
              <Chip icon="timer" style={styles.chip}>
                {recipeData?.readyInMinutes} minutes
              </Chip>
              <Chip icon="silverware-fork-knife" style={styles.chip}>
                {recipeData?.servings} portions
              </Chip>
            </View>
          </Card.Content>
        </Card>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ingredients</Text>
          {recipeData?.extendedIngredients?.map((ingredient) => (
            <View key={ingredient.id} style={styles.ingredientContainer}>
              <Icon name="food-fork-drink" color="black" size={20} style={styles.icon} />
              <Text style={styles.ingredientText}>{ingredient.original}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preparation method</Text>
          {recipeData?.analyzedInstructions?.[0]?.steps?.map((step) => (
            <Text key={step.number} style={styles.stepText}>
              {step.number}. {step.step}
            </Text>
          )) || <Text style={styles.noStepsText}>Preparation method not available.</Text>}
        </View>

        <Button
          mode="contained"
          buttonColor="#FF7043"
          textColor="white"
          style={styles.button}
          onPress={handleFavorite}
        >

          Favorite Recipe
        </Button>
      </ScrollView>
      <Toast />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF3E0",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF3E0",
  },
  loadingText: {
    color: "#333",
    fontSize: 16,
    marginTop: 10,
  },
  errorText: {
    color: "red",
    fontSize: 18,
    textAlign: "center",
  },
  headerGradient: {
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  header: {
    backgroundColor: "transparent",
  },
  headerTitle: {
    color: "white",
    fontWeight: "bold",
    letterSpacing: 1,
  },
  contentContainer: {
    padding: 15,
  },
  card: {
    elevation: 5,
    borderRadius: 10,
    marginBottom: 20,
    backgroundColor: "#FFF",
  },
  image: {
    width: "100%",
    height: 220,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  title: {
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 10,
    fontSize: 24,
    color: "#444",
    letterSpacing: 0.8,
  },
  details: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginVertical: 15,
  },
  chip: {
    backgroundColor: "#FF7043",
    borderRadius: 20,
  },
  section: {
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  sectionTitle: {
    fontWeight: "bold",
    fontSize: 20,
    color: "#FF7043",
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  ingredientText: {
    fontSize: 16,
    color: "#333",
    marginVertical: 3,
    paddingLeft: 10,
    fontWeight: 'bold',
    letterSpacing: 0.3
  },
  stepText: {
    fontSize: 16,
    color: "#333",
    marginVertical: 5,
    lineHeight: 22,
    fontWeight: 'bold'
  },
  noStepsText: {
    fontSize: 16,
    color: "#888",
    fontStyle: "italic",
  },
  button: {
    marginVertical: 20,
    marginHorizontal: 50,
    borderRadius: 25,
  },
  ingredientContainer: {
    flexDirection: "row", // Organiza os itens lado a lado
    alignItems: "center", // Alinha verticalmente
    marginVertical: 5,
  },
  icon: {
    marginRight: 10, // Espaçamento entre o ícone e o texto
  },
});

export default RecipeDetails;
