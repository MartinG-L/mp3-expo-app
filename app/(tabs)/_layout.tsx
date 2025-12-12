import Player from '@/components/ui/Player';
import { UserPopoverTab } from '@/components/UserPopoverTab';
import { AudioProvider } from '@/contexts/PlayerContext';
import { MaterialIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';



export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = insets.bottom + 49; 
  return (
      <AudioProvider>
        <Tabs screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: "#FFD700",   
          tabBarInactiveTintColor: "#888888", 
        }}>
          
          <Tabs.Screen
          name="index"
          options={{
            title: "Inicio",
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="home" size={24} color={color} />
            ),
          }} />

          <Tabs.Screen
          name="Search"
          options={{
            title: "Buscar",
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="search" size={24} color={color} />
            ),
          }} />

          <Tabs.Screen
          name="UserScreen"
          options={{
            title: "",
            tabBarButton: (props) => <UserPopoverTab {...props} />,
          }}
          />
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