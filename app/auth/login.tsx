import { useAuth } from "@/contexts/AuthContext";
import { useAudio } from "@/contexts/PlayerContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import axiosInstance from "../utils/axiosInstance";


export default function Login() {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const {saveToken, saveUserId, isLoggingIn} = useAuth();
    const {setLikedSongs, likedSongs} = useAudio();

    const isDisabled = !username.trim() || !password.trim() || isLoading;

    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    const login = async () => {
      if (isDisabled) return;
      setIsLoading(true);
      setError("");
  
      try {
        const res = await axiosInstance.post("/login", {
          username,
          password,
        });

        const jwtToken = res.data.jwTtoken;
        const userId = res.data.userId;
        
        if (!jwtToken) {
            setError("Error: no se recibio token del servidor");
            return;
        }

        saveToken(jwtToken);
        saveUserId(userId);

        const videosIds: string[] = (await axiosInstance.get(`/api/albums/${userId}/liked-songs-ids`)).data;
        const newSet = new Set(videosIds);
        setLikedSongs(newSet); 
        await AsyncStorage.removeItem("likedSongs");
        await AsyncStorage.setItem("likedSongs", JSON.stringify(Array.from(newSet))); 
        await delay(1200);
        router.replace("/(tabs)");
      } catch (e: any) {
        if (!e.response) {
          // Sin respuesta = servidor caido o sin internet
          setError("No se pudo conectar al servidor.");
        } else if (e.response.status === 401 || e.response.status === 403) {
          // Error de autenticación
          setError("Usuario o contrasena incorrectos");
        } else if (e.response.status >= 500) {
          // Error del servidor
          setError("Error en el servidor. Intenta mas tarde.");
        } else {
          // Otro error
          setError("Ocurrio un error inesperado");
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (isLoggingIn) {
      return (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "black",
          }}
        >
          <Text
            style={{
              color: "white",
              fontSize: 32,
              fontWeight: "bold",
            }}
          >
            Bienvenido Martin!
          </Text>
          <ActivityIndicator
            size="large"
            style={{ marginTop: 20 }}
            color="#FFD700"
          />
        </View>
      );
    }


    return (
    <View style={{ padding: 20, width: "65%", margin: "auto" }}>
        <TextInput placeholder="Usuario" value={username} onChangeText={setUsername} 
        placeholderTextColor="rgba(255, 255, 255, 0.3)"
        style={{
            color:"white",
            paddingVertical: 10,
            paddingHorizontal: 5,
            marginVertical: 5,
        }} 
        />
        <TextInput
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholderTextColor="rgba(255, 255, 255, 0.3)"
        style={{
            color:"white",
            paddingVertical: 10,
            marginVertical: 5,
            paddingHorizontal: 5
        }}
        />
        {error ? <Text style={{ color: "red", textAlign:"center" }}>{error}</Text> : null}

        <Pressable 
          style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
              isLoading && styles.buttonDisabled,
              isDisabled && styles.buttonDisabled
            ]}
            onPress={login}
            disabled={isDisabled}
          >
          {isLoading ? (
              <ActivityIndicator color="#fff" />
          ) : (
              <Text style={styles.buttonText}>Iniciar Sesion</Text>
          )}
        </Pressable>
    </View>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#000',
  },
  input: {
    backgroundColor: '#1c1c1e',
    color: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#2fa0d4ff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonPressed: {
    opacity: 0.7,
  },
  buttonDisabled: {
    opacity: .5
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  error: {
    color: '#ff3b30',
    marginBottom: 10,
    textAlign: 'center',
  },
});
