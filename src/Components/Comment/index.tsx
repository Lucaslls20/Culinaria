import React, { useState } from "react";
import { View, Text, StyleSheet, FlatList, TextInput, Pressable } from "react-native";
import { Card } from "react-native-paper";
import Feather from "react-native-vector-icons/Feather";

interface CommentItem {
  id: string;
  userName: string;
  content: string;
  timestamp: string;
}

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
};

const Comment = ({ onClose }: { onClose: () => void }) => {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [input, setInput] = useState("");



  const addComment = () => {
    if (input.trim()) {
      const newComment: CommentItem = {
        id: Date.now().toString(),
        userName: "User Demo",
        content: input,
        timestamp: new Date().toISOString(),
      };
      setComments((prevComments) => [newComment, ...prevComments]);
      setInput("");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Comments</Text>
        <Text style={styles.commentCount}>{comments.length} Comments</Text>
      </View>
      {comments.length === 0 ? (
        <View style={styles.emptyMessage}>
          <Text style={styles.emptyText}>No comments yet. Be the first to comment!</Text>
        </View>
      ) : (
        <FlatList
          data={comments.sort(
            (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          )}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Card style={styles.commentCard}>
              <Card.Content>
                <Text style={styles.userName}>{item.userName}</Text>
                <Text style={styles.content}>{item.content}</Text>
                <Text style={styles.timestamp}>
                  {new Date(item.timestamp).toLocaleString()}
                </Text>
              </Card.Content>
            </Card>
          )}
        />
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter your comment"
          placeholderTextColor={COLORS.placeholder}
          value={input}
          onChangeText={setInput}
        />
        <Pressable style={styles.iconContainer} onPress={addComment}>
          <Feather name="arrow-up" color={COLORS.white} size={20} />
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 450,
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
    gap: 10
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.textPrimary,
  },
  commentCount: {
    fontSize: 16,
    color: COLORS.textSecondary,
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
  timestamp: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    backgroundColor: COLORS.white,
    borderColor: COLORS.shadow,
    elevation: 2,
    marginBottom: 10
  },
  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    padding: 12,
    marginLeft: 10,
    marginBottom: 10
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
  }
});

export default Comment;
