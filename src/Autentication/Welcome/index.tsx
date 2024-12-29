import React from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import * as Animatable from "react-native-animatable";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../Routes"; // Importe o tipo RootStackParamList

type WelcomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList
>;

export default function Welcome() {
  const navigation = useNavigation<WelcomeScreenNavigationProp>();

  return (
    <View style={styles.container}>
      <View style={styles.containerLogo}>
        <Animatable.Image
          source={{ uri: "https://cdn.pixabay.com/photo/2020/08/23/06/54/cooking-5510047_960_720.png" }}
          animation="flipInY"
          style={{ width: "100%", height: "50%" }}
          resizeMode="contain"
        />
      </View>

      <Animatable.View style={styles.containerForm} animation="fadeInUp" delay={600}>
        <Text style={styles.title}>
          Melhore e se desenvolva cada dia mais na cozinha!
        </Text>
        <Text style={styles.text}>Faça Login para começar a aprender receitas novas!</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("Login")}
        >
          <Text style={styles.butonText}>Acessar</Text>
        </TouchableOpacity>
      </Animatable.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FF7043",
  },
  containerLogo: {
    flex: 2,
    backgroundColor: "#FF7043",
    justifyContent: "center",
    alignItems: "center",
  },
  containerForm: {
    flex: 1,
    backgroundColor: "#FFF3E0",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingStart: "5%",
    paddingEnd: "5%",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 28,
    marginBottom: 12,
    color:'black'
  },
  text: {
    color: "#a1a1a1",
    textAlign: "center",
    marginTop: 10,
    fontSize: 18,
  },
  button: {
    position: "absolute",
    backgroundColor: "#FF7043",
    borderRadius: 50,
    paddingVertical: 8,
    width: "60%",
    alignSelf: "center",
    bottom: "15%",
    alignItems: "center",
    justifyContent: "center",
  },
  butonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFF",
  },
});
