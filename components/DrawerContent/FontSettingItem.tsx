import { useFontScale } from "@/contexts/FontScaleContext";
import { useTheme } from "@/contexts/ThemeContext";
import Slider from "@react-native-community/slider";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

export default function FontSettingItem({
  styles,
  isActive,
  onPress,
}: {
  styles: any;
  isActive?: boolean;
  onPress: () => void;
}) {
  const { fontScale, setFontScale } = useFontScale();
  const { isDarkMode, themeColors } = useTheme();
  return (
    <TouchableOpacity style={styles.settingsItem} onPress={onPress}>
      <View style={styles.settingsIcon}>
        <View style={styles.fontIcon}>
          <Text style={[styles.fontText, isDarkMode ? { color: "#ccc" } : {}]}>
            A
          </Text>
          <Text
            style={[styles.fontTextSmall, isDarkMode ? { color: "#999" } : {}]}
          >
            A
          </Text>
        </View>
      </View>
      {/* 조건부 렌더링: isActive가 true일 때만 슬라이더 표시 */}
      {isActive && (
        <View style={{ marginTop: 10 }}>
          <Slider
            minimumValue={0.8}
            maximumValue={1.2}
            step={0.1}
            value={fontScale}
            onSlidingComplete={(value) => {
              setFontScale(value);
              console.log("Selected font Scale:", value);
            }}
            minimumTrackTintColor={isDarkMode ? "#1EB1FC" : "#1E90FF"}
            maximumTrackTintColor={isDarkMode ? "#d3d3d3" : "#000000"}
            thumbTintColor="#1EB1FC"
            style={{ width: 135 }}
          />
        </View>
      )}
      <Text
        style={[
          styles.settingsText,
          { color: themeColors.text },
          { fontSize: styles.settingsText.fontSize * fontScale },
        ]}
      >
        글자크기
      </Text>
    </TouchableOpacity>
  );
}
