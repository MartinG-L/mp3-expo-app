import { MaterialIcons } from "@expo/vector-icons";
import { KeyboardAvoidingView, Platform, Pressable, Text, TextInput, TouchableOpacity, View } from "react-native";

interface props {
  setModalCreatePlaylistVisible: (visible: boolean) => void;
}

export default function ModalCreatePlaylist({
  setModalCreatePlaylistVisible
}:props){
 return(
    <KeyboardAvoidingView
    behavior={Platform.OS === "ios" ? "padding" : "height"}
    style={{
        width: "60%",
        display: "flex",
        alignSelf: "center",
        position: "absolute",
        backgroundColor: "#353535ff",
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 5
    }}>
    {/* Header */}
    <View style={{
        display: "flex",
        flexDirection: "row",
        alignContent: "center",
        justifyContent: "space-between",
    }}>
      <Text style={{color: "white", fontSize: 18, fontWeight: "bold"}}>Crear nueva Playlist!</Text>
      <TouchableOpacity onPress={()=>setModalCreatePlaylistVisible(false)}>
       <MaterialIcons size={18} name={"close"} color={"white"}></MaterialIcons>
      </TouchableOpacity>
    </View>

    {/* Form */}
    <View style={{marginTop: 15}}>
        <TextInput 
        placeholder="Titulo de la playlist"
        placeholderTextColor="rgba(255, 255, 255, 0.3)"
        style={{
            paddingVertical: 10,
            paddingHorizontal: 7,
            color: "white",
            borderWidth: 1,
            borderColor: "#777",
            borderRadius: 3,
        }}
        ></TextInput>
    </View>

    {/* Actions */}
    <View style={{marginTop: 15}}>
        <Pressable style={{
            backgroundColor: "#1b1b1bff",
            maxWidth: 80,
            paddingVertical: 7,
            paddingHorizontal: 7,
            alignItems: "center",
            borderRadius: 3,
        }}><Text style={{color: "white"}}>Guardar</Text></Pressable>
    </View>

  </KeyboardAvoidingView>
 )
}
