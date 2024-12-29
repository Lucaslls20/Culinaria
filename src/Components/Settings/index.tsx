import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView, Alert } from 'react-native';
import { Text, Avatar, Divider, List, Button, ActivityIndicator } from 'react-native-paper';
import { auth, db } from '../../Services/fireBaseConfig';
import { User, sendPasswordResetEmail } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from '../../Routes';

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

type SettingsProps = {
    navigation: NativeStackNavigationProp<RootStackParamList, 'Tabs'>
}

const Settings = ({ navigation }: SettingsProps) => {
    const [user, setUser] = useState<User | null>(null);
    const [userName, setUserName] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                fetchUserName(currentUser.uid); // Busca o nome do usuário no Firestore
            } else {
                setLoading(false);
            }
        });



        return unsubscribe;
    }, []);

    const fetchUserName = async (uid: string) => {
        try {
            const userDoc = doc(db, 'users', uid); // Supondo que os dados dos usuários estão na coleção "users"
            const docSnapshot = await getDoc(userDoc);

            if (docSnapshot.exists()) {
                const data = docSnapshot.data();
                setUserName(data.name || null); // Supondo que o campo do nome é "name"
            } else {
                console.log("Documento não encontrado para o usuário:", uid);
                setUserName(null);
            }
        } catch (error) {
            console.error("Erro ao buscar o nome do usuário:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await auth.signOut();
            Alert.alert("Logout", "Você saiu da sua conta com sucesso!");
        } catch (error) {
            Alert.alert("Erro", "Não foi possível sair da conta. Tente novamente.");
        }
    };

    const handlePasswordReset = async () => {
        if (!user?.email) {
            Alert.alert("Erro", "Email não encontrado. Verifique se você está logado.");
            return;
        }
        try {
            await sendPasswordResetEmail(auth, user.email);
            Alert.alert(
                "Alterar Senha",
                "Um email para redefinição de senha foi enviado para o endereço cadastrado."
            );
        } catch (error: any) {
            Alert.alert("Erro", error.message || "Não foi possível enviar o email de redefinição de senha.");
        }
    };

    const onNotificationReceived = (notification: any) => {
        Alert.alert("Notificação", notification.message || "Nova notificação recebida.");
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Avatar.Text
                    size={64}
                    label={(userName?.[0] || "U").toUpperCase()} // Usa a primeira letra do nome do usuário
                    style={styles.avatar}
                />
                <Text style={styles.name}>{userName || "Usuário Desconhecido"}</Text>
                <Text style={styles.email}>{user?.email || "Email não disponível"}</Text>
            </View>

            <Divider style={styles.divider} />

            <List.Section>
                <List.Subheader style={styles.subheader}>Informações da Conta</List.Subheader>
                <List.Item
                    style={styles.listItem}
                    title="Nome"
                    description={userName || "Não definido"}
                    left={() => <List.Icon icon="account" color={COLORS.primary} />}
                />
                <List.Item
                    style={styles.listItem}
                    title="Email"
                    description={user?.email || "Não disponível"}
                    left={() => <List.Icon icon="email" color={COLORS.primary} />}
                />
                <List.Item
                    style={styles.listItem}
                    title="Alterar Senha"
                    left={() => <List.Icon icon="lock-reset" color={COLORS.primary} />}
                    onPress={handlePasswordReset}
                />
            </List.Section>

            <Divider style={styles.divider} />

            <List.Section>
                <List.Subheader style={styles.subheader}>Configurações</List.Subheader>
                <List.Item
                    style={styles.listItem}
                    title="Política de Privacidade"
                    left={() => <List.Icon icon="shield-lock-outline" color={COLORS.primary} />}
                    onPress={() => navigation.navigate('PrivacyPolitic')}
                />
                <List.Item
                    style={styles.listItem}
                    title="Log out"
                    left={() => <List.Icon icon="exit-to-app" color={COLORS.primary} />}
                    onPress={handleLogout}
                />
            </List.Section>

            <Divider style={styles.divider} />

            <Button
                mode="contained"
                buttonColor={COLORS.primary}
                textColor={COLORS.white}
                style={styles.logoutButton}
                onPress={() => navigation.goBack()}
            >
                Voltar
            </Button>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.secondary,
    },
    header: {
        alignItems: 'center',
        paddingVertical: 20,
        backgroundColor: COLORS.cardBackground,
    },
    avatar: {
        backgroundColor: COLORS.primary,
    },
    name: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginVertical: 5,
    },
    email: {
        fontSize: 14,
        color: COLORS.textSecondary,
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.shadow,
        marginVertical: 10,
    },
    subheader: {
        color: COLORS.textPrimary,
        fontWeight: 'bold',
    },
    logoutButton: {
        margin: 20,
        borderRadius: 8,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.secondary,
    },
    listItem: {
        marginLeft: 20,
    },
});

export default Settings;
