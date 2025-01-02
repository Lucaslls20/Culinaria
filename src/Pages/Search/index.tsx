import React, { useEffect, useState, useCallback, useRef } from "react";
import {
    View,
    FlatList,
    Image,
    StyleSheet,
    TouchableOpacity,
    Text,
    Animated,
    Easing,
    Dimensions
} from "react-native";
import { Searchbar, Card, Title } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Toast from "react-native-toast-message";
import axios from "axios";

import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from '../../Routes';

type SearchProps ={
    navigation: NativeStackNavigationProp<RootStackParamList, "Tabs">;
}

// Cores refinadas
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

const API_KEY = "7f5896bcc0644617a509b22ffc142782" // tirei a chave da api por segurança

interface Recipe {
    id: number;
    title: string;
    image: string;
}
const Search = ({ navigation }: SearchProps) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [popularSearches, setPopularSearches] = useState<Recipe[]>([]);
    const [recentlyViewed, setRecentlyViewed] = useState<Recipe[]>([]);
    const [searchResults, setSearchResults] = useState<Recipe[]>([]);
    const [loading, setLoading] = useState(false);
    const [numColumns, setNumColumns] = useState(2);
    const [page, setPage] = useState(1); // Para controle de paginação
    const [hasMoreResults, setHasMoreResults] = useState(true); // Para determinar se há mais dados

    const spinValue = useRef(new Animated.Value(0)).current;

    const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const onChangeSearch = useCallback((query: string) => {
        setSearchQuery(query);
        if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
        debounceTimeoutRef.current = setTimeout(() => searchRecipes(query), 500);
    }, []);


    useEffect(() => {
        fetchPopularSearches();
        fetchRecentlyViewed();
        startSpinner();
        const subscription = Dimensions.addEventListener("change", handleLayoutChange);
        return () => subscription?.remove?.();
    }, []);

    const startSpinner = useCallback(() => {
        spinValue.setValue(0);
        Animated.loop(
            Animated.timing(spinValue, {
                toValue: 1,
                duration: 1000,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        ).start();
    }, [spinValue]);
    
    
    const fetchPopularSearches = useCallback(async () => {
        try {
            const response = await axios.get(
                `https://api.spoonacular.com/recipes/random?number=6&apiKey=${API_KEY}`
            );
            setPopularSearches(response.data.recipes);
        } catch {
            Toast.show({ type: "error", text1: "Erro ao carregar pesquisas populares" });
        }
    }, []);

    const fetchRecentlyViewed = useCallback(async () => {
        try {
            const response = await axios.get(
                `https://api.spoonacular.com/recipes/random?number=4&apiKey=${API_KEY}`
            );
            setRecentlyViewed(response.data.recipes);
        } catch {
            Toast.show({ type: "error", text1: "Erro ao carregar últimas receitas" });
        }
    }, []);


    const searchRecipes = useCallback(async (query: string) => {
        if (!query) return setSearchResults([]);
        setLoading(true);
        try {
            const response = await axios.get(
                `https://api.spoonacular.com/recipes/complexSearch?query=${query}&apiKey=${API_KEY}`
            );
            setSearchResults(response.data.results);
        } catch {
            Toast.show({ type: "error", text1: "Erro ao buscar receitas" });
        } finally {
            setLoading(false);
        }
    }, []);

    const loadMoreResults = async () => {
        if (!hasMoreResults || loading) return;
        setLoading(true);
        try {
            const response = await axios.get(
                `https://api.spoonacular.com/recipes/complexSearch?query=${searchQuery}&offset=${page * 10}&apiKey=${API_KEY}`
            );
            const newResults = response.data.results;
            setSearchResults((prev) => [...prev, ...newResults]);
            setHasMoreResults(newResults.length > 0);
            setPage((prev) => prev + 1);
        } catch {
            Toast.show({ type: "error", text1: "Erro ao carregar mais receitas" });
        } finally {
            setLoading(false);
        }
    };

    const getNumColumns = () => {
        const width = Dimensions.get("window").width;
        return width < 400 ? 1 : 2;
    };

    const handleLayoutChange = () => {
        setNumColumns(getNumColumns());
    };

    const RenderResultItem = React.memo(({ item }: { item: Recipe }) => (
        <TouchableOpacity
            style={styles.resultItem}
            onPress={() => navigation.navigate("RecipeDetails", { recipeId: item.id })}
        >
            <Image source={{ uri: item.image }} style={styles.resultImage} />
            <Text style={styles.resultTitle} numberOfLines={2}>{item.title}</Text>
        </TouchableOpacity>
    ));


    const renderNoResults = () => (
        <View style={styles.noResultsContainer}>
            <Text style={styles.noResultsText}>No results found.</Text>
        </View>
    );


    const spin = spinValue.interpolate({
        inputRange: [0, 1],
        outputRange: ["0deg", "360deg"],
    });

    return (
        <View style={styles.container}>
            <Searchbar
                placeholder="Search for delicious recipes.."
                placeholderTextColor={COLORS.placeholder}
                iconColor={COLORS.white}
                inputStyle={{ color: COLORS.white }}
                onChangeText={onChangeSearch}
                value={searchQuery}
                style={styles.searchBar}
            />

            {searchQuery ? (
                <>
                    <Text style={styles.sectionTitle}>
                    Search results</Text>
                    {loading ? (
                        <View style={styles.spinnerContainer}>
                            <Animated.View style={[styles.spinner, { transform: [{ rotate: spin }] }]} />
                        </View>
                    ) :
                    searchResults.length === 0 ? (
                        renderNoResults()
                    ) : (
                        <FlatList
                            key={numColumns}
                            numColumns={numColumns}
                            data={searchResults}
                            renderItem={({ item }) => <RenderResultItem item={item} />}
                            keyExtractor={(item) => item.id.toString()}
                            onEndReached={loadMoreResults}
                            onEndReachedThreshold={0.1}
                            removeClippedSubviews
                            initialNumToRender={6}
                            maxToRenderPerBatch={8}
                        />
                    )}
                </>
            ) : (
                <>
                    <Text style={styles.sectionTitle}>Popular searches</Text>
                    <FlatList
                        data={popularSearches}
                        numColumns={2}
                        renderItem={({item}) => <RenderResultItem item={item}/>} // Correção aqui
                        keyExtractor={(item) => item.id.toString()}
                    />


                    <Text style={styles.sectionTitle}>
                    Latest Recipes</Text>
                    <FlatList
                        data={recentlyViewed}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        renderItem={({ item }) => (
                            <Card style={styles.recentCard}  onPress={() => navigation.navigate("RecipeDetails", { recipeId: item.id })}>
                                <Card.Cover source={{ uri: item.image }} style={styles.cardCover} />
                                <Card.Content>
                                    <Title style={styles.recentTitle}>{item.title}</Title>
                                </Card.Content>
                            </Card>
                        )}
                        keyExtractor={(item) => item.id.toString()}
                    />
                </>
            )}
            <Toast />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.secondary,
    },
    searchBar: {
        margin: 12,
        backgroundColor: COLORS.primary,
        borderRadius: 12,
        elevation: 5,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "600",
        margin: 10,
        color: COLORS.textPrimary,
    },
    spinnerContainer: {
        justifyContent: "center",
        alignItems: "center",
        flex: 1,
    },
    spinner: {
        width: 50,
        height: 50,
        borderWidth: 4,
        borderColor: COLORS.primary,
        borderRadius: 25,
        borderTopColor: COLORS.secondary,
    },
    resultItem: {
        flex: 1,
        margin: 8,
        backgroundColor: COLORS.cardBackground,
        borderRadius: 10,
        padding: 10,
        elevation: 4,
        shadowColor: COLORS.shadow,
    },
    resultImage: {
        width: "100%",
        height: 120,
        borderRadius: 8,
    },
    resultTitle: {
        fontSize: 16,
        color: COLORS.textPrimary,
        marginTop: 5,
        textAlign: "center",
    },
    popularItem: {
        flex: 1,
        alignItems: "center",
        margin: 10,
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 8,
        elevation: 3,
    },
    popularImage: {
        width: 90,
        height: 90,
        borderRadius: 45,
    },
    popularTitle: {
        marginTop: 8,
        textAlign: "center",
        color: COLORS.textSecondary,
        fontWeight: "500",
    },
    recentCard: {
        width: 180,
        marginHorizontal: 10,
        borderRadius: 12,
        elevation: 3,
        overflow: "hidden",
    },
    cardCover: {
        width: "100%",
        height: 120, // Ajuste de altura, se necessário.
    },
    recentTitle: {
        fontSize: 16,
        color: COLORS.textSecondary,
        textAlign: "center",
        fontWeight: "bold",
        paddingVertical: 4,
        paddingHorizontal: 8,
       // backgroundColor: "rgba(0, 0, 0, 0.6)", // Fundo semitransparente.
        borderBottomLeftRadius: 12,
        borderBottomRightRadius: 12,
        overflow: "hidden",
    },
    noResultsContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    noResultsText: {
        fontSize: 16,
        color: "#888",
        textAlign: "center",
    },
});

export default Search;
