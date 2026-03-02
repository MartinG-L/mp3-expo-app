// CrearUsuario.tsx
import { useAuth } from '@/contexts/AuthContext';
import { showError, showSuccess } from '@/lib/toast';
import MaterialIcons from '@expo/vector-icons/build/MaterialIcons';
import React, { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import axiosInstance from '../utils/axiosInstance';

const CrearUsuario: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const {logout} = useAuth();
  

  const isDisabled = !username.trim() || !password.trim() || isLoading;

  const handleCreateUser = async () => {
    if (isDisabled) return;

    setIsLoading(true);

    try {
      const res = await axiosInstance.post('/admin/create-user', {
        username,
        password
      });
      if(res.status === 201) {
        showSuccess("Usuario " + "'" + res.data + "'" + " creado correctamente!");
      }

      setUsername("");
      setPassword("");
    } catch (err: any) {
      showError(err.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
   <View style={{ paddingHorizontal: 20, paddingVertical: 30, width: "80%", margin: "auto", maxWidth: 400, backgroundColor: "#111", borderRadius: 10 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
            <Text style={{ color: "#999", fontSize: 24, fontWeight: "bold", textAlign: "center", marginRight: 10 }}>Crear Nuevo Usuario</Text>
            <TouchableOpacity onPress={logout}>
                <MaterialIcons name="logout" size={28} color="#FF694D" />
            </TouchableOpacity>
        </View>
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
            onPress={handleCreateUser}
            disabled={isDisabled}
            >
            {isLoading ? (
            <ActivityIndicator color="#fff" />
            ) : (
            <Text style={styles.buttonText}>Crear Usuario</Text>
            )}
        </Pressable>
    </View>
  );
};

export default CrearUsuario;

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
    backgroundColor: '#FFD700',
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
    color: 'black',
    fontSize: 16,
    fontWeight: '600',
  },
  error: {
    color: '#ff3b30',
    marginBottom: 10,
    textAlign: 'center',
  },
});
