import React from "react";
import { GestureResponderEvent, StyleSheet, View } from "react-native";

interface VerticalSliderProps {
  height?: number;
  min?: number;
  max?: number;
  value: number;
  onChange: (value: number) => void;
}

export default function VerticalSlider({
  height = 150,
  min = 0,
  max = 1,
  value,
  onChange,
}: VerticalSliderProps) {
  const THUMB_SIZE = 15;
  const effectiveHeight = height - THUMB_SIZE;
  
  // Referencia para almacenar la pos inicial del contenedor
  const containerRef = React.useRef<View>(null);

  const clamp = (v: number, minVal: number, maxVal: number) =>
    Math.min(Math.max(v, minVal), maxVal);

  const handleTouch = (evt: GestureResponderEvent) => {
    // Método más confiable para obtener la posición del touch
    const touchY = evt.nativeEvent.pageY;
    
    containerRef.current?.measure((x, y, width, height, pageX, pageY) => {
      if (!pageY) return;
      
      const relativeY = touchY - pageY - THUMB_SIZE / 2;
      const clampedY = clamp(relativeY, 0, effectiveHeight);
      
      const percentage = 1 - (clampedY / effectiveHeight);
      const newValue = min + percentage * (max - min);
      
      onChange(Number(clamp(newValue, min, max).toFixed(2)));
    });
  };

  const thumbPosition = effectiveHeight - ((value - min) / (max - min)) * effectiveHeight;
  const fillHeight = effectiveHeight - thumbPosition + THUMB_SIZE / 2;

  return (
    <View 
      ref={containerRef}
      style={[styles.container, { height }]}
      onStartShouldSetResponder={() => true}
      onMoveShouldSetResponder={() => true}
      onResponderGrant={handleTouch}
      onResponderMove={handleTouch}
      onResponderRelease={() => {
        // Opcional: manejar release si necesitas
      }}
    >
      <View style={styles.track} />
      <View style={[styles.fill, { height: fillHeight }]} />
      <View style={[styles.thumb, { top: thumbPosition }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 30,
    justifyContent: "flex-start",
    alignItems: "center",
    position: "relative",
    backgroundColor: "transparent",
  },
  track: {
    position: "absolute",
    width: 4,
    height: "100%",
    backgroundColor: "#333",
    borderRadius: 3,
  },
  fill: {
    position: "absolute",
    bottom: 0,
    width: 4,
    backgroundColor: "#777",
    borderRadius: 3,
  },
  thumb: {
    position: "absolute",
    width: 15,
    height: 15,
    borderRadius: 10,
    backgroundColor: "#777",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});