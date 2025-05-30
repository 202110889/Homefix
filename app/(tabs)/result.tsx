import { useLocalSearchParams } from "expo-router";
import { marked } from "marked";
import React, { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import RenderHTML from "react-native-render-html";

type ResponseData = {
  problem: string;
  location: string;
  solution: string;
};

export default function Result() {
  const params = useLocalSearchParams<ResponseData>();
  // const solMd = `${params.solution}`
  const [solution, setSolution] = useState("");
  marked.use({
    async: true,
    pedantic: true,
    gfm: false,
  });
  const setHtmlSol = async (src: string) => {
    const result = await marked.parse(src);
    setSolution(result);
  };
  setHtmlSol(params.solution);
  console.log(solution);
  return (
    <ScrollView contentContainerStyle={{ marginTop: 100, padding: 20 }}>
      <View style={{ marginTop: 20 }}>
        <Text style={{ marginTop: 10, color: "white" }}>
          문제: {params.problem}
        </Text>
        <Text style={{ marginTop: 10, color: "white" }}>
          위치: {params.location}
        </Text>
        <View style={{}}>
          <RenderHTML
            source={{ html: solution }}
            tagsStyles={{
              strong: {
                fontWeight: "bold",
              },
            }}
          ></RenderHTML>
        </View>
      </View>
    </ScrollView>
  );
}
