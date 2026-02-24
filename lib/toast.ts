import { toast } from "@/lib/sonner";
import { Platform } from "react-native";

export const showSuccess = (message: string) => {
  if (Platform.OS === "web") {
    toast.success(message as any, {
      className: "toast-success",
    } as any);
  } else {
    toast.success(message, {
      style: {
        backgroundColor: "#1e1a1a",
        borderWidth: 1,
        borderColor: "#333",
        borderRadius: 8,
        padding: 12,
        marginTop: 10,
        elevation: 5,
      }, 
    });
  }
};

export const showError = (message: string) => {
  if (Platform.OS === "web") {
    toast.error(message as any, {
      className: "toast-error",
    } as any);
  } else {
    toast.error(message, {
      style: {
        backgroundColor: "#1e1a1a",
        borderWidth: 1,
        borderColor: "#333",
        borderRadius: 8,
        padding: 12,
      },
    })
    toast.error(message, {
      style: {
        backgroundColor: "#1e1a1a",
        borderWidth: 1,
        borderColor: "#333",
        borderRadius: 8,
        padding: 12,
      },
    })
  }
};
