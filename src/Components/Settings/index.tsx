import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView, Alert, Dimensions } from 'react-native';
import { Text, Avatar, Divider, List, Button, ActivityIndicator, Snackbar } from 'react-native-paper';
import { auth, db } from '../../Services/fireBaseConfig';
import { User, sendPasswordResetEmail } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from '../../Routes';
import { logOut } from '../LogOut/function';

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
    const [snackbarMessage, setSnackBarMessage] = useState('')
    const [snackbarVisible, setSnackBarVisible] = useState(false)

    function onDismissSnackBar(): void {
        setSnackBarVisible(false)
    }

    const { width } = Dimensions.get('window');
    const avatarSize = width * 0.2; // Ajustar tamanho do avatar dinamicamente


    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((currentUser) => {
            setUser(currentUser);
            if (currentUser) fetchUserName(currentUser.uid);
            else setLoading(false);
        });
        return () => unsubscribe(); // Garante a limpeza do listener
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



    const handlePasswordReset = async () => {
        if (!user?.email) {
            Alert.alert("Error", "Email not found. Make sure you are logged in.");
            return;
        }
        try {
            await sendPasswordResetEmail(auth, user.email);
            setSnackBarVisible(true)
            setSnackBarMessage(
                `Change Password, a password reset email has been sent to the registered address.`
            );
        } catch (error: any) {
            setSnackBarVisible(true)
            setSnackBarMessage(`Erro", ${error.message} Não foi possível enviar o email de redefinição de senha.`);
        }
    };



    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <>
            <ScrollView style={styles.container}>
                <View style={styles.header}>
                    <Avatar.Text
                        size={avatarSize}
                        label={(userName?.[0] || "U").toUpperCase()} // Usa a primeira letra do nome do usuário
                        style={styles.avatar}
                    />
                    <Text style={styles.name}>{userName || "unknown user"}</Text>
                    <Text style={styles.email}>{user?.email || "Email not available"}</Text>
                </View>

                <Divider style={styles.divider} />

                <List.Section>
                    <List.Subheader style={styles.subheader}>Informações da Conta</List.Subheader>
                    <List.Item
                        style={styles.listItem}
                        title="Name"
                        description={userName || "Not available"}
                        left={() => <List.Icon icon="account" color={COLORS.primary} />}
                    />
                    <List.Item
                        style={styles.listItem}
                        title="Email"
                        description={user?.email || "Not available"}
                        left={() => <List.Icon icon="email" color={COLORS.primary} />}
                    />
                    <List.Item
                        style={styles.listItem}
                        title="Change Password"
                        left={() => <List.Icon icon="lock-reset" color={COLORS.primary} />}
                        onPress={handlePasswordReset}
                    />
                </List.Section>

                <Divider style={styles.divider} />

                <List.Section>
                    <List.Subheader style={styles.subheader}>Configurações</List.Subheader>
                    <List.Item
                        style={styles.listItem}
                        title="Privacy Policy"
                        left={() => <List.Icon icon="shield-lock-outline" color={COLORS.primary} />}
                        onPress={() => navigation.navigate('PrivacyPolitic')}
                    />
                    <List.Item
                        style={styles.listItem}
                        title="Log out"
                        left={() => <List.Icon icon="exit-to-app" color={COLORS.primary} />}
                        onPress={logOut}
                    />
                </List.Section>

                <Divider style={styles.divider} />

                <Button
                    mode="contained"
                    buttonColor={COLORS.primary}
                    textColor={COLORS.white}
                    style={styles.logoutButton}
                    onPress={() => navigation.goBack()}
                    accessibilityLabel="Go back to the last page "
                >
                    Go back
                </Button>
            </ScrollView>
            <Snackbar
                style={{ backgroundColor: COLORS.cardBackground }}
                duration={6000}
                visible={snackbarVisible}
                onDismiss={onDismissSnackBar}
                action={{
                    label: 'Ok',
                    onPress: () => setSnackBarVisible(false)
                }}
            >
                <Text style={styles.snackbarText}>{snackbarMessage}</Text>
            </Snackbar>
        </>
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
        elevation: 4, // Adiciona sombra
        shadowColor: COLORS.shadow,
        shadowOpacity: 0.2,
        shadowRadius: 3,
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
        elevation: 3
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
    snackbarText: {
        color:"#333",
        fontSize: 12,
       
    },

});

export default Settings;
