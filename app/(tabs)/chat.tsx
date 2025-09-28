import TypingText from "@/components/TypingText";
import { createApiClient } from "@/config/api";
import { useTheme } from "@/contexts/ThemeContext";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  isTyping?: boolean; // 타이핑 효과 여부
}

export default function ChatScreen() {
  const { themeColors } = useTheme();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "안녕하세요! 홈 수리 관련해서 도움이 필요하시면 언제든 말씀해주세요. 🏠",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    // 사용자 메시지 생성
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const apiClient = createApiClient();
      const response = await apiClient.post("/chat/", {
        message: inputText.trim(),
      });

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.data.response,
        isUser: false,
        timestamp: new Date(),
        isTyping: true, // 타이핑 효과
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error: any) {
      console.error("채팅 에러:", error?.message || error);
      Alert.alert("오류", "메시지를 전송할 수 없습니다.");

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "죄송합니다. 일시적인 오류가 발생했습니다. 다시 시도해주세요.",
        isUser: false,
        timestamp: new Date(),
        isTyping: true, // 타이핑 효과
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setInputText("");
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView
        style={[styles.container, { backgroundColor: themeColors.background }]}
        edges={["top", "left", "right", "bottom"]}
      >
        <KeyboardAvoidingView
          style={styles.keyboardContainer}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContent}
          >
            {messages.map((message) => (
              <View
                key={message.id}
                style={[
                  styles.messageContainer,
                  message.isUser ? styles.userMessage : styles.botMessage,
                ]}
              >
                <View
                  style={[
                    styles.messageBubble,
                    message.isUser ? styles.userBubble : styles.botBubble,
                  ]}
                >
                  {message.text &&
                    (message.isTyping && !message.isUser ? (
                      <TypingText
                        text={message.text}
                        speed={30}
                        style={[
                          styles.messageText,
                          message.isUser ? styles.userText : styles.botText,
                          { color: themeColors.text },
                        ]}
                        onComplete={() => {
                          setMessages((prev) =>
                            prev.map((msg) =>
                              msg.id === message.id
                                ? { ...msg, isTyping: false }
                                : msg
                            )
                          );
                        }}
                      />
                    ) : (
                      <Text
                        style={[
                          styles.messageText,
                          message.isUser ? styles.userText : styles.botText,
                          { color: themeColors.text },
                        ]}
                      >
                        {message.text}
                      </Text>
                    ))}
                </View>
                <Text
                  style={[
                    styles.timestamp,
                    message.isUser ? styles.userTimestamp : styles.botTimestamp,
                    { color: themeColors.text },
                  ]}
                >
                  {formatTime(message.timestamp)}
                </Text>
              </View>
            ))}

            {isLoading && (
              <View style={[styles.messageContainer, styles.botMessage]}>
                <View style={[styles.messageBubble, styles.botBubble]}>
                  <Text
                    style={[
                      styles.messageText,
                      styles.botText,
                      { color: themeColors.text },
                    ]}
                  >
                    입력 중...
                  </Text>
                </View>
              </View>
            )}
          </ScrollView>

          <View style={styles.inputContainer}>
            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: themeColors.inputBackground,
                  color: themeColors.text,
                },
              ]}
              value={inputText}
              onChangeText={setInputText}
              placeholder="홈 수리 관련 질문을 입력하세요..."
              placeholderTextColor={themeColors.text}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!inputText.trim() || isLoading) && styles.sendButtonDisabled,
              ]}
              onPress={sendMessage}
              disabled={!inputText.trim() || isLoading}
            >
              <Text style={styles.sendButtonText}>전송</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  keyboardContainer: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },
  messageContainer: {
    marginBottom: 16,
  },
  userMessage: {
    alignItems: "flex-end",
  },
  botMessage: {
    alignItems: "flex-start",
  },
  messageBubble: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 18,
  },
  userBubble: {
    backgroundColor: "#007AFF",
    borderBottomRightRadius: 4,
  },
  botBubble: {
    borderBottomLeftRadius: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: "white",
  },
  botText: {},
  timestamp: {
    fontSize: 12,
    marginTop: 4,
    opacity: 0.6,
  },
  userTimestamp: {
    textAlign: "right",
  },
  botTimestamp: {
    textAlign: "left",
  },
  inputContainer: {
    flexDirection: "row",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    alignItems: "flex-end",
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: "#007AFF",
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    backgroundColor: "#ccc",
  },
  sendButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
