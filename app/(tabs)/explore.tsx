import ImgFrame from "@/components/ImgFrame";
import axios from "axios";
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function App() {
  const router = useRouter();
  const [imageUri, setImageUri] = useState<string | null>(null);
  // const [base64Data, setBase64Data] = useState<string | null>(null);
  const base64Ref = useRef<string | null>(null);
  const sentDisabled: boolean = imageUri === null || imageUri === undefined;

  useEffect(() => {
    // 1. 함수가 정의됨. 매 렌더링(굳이?) 이후에 해당 이펙트 실행
    // 2. 실행하는 코드 안에서 비동기 함수를 정의 후 바로 실행한 뒤 결과 반환을 하지만 결과가 딱히 안 보임
    // 3. 함수가 반환되었으므로, 이펙트 실행 이후 반환된 함수가 실행
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
      // console.log(asset);

      try {
        const base64 = await convertToJpegBase64(asset.uri);
        // setBase64Data(base64 || null);
        base64Ref.current = base64 || null;
        console.log(base64Ref.current?.substring(0, 50));
        setImageUri(asset.uri);
      } catch (err) {
        console.error("📛 base64 변환 실패:", err);
        Alert.alert("이미지를 처리할 수 없습니다.");
      }
    }
  };

  const uploadImage = async () => {
    if (!base64Ref.current) return;

    try {
      console.log("업로드할 base64 길이:", base64Ref.current?.length);
      console.log("업로드할 데이터: ", base64Ref.current.substring(0, 50));
      const res = await axios.post(
        "http://172.17.108.1:8000/analyze/",
        {
          image_base64: base64Ref.current,
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      const responseData = res.data;
      console.log(responseData.solution);
      router.push({
        pathname: "/result",
        params: responseData,
      });
    } catch (error: any) {
      console.error("❌ axios 에러:", error?.message || error);
      Alert.alert("업로드 실패", "서버에 연결할 수 없습니다.");
    }
  };
  return (
    <ScrollView
      contentContainerStyle={{ marginTop: "7.5%", marginHorizontal: "7.5%" }}
    >
      <ImgFrame style={{ width: "100%", aspectRatio: 1 / 1 }}>
        {imageUri && (
          <Image
            source={{ uri: imageUri }}
            style={{ width: "100%", height: "100%" }}
          />
        )}
      </ImgFrame>
      <View style={styles.container}>
        <TouchableOpacity
          style={StyleSheet.compose(styles.button, {
            flexGrow: 1,
            borderRadius: "5%",
          })}
          onPress={() => handleImagePick(true)}
        >
          <Text>📷 사진 촬영</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={StyleSheet.compose(styles.button, {
            flexGrow: 1,
            borderRadius: "5%",
          })}
          onPress={() => handleImagePick(false)}
        >
          <Text>📁 갤러리 선택</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={StyleSheet.compose(styles.button, {
            flexGrow: 2,
            borderRadius: "2.5%",
            backgroundColor: sentDisabled ? "#d5d5f1ff" : "#9090ff",
          })}
          disabled={sentDisabled}
          onPress={uploadImage /* () => alert("WIP")*/}
        >
          <Text>AI에게 전송</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flexWrap: "wrap",
    width: "100%",
    flexDirection: "row",
    flexBasis: 0,
    flexGrow: 1,
  },
  button: {
    alignItems: "center",
    backgroundColor: "#9090ff",
    padding: 10,
    outlineColor: "#160fff",
    outlineWidth: 1,
    margin: 2,
    width: "45%",
  },
});
