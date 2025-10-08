import Slider from "@react-native-community/slider"; // 필요에 따라 설치 및 import
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
  return (
    <TouchableOpacity style={styles.settingsItem} onPress={onPress}>
      <View style={styles.settingsIcon}>
        <View style={styles.fontIcon}>
          <Text style={styles.fontText}>A</Text>
          <Text style={styles.fontTextSmall}>A</Text>
        </View>
      </View>
      {/* 조건부 렌더링: isActive가 true일 때만 슬라이더 표시 */}
      {isActive && (
        <View style={{ marginTop: 10 }}>
          <Slider
            minimumValue={12}
            maximumValue={32}
            step={1}
            value={16}
            onValueChange={(value) => {
              /* 글자 크기 변경 핸들러 구현 필요 */
            }}
            style={{ width: 150 }}
          />
        </View>
      )}
      <Text style={styles.settingsText}>글자크기</Text>
    </TouchableOpacity>
  );
}
