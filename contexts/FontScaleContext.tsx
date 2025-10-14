import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export enum FontScaleType {
  XS = 0.8,
  S = 0.9,
  M = 1,
  L = 1.1,
  XL = 1.2,
}

interface FontScaleContextType {
  fontScale: number;
  setFontScale: (scale: FontScaleType | number) => void;
}

const FontScaleContext = createContext<FontScaleContextType | undefined>(
  undefined
);

export const useFontScale = () => {
  /**
   * return font size context value of the nearest parent node.
   *
   * # Attributes
   *
   * - `fontSize`: `FontSize|number`. size of font
   * - `setFontSize`: `(size: FontSize | number) => void`. update font size to `size`
   */
  const context = useContext(FontScaleContext);
  if (!context) {
    throw new Error("useFontScale must be used within a ThemeProvider");
  }
  return context;
};

export const FontScaleProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [fontScale, setFontScale] = useState<FontScaleType | number>(
    FontScaleType.M
  );

  // 저장된 폰트 스케일 설정 로딩
  useEffect(() => {
    const loadFontScale = async () => {
      try {
        const savedFontScale = await AsyncStorage.getItem("fontScale");
        if (savedFontScale !== null) {
          setFontScale(JSON.parse(savedFontScale));
        }
      } catch (error) {
        console.error("Failed to load font size:", error);
      }
    };
    loadFontScale();
  }, []);

  // 메모이제이션으로 불필요 렌더링 방지
  const value = useMemo(() => {
    AsyncStorage.setItem("fontcale", JSON.stringify(fontScale));
    return { fontScale, setFontScale };
  }, [fontScale]);

  return (
    <FontScaleContext.Provider value={value}>
      {children}
    </FontScaleContext.Provider>
  );
};
