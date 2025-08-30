import ImgFrame from "@/components/ImgFrame";
import { useLocalSearchParams } from "expo-router";
import { marked } from "marked";
import React from "react";
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import RenderHTML from "react-native-render-html";
import { SafeAreaProvider } from "react-native-safe-area-context";

marked.use({
  async: false,
});
const testString = `
# 제목 1

## 제목 2

### 제목 3

일반 텍스트입니다. **굵은 텍스트**, *기울임 텍스트*, ~~취소선~~도 포함되어 있어요.

---

> 이것은 인용문입니다. 여러 줄도 가능합니다.
> 두 번째 줄입니다.

---

- 순서 없는 리스트 항목 1
- 순서 없는 리스트 항목 2
  - 하위 항목
    - 더 하위 항목

1. 순서 있는 리스트 항목 1
2. 순서 있는 리스트 항목 2
   1. 하위 항목
   2. 또 다른 하위 항목

---

링크 예시

---

| 테이블 헤더 1 | 테이블 헤더 2 |
|---------------|---------------|
| 셀 1          | 셀 2          |
| 셀 3          | 셀 4          |

---

HTML 태그도 사용할 수 있어요:  
<strong>굵은 텍스트</strong>와 <em>기울임</em>도 HTML로 표현 가능.
`;

type ResponseData = {
  problem: string;
  location: string;
  solution: string;
  imageUri: string;
};

export default function Result() {
  console.log("rendering result...");
  const _params: ResponseData = useLocalSearchParams<ResponseData>();
  const isEmpty = (obj: object) => Object.keys(obj).length === 0;
  const params: ResponseData = isEmpty(_params)
    ? {
        problem: "정의되지 않음",
        location: "정의되지 않음",
        solution: testString,
        imageUri: "https://legacy.reactjs.org/logo-og.png",
      }
    : _params;

  // const [solutionHtml, setSolutionHtml] = useState("");
  const solutionHtml = marked.parse(params.solution);

  // useEffect(() => {
  //   const convertMarkdown = async () => {
  //     const html = await marked.parse(params.solution);
  //     setSolutionHtml(html);
  //   };

  //   convertMarkdown();
  // }, [params.solution]);

  console.log(solutionHtml);
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container0}>
        <View
          style={StyleSheet.compose(styles.container1, {
            flexBasis: "15%",
          })}
        >
          <ImgFrame style={styles.image}>
            <Image
              source={{ uri: params.imageUri }}
              style={{ width: "100%", height: "100%" }}
            />
          </ImgFrame>
          <Text style={styles.summary}>
            <ul style={{ backgroundColor: "lime" }}>
              <li>문제 유형: {params.problem}</li>
            </ul>
            <ul style={{ backgroundColor: "lime" }}>
              <li>문제 발생 위치: {params.location}</li>
            </ul>
            {/* </Text>
          <Text
            style={StyleSheet.compose(
              { marginTop: 10, color: "black" },
              styles.summary
            )}
          > */}
          </Text>
        </View>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={{ margin: 10 }}
        >
          <View>
            <RenderHTML
              // @ts-ignore
              source={{ html: solutionHtml }}
              tagsStyles={{
                strong: {
                  fontWeight: "bold",
                },
                hr: {
                  backgroundColor: "#909090",
                  height: "2px",
                },
              }}
            ></RenderHTML>
          </View>
        </ScrollView>
        <View
          style={StyleSheet.compose(styles.container1, {
            flexGrow: 1,
            flexShrink: 0,
            flexBasis: 80,
            flexWrap: "wrap",
            justifyContent: "space-evenly",
          })}
        >
          <TouchableOpacity
            style={StyleSheet.compose(styles.button, {
              flexGrow: 1,
              borderRadius: "5%",
            })}
            // onPress={() => handleImagePick(true)}
          >
            <Text>📷 사진 다시 찍기</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={StyleSheet.compose(styles.button, {
              flexGrow: 1,
              borderRadius: "5%",
            })}
            // onPress={() => handleImagePick(false)}
          >
            <Text>📁 사진 다시 선택하기</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={StyleSheet.compose(styles.button, {
              flexGrow: 2,
              borderRadius: "2.5%",
              backgroundColor: "#9090ff",
            })}
          >
            <Text>검색 화면으로 돌아가기</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  // containter properties
  container0: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
  },
  container1: {
    flexGrow: 0,
    flexShrink: 0,
    margin: 3,
    display: "flex",
    flexDirection: "row",
  },
  // summaryContainer: {},
  buttonContainer: {},

  // item properties. flex direction is row.
  image: {
    aspectRatio: 1 / 1,
    height: "100%",
    backgroundColor: "#909090",
    flexGrow: 0,
    flexShrink: 0,
  },

  summary: {
    // props as item
    flexGrow: 1,
    flexShrink: 0,
    flexBasis: "auto",
    color: "black",
    backgroundColor: "#aaaaaa",

    // props as container
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-evenly",
  },
  scroll: {
    // this component doesn't get inside container 1. flex direction is column.
    flexBasis: "45%",
    flexGrow: 0,
    flexShrink: 1,
    borderColor: "black",
    borderWidth: 3,
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
