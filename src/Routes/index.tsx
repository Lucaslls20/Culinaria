import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import FontAwesome from 'react-native-vector-icons/FontAwesome'

// Importando as telas
import SplashScreen from "../Autentication/SplashScreen";
import Welcome from "../Autentication/Welcome";
import Login from "../Autentication/Login";
import Register from "../Autentication/Register";
import Home from "../Pages/Home";
import RecipeDetails from "../Pages/SeeRecipes";
import Search from "../Pages/Search";
import Videos from "../Pages/Videos";
import Profile from "../Pages/Profile";
import Settings from "../Components/Settings";
import PrivacyPolicyScreen from "../Components/PrivacyPolicy";
import OrderHistoryScreen from "../Components/OrderHistory";
import FavoriteVideos from "../Components/FavoritesVideos";
import TermsAndConditions from "../Components/TermsAndConditions";


// Tipagem para parâmetros das rotas do Stack Navigator
export type RootStackParamList = {
  SplashScreen: undefined;
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  Tabs: undefined; // Adicionando o Tab Navigator ao Stack
  RecipeDetails: { recipeId: number }; // Parâmetro obrigatório: recipeId
  Settings:undefined
  PrivacyPolitic:undefined
  OrderHistory:undefined
  FavoriteVideos: undefined
  TermsAndConditions: undefined
};

// Tipagem para parâmetros do Tab Navigator
export type RootTabParamList = {
  Home: undefined;
  Search:undefined
  Videos: undefined
  Profile: undefined
};

// Props para o ícone do Tab Navigator
type IconProps = {
  color: string;
  size: number;
};

// Inicializando os Navigators com tipos
const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<RootTabParamList>();

// Componente Tab Navigator
function TabRoutes() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveBackgroundColor: "#FFF3E0",
        tabBarActiveTintColor: "#FF7043",
        tabBarInactiveTintColor: "#A5A5A5",
      }}
    >
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }: IconProps) => (
            <Icon name="home" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Videos"
        component={Videos}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }: IconProps) => (
            <Icon name="video-vintage" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Search"
        component={Search}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }: IconProps) => (
            <Icon name="magnify" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }: IconProps) => (
            <FontAwesome name="user-circle" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// Componente principal de navegação
export default function Routes() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="SplashScreen" 
      screenOptions={{
        contentStyle: { backgroundColor: "#FFF3E0" }, // Cor de fundo geral das telas
        headerStyle: { backgroundColor: "#FF7043" },  // Cor de fundo do header
        headerTintColor: "#FFFFFF",  
      }} >
        {/* Telas de autenticação */}
        <Stack.Screen
          name="SplashScreen"
          component={SplashScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Welcome"
          component={Welcome}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Login"
          component={Login}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Register"
          component={Register}
          options={{ headerShown: false }}
        />

        {/* Tab Navigator como parte do Stack */}
        <Stack.Screen
          name="Tabs"
          component={TabRoutes}
          options={{ headerShown: false }}
        />
       
        <Stack.Screen
          name="Settings"
          component={Settings}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="PrivacyPolitic"
          component={PrivacyPolicyScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="TermsAndConditions"
          component={TermsAndConditions}
          options={{ headerShown: false }}
        />
       
        <Stack.Screen
          name="OrderHistory"
          component={OrderHistoryScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="FavoriteVideos"
          component={FavoriteVideos}
          options={{ headerShown: false }}
        />

        {/* Tela RecipeDetails */}
        <Stack.Screen
          name="RecipeDetails"
          component={RecipeDetails}
          options={{ title: "Detalhes da Receita",
            headerStyle: { backgroundColor: "#FFF3E0" }, // Cor específica para esta tela
            headerTintColor: '#FFFFFFF',
            headerShown:false                 // Texto branco no header
           }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}