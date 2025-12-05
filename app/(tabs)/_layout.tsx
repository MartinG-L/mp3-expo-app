import Player from '@/components/ui/Player';
import { AudioProvider } from '@/contexts/PlayerContext';
import { Tabs } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';



export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = insets.bottom + 49; 
  return (
      <AudioProvider>
        <Tabs>
        </Tabs>

        {/* Player global */}
        <View style={{
          position: "absolute",
          bottom: tabBarHeight,
          left: 0,
          right: 0,
          flex: 1,
          width: "100%",
          zIndex: 999, 
        }}>
          <Player />
        </View>
      </AudioProvider>
  );
};