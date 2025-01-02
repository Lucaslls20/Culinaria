import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'react-native-localize';

// Traduções
const resources = {
  en: {
    translation: {
      recipes: "Recipes",
      searchRecipes: "Search recipes",
      bestRecipes: "Fetching the best recipes...",
      noRecipes: "No recipes found. Try again.",
      selectCuisine: "Select a Cuisine Type",
      close: "Close",
      viewRecipe: "View Recipe",
      all: "All",
    },
  },
  pt: {
    translation: {
      recipes: "Receitas",
      searchRecipes: "Buscar receitas",
      bestRecipes: "Buscando as melhores receitas...",
      noRecipes: "Nenhuma receita encontrada. Tente novamente.",
      selectCuisine: "Selecione um Tipo de Comida",
      close: "Fechar",
      viewRecipe: "Ver receita",
      all: "Todos",
    },
  },
};

// Inicializar o i18next
i18n.use(initReactI18next).init({
  fallbackLng: 'en',
  lng: Localization.getLocales()[0].languageCode, // Detectar o idioma do dispositivo
  resources,
  interpolation: {
    escapeValue: false, // React já faz o escaping por padrão
  },
});

export default i18n;
