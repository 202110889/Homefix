import { getApiClient } from "@/config/api";
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  imageUri?: string;
}

export default function ChatScreen() {
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
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [selectedImageBase64, setSelectedImageBase64] = useState<string | null>(
    null
  );
  const scrollViewRef = useRef<ScrollView>(null);

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // 카메라 및 갤러리 권한 요청
    (async () => {
      const { status: cameraStatus } =
        await ImagePicker.requestCameraPermissionsAsync();
      const { status: mediaStatus } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (cameraStatus !== "granted" || mediaStatus !== "granted") {
        Alert.alert("카메라 및 갤러리 접근 권한이 필요합니다.");
      }
    })();
  }, []);

  const convertToJpegBase64 = async (uri: string) => {
    const result = await ImageManipulator.manipulateAsync(uri, [], {
      compress: 1,
      format: ImageManipulator.SaveFormat.JPEG,
      base64: true,
    });
    return result.base64;
  };

  const handleImagePick = async (fromCamera: boolean) => {
    const result = fromCamera
      ? await ImagePicker.launchCameraAsync({
          base64: true,
          quality: 1,
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
        })
      : await ImagePicker.launchImageLibraryAsync({
          base64: true,
          quality: 1,
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
        });

    if (!result.canceled && result.assets.length > 0) {
      const asset = result.assets[0];

      try {
        const base64 = await convertToJpegBase64(asset.uri);

        // 선택된 이미지 저장 (자동 전송하지 않음)
        setSelectedImageUri(asset.uri);
        setSelectedImageBase64(base64 || null);
        setShowImagePicker(false);
      } catch (err) {
        console.error("📛 이미지 처리 실패:", err);
        Alert.alert("이미지를 처리할 수 없습니다.");
      }
    }
  };

  const sendMessage = async () => {
    if ((!inputText.trim() && !selectedImageUri) || isLoading) return;

    // 사용자 메시지 생성
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
      imageUri: selectedImageUri || undefined,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      let response;

      if (selectedImageUri && selectedImageBase64) {
        // 이미지와 텍스트가 모두 있는 경우
        if (inputText.trim()) {
          const apiClient = await getApiClient();
          response = await apiClient.post("/analyze-with-text/", {
            image_base64: selectedImageBase64,
            message: inputText.trim(),
          });

          const responseData = response.data;
          const botMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: `이미지 분석 결과:\n\n문제: ${responseData.problem}\n위치: ${responseData.location}\n\n사용자 질문: ${responseData.user_message}\n\n해결책:\n${responseData.solution}`,
            isUser: false,
            timestamp: new Date(),
          };

          setMessages((prev) => [...prev, botMessage]);
        } else {
          // 이미지만 있는 경우
          const apiClient = await getApiClient();
          response = await apiClient.post("/analyze/", {
            image_base64: selectedImageBase64,
          });

          const responseData = response.data;
          const botMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: `이미지를 분석한 결과:\n\n문제: ${responseData.problem}\n위치: ${responseData.location}\n\n해결책:\n${responseData.solution}`,
            isUser: false,
            timestamp: new Date(),
          };

          setMessages((prev) => [...prev, botMessage]);
        }
      } else {
        // 텍스트만 있는 경우
        const apiClient = await getApiClient();
        response = await apiClient.post("/chat/", {
          message: inputText.trim(),
        });

        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: response.data.response,
          isUser: false,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, botMessage]);
      }
    } catch (error: any) {
      console.error("채팅 에러:", error?.message || error);
      Alert.alert("오류", "메시지를 전송할 수 없습니다.");

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "죄송합니다. 일시적인 오류가 발생했습니다. 다시 시도해주세요.",
        isUser: false,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setInputText("");
      setSelectedImageUri(null);
      setSelectedImageBase64(null);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
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
              {message.imageUri && (
                <Image
                  source={{ uri: message.imageUri }}
                  style={styles.messageImage}
                  resizeMode="cover"
                />
              )}
              {message.text && (
                <Text
                  style={[
                    styles.messageText,
                    message.isUser ? styles.userText : styles.botText,
                  ]}
                >
                  {message.text}
                </Text>
              )}
              <Text
                style={[
                  styles.timestamp,
                  message.isUser ? styles.userTimestamp : styles.botTimestamp,
                ]}
              >
                {formatTime(message.timestamp)}
              </Text>
            </View>
          </View>
        ))}
        {isLoading && (
          <View style={[styles.messageContainer, styles.botMessage]}>
            <View style={[styles.messageBubble, styles.botBubble]}>
              <Text style={[styles.messageText, styles.botText]}>
                입력 중...
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* 선택된 이미지 미리보기 */}
      {selectedImageUri && (
        <View style={styles.imagePreviewContainer}>
          <Image
            source={{ uri: selectedImageUri }}
            style={styles.imagePreview}
          />
          <TouchableOpacity
            style={styles.removeImageButton}
            onPress={() => {
              setSelectedImageUri(null);
              setSelectedImageBase64(null);
            }}
          >
            <Text style={styles.removeImageText}>✕</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.inputContainer}>
        <TouchableOpacity
          style={styles.galleryButton}
          onPress={() => setShowImagePicker(true)}
          disabled={isLoading}
        >
          <View style={styles.modalButtonContent}>
            <Image
              source={require("@/assets/images/add-image.png")}
              style={styles.modalIcon}
            />
          </View>
        </TouchableOpacity>
        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={setInputText}
          placeholder={
            selectedImageUri
              ? "이미지에 대한 질문을 입력하세요..."
              : "홈 수리 관련 질문을 입력하세요..."
          }
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            ((!inputText.trim() && !selectedImageUri) || isLoading) &&
              styles.sendButtonDisabled,
          ]}
          onPress={sendMessage}
          disabled={(!inputText.trim() && !selectedImageUri) || isLoading}
        >
          <Text style={styles.sendButtonText}>전송</Text>
        </TouchableOpacity>
      </View>

      {/* 이미지 선택 모달 */}
      <Modal
        visible={showImagePicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowImagePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>이미지 선택</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => handleImagePick(true)}
            >
              <View style={styles.modalButtonContent}>
                <Image
                  source={require("@/assets/images/camera.png")}
                  style={styles.modalIcon}
                />
                <Text style={styles.modalButtonText}>카메라로 촬영</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => handleImagePick(false)}
            >
              <View style={styles.modalButtonContent}>
                <Image
                  source={require("@/assets/images/gallery.png")}
                  style={styles.modalIcon}
                />
                <Text style={styles.modalButtonText}>갤러리에서 선택</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setShowImagePicker(false)}
            >
              <Text style={styles.cancelButtonText}>취소</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  messagesContent: {
    paddingVertical: 16,
  },
  messageContainer: {
    marginVertical: 4,
  },
  userMessage: {
    alignItems: "flex-end",
  },
  botMessage: {
    alignItems: "flex-start",
  },
  messageBubble: {
    maxWidth: "80%",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  userBubble: {
    backgroundColor: "#9090ff",
    borderBottomRightRadius: 4,
  },
  botBubble: {
    backgroundColor: "#ffffff",
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
    color: "#ffffff",
  },
  botText: {
    color: "#333333",
  },
  timestamp: {
    fontSize: 12,
    marginTop: 4,
  },
  userTimestamp: {
    color: "#ffffff",
    opacity: 0.8,
  },
  botTimestamp: {
    color: "#666666",
  },
  inputContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#ffffff",
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
    backgroundColor: "#f9f9f9",
  },
  sendButton: {
    backgroundColor: "#9090ff",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
  },
  sendButtonDisabled: {
    backgroundColor: "#d5d5f1ff",
  },
  sendButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  galleryButton: {
    backgroundColor: "#9090ff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  galleryButtonText: {
    fontSize: 20,
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
    marginBottom: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 20,
    width: "80%",
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 20,
    color: "#333333",
  },
  modalButton: {
    backgroundColor: "#9090ff",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: "center",
  },
  modalButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  modalButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  modalIcon: {
    width: 20,
    height: 20,
    tintColor: "#ffffff",
    marginRight: 8,
  },
  cancelButton: {
    backgroundColor: "#f0f0f0",
  },
  cancelButtonText: {
    color: "#666666",
    fontSize: 16,
    fontWeight: "600",
  },
  imagePreviewContainer: {
    position: "relative",
    marginHorizontal: 16,
    marginBottom: 8,
  },
  imagePreview: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  removeImageButton: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#ff4444",
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  removeImageText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "bold",
  },
});
