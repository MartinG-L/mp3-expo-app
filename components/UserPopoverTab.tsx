import { useAuth } from "@/contexts/AuthContext";
import { MaterialIcons } from "@expo/vector-icons";
import { BottomTabBarButtonProps } from "@react-navigation/bottom-tabs";
import * as PopoverPrimitive from '@rn-primitives/popover';
import { Pressable, Text } from "react-native";
import { PopoverContent, PopoverTrigger } from "./ui/popover";

export function UserPopoverTab({
  accessibilityState,
}: BottomTabBarButtonProps) {
  const { logout } = useAuth();

  return (
    <PopoverPrimitive.Root>
      <PopoverTrigger asChild>
        <Pressable
          style={{ padding: 10, justifyContent: "center", alignItems: "center" }}
        >
          <MaterialIcons
            name="person"
            size={26}
            color={accessibilityState?.selected ? "#F7C338" : "#b5b5b5"}
          />
        </Pressable>
      </PopoverTrigger>

      <PopoverContent
        side="top"
        sideOffset={10}
        style={{
          backgroundColor: "#222",
          borderRadius: 5,
          paddingVertical: 12,
          paddingHorizontal: 15,
          borderWidth: 1,
          borderColor: "#333",
        }}
      >
        <Pressable
          onPress={() => {
            logout();
          }}
        >
          <Text style={{ color: "white", fontSize: 14 }}>Cerrar sesion</Text>
        </Pressable>
      </PopoverContent>
    </PopoverPrimitive.Root>
  );
}
