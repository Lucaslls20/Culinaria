import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Alert,
  TouchableOpacity,
  ActivityIndicator
} from "react-native";
import { Card, Divider, Snackbar, TextInput as PaperTextInput } from "react-native-paper";
import Feather from "react-native-vector-icons/Feather";
import { db, auth } from "../../Services/fireBaseConfig";
import Modal from 'react-native-modal'
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  addDoc,
  serverTimestamp,
  deleteDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import { formatDistanceToNow } from "date-fns";
import { enUS } from "date-fns/locale";

const COLORS = {
  primary: "#FF7043",
  secondary: "#FFF8E1",
  textPrimary: "#4E342E",
  textSecondary: "#757575",
  white: "#FFF",
  cardBackground: "#FFE0B2",
  shadow: "#D7CCC8",
  placeholder: "#FFAB91",
  dark: "#333",
  highlight: "#FFAB91",
};

interface CommentProps {
  visible: boolean;
  onClose: () => void;
  videoId: string | null
}

interface CommentItem {
  id: string;
  userName: string;
  content: string;
  uid: string;
  timestamp?: any;
}

const Comment: React.FC<CommentProps> = ({ visible, onClose, videoId }) => {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [input, setInput] = useState("");
  const [userName, setUserName] = useState("");
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [newComment, setNewComment] = useState("");
  const [loading,setLoading] = useState(false)



  useEffect(() => {
    const fetchUserName = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setUserName(userDoc.data().name || "Anonymous");
        }
      }
    };
    fetchUserName();
  }, []);

  useEffect(() => {
    if (!videoId) return;
    const commentsRef = collection(db, "videos", videoId, "comments");
    const q = query(commentsRef, orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedComments: CommentItem[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        userName: doc.data().userName || "Anonymous",
        content: doc.data().text || "",
        uid: doc.data().uid,
        timestamp: doc.data().timestamp,
      }));
      setComments(fetchedComments);
    });
    return () => unsubscribe();
  }, [videoId]);

  const handleAddComment = async () => {
    if (!newComment.trim() || !videoId) {
      showSnackbar("Please write a comment before submitting.");
      return;
    }
    try {
      const user = auth.currentUser;
      if (!user) {
        showSnackbar("You need to be logged in to add comments.");
        return;
      }

      const commentsRef = collection(db, "videos", videoId, "comments");
      await addDoc(commentsRef, {
        text: newComment,
        userName: userName || "Anonymous",
        uid: user.uid,
        timestamp: serverTimestamp(),
      });

      setNewComment(""); // Limpa o campo de texto após o envio
      showSnackbar("Comment added successfully.");
    } catch (error) {
      console.error("Error adding comment:", error);
      showSnackbar("Error adding comment. Please try again.");
    }
  };

  const deleteComment = async (commentId: string, commentUid: string) => {
    const user = auth.currentUser;

    if (user && user.uid === commentUid) {
      if (!videoId) {
        showSnackbar("Error: Invalid video ID.");
        return;
      }

      try {
        const commentDocRef = doc(db, "videos", videoId, "comments", commentId);
        await deleteDoc(commentDocRef);
        showSnackbar("Comment deleted successfully.");
      } catch (error) {
        console.error("Error deleting comment:", error);
        showSnackbar("Error deleting comment.");
      }
    } else {
      showSnackbar("You can only delete your own comments.");
    }
  };


  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  return (
    <Modal
    isVisible={visible}
    onBackdropPress={onClose}
    onBackButtonPress={onClose}
    backdropColor={COLORS.dark}
    backdropOpacity={0.6}
    animationIn="slideInUp"
    animationOut="slideOutDown"
    style={{ margin: 0 }}
  >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <Feather name="arrow-left" color={COLORS.textSecondary} size={25} onPress={onClose} />
            <Text style={styles.title}>Comments</Text>
          </View>
          <Text style={{ fontWeight: "bold", color: COLORS.textPrimary, fontSize: 15 }}>
            {comments.length} <Feather name="message-circle" size={15} color={COLORS.textPrimary} /> Comments
          </Text>
        </View>

        <FlatList
          data={comments}
          keyExtractor={(item: CommentItem) => item.id}
          renderItem={({ item }) => (
            <>
              <Card style={styles.commentCard}>
                <Card.Content>
                  <View style={styles.commentHeader}>
                    <Text style={styles.userName}>{item.userName}</Text>
                    {auth.currentUser?.uid === item.uid && (
                      <Pressable onPress={() => deleteComment(item.id, item.uid)}>
                        <Feather name="trash" size={18} color={COLORS.textSecondary} />
                      </Pressable>
                    )}
                  </View>
                  <Text style={styles.content}>{item.content}</Text>
                  <Text>
                    {item.timestamp
                      ? formatDistanceToNow(item.timestamp.toDate(), { locale: enUS, addSuffix: true })
                      : "Just now"}
                  </Text>
                </Card.Content>
              </Card>
              <Divider style={{ marginVertical: 8, backgroundColor: COLORS.shadow }} />
            </>
          )}
          ListEmptyComponent={
            <View style={styles.emptyMessage}>
              <Text style={styles.emptyText}>No comments yet. 📝 Be the first to comment!</Text>
            </View>
          }
        />

        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <View style={styles.inputContainer}>
            <PaperTextInput
              style={styles.input}
              mode="outlined"
              placeholder="What's on your mind?"
              value={newComment} // Alterado de `input` para `newComment`
              onChangeText={setNewComment} // Atualiza `newComment`
              multiline={true}
              theme={{
                colors: {
                  primary: COLORS.primary,
                  text: COLORS.textPrimary,
                  background: COLORS.white,
                  placeholder: COLORS.placeholder,
                },
                roundness: 10,
              }}
            />

            <TouchableOpacity
              style={styles.iconContainer}
              onPress={async () => {
                setLoading(true); // Mostra o loading
                await handleAddComment(); // Chama a função de comentário
                setLoading(false); // Esconde o loading
              }}
              activeOpacity={0.7} // Define opacidade ao pressionar
            >
              {loading ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <Feather name="arrow-up" color={COLORS.white} size={20} />
              )}
            </TouchableOpacity>

          </View>
        </KeyboardAvoidingView>

        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={Snackbar.DURATION_SHORT}
          style={styles.snackbar}
        >
          {snackbarMessage}
        </Snackbar>
      </SafeAreaView>
    </Modal>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.secondary,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    paddingHorizontal: 20,
    paddingTop: 15,
    shadowColor: COLORS.dark,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.textPrimary,
  },
  commentCard: {
    marginBottom: 10,
    borderRadius: 10,
    elevation: 2,
    backgroundColor: COLORS.cardBackground,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  userName: {
    fontWeight: "bold",
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  content: {
    fontSize: 14,
    marginVertical: 5,
    color: COLORS.textSecondary,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10, // Adicionado para espaço interno
    backgroundColor: COLORS.white,
    borderColor: COLORS.shadow,
    elevation: 2,
    marginBottom: 10,
  },
  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    borderRadius: 25, // Tornar o botão circular
    padding: 15,
    marginLeft: 10,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyMessage: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  commentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginRight: 10,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  snackbar: { backgroundColor: COLORS.shadow, marginBottom: 10 },
});

export default Comment;
