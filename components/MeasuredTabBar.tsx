import { useAudio } from '@/contexts/PlayerContext';
import {
  BottomTabBar,
  BottomTabBarProps,
} from '@react-navigation/bottom-tabs';
import React from 'react';
import { View } from 'react-native';

export function MeasuredTabBar(props: BottomTabBarProps) {
  const {setTabBarHeight} = useAudio();
  return (
    <View
      onLayout={(e) => {
        const height = e.nativeEvent.layout.height;
        setTabBarHeight(height);
      }}
    >
      <BottomTabBar {...props} />
    </View>
  );
}
