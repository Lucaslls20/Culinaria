import React, { useEffect, useState } from "react";
import { FlatList, View, StyleSheet } from "react-native";
import { Appbar, Card, Text, ActivityIndicator } from "react-native-paper";
import { collection, getDocs, query, orderBy } from "firebase/firestore"; // Importação correta do Firestore
import { db } from "../../Services/fireBaseConfig"; // Supondo que o caminho esteja correto para o arquivo de configuração

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

interface Order {
  id: string;
  title: string;
  date: string;
  image: string;
}

const OrderHistoryScreen = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const ordersRef = collection(db, "orderHistory"); // Nome da coleção no Firestore
        const q = query(ordersRef, orderBy("date", "desc"));
        const querySnapshot = await getDocs(q);

        const ordersList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Order[];
        setOrders(ordersList);
      } catch (error) {
        console.error("Erro ao buscar histórico de pedidos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const renderOrder = ({ item }: { item: Order }) => (
    <Card style={styles.card} onPress={() => console.log(`Detalhes do pedido: ${item.id}`)}>
      <Card.Cover source={{ uri: item.image }} style={styles.image} />
      <Card.Content>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.date}>Data: {new Date(item.date).toLocaleDateString()}</Text>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.appbar}>
        <Appbar.Content title="Order History" titleStyle={styles.titleAppBar} />
      </Appbar.Header>

      {loading ? (
        <ActivityIndicator animating={true} size="large" style={styles.loader} />
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrder}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.emptyText}>No requests found.</Text>}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.secondary,
  },
  appbar: {
    backgroundColor: COLORS.primary,
  },
  titleAppBar: {
    color: COLORS.white,
    textAlign:'center',
    marginRight:7
  },
  loader: {
    marginTop: 50,
  },
  list: {
    padding: 10,
  },
  card: {
    marginBottom: 10,
    backgroundColor: COLORS.cardBackground,
    elevation: 4,
    shadowColor: COLORS.shadow,
  },
  image: {
    height: 150,
  },
  title: {
    fontSize: 18,
    color: COLORS.textPrimary,
    marginVertical: 5,
  },
  date: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    color: COLORS.textSecondary,
    fontSize: 16,
  },
});

export default OrderHistoryScreen;
