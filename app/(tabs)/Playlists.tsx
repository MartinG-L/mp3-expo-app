import ModalCreatePlaylist from "@/components/modals/ModalCreatePlaylist";
import ModalPlaylists from "@/components/modals/ModalPlaylists";
import { Text } from "@/components/mytext";
import { useAudioState } from "@/contexts/AudioStateContext";
import { useAuth } from "@/contexts/AuthContext";
import { useAudio } from "@/contexts/PlayerContext";
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";
import axiosInstance from "../utils/axiosInstance";

export default function Playlists() {
  interface Playlists {
    id: number;
    name: String;
    description: String;
    thumbnail: String;
    createdAt: number;
    songCount: number;
    isDefault: boolean;
  }

  interface Song {
    id: number;
    title: string;
    videoId: string;
    urlThumbnail: string;
    duration: number;
  }

  interface PlayListData {
    id: number;
    name: String;
    description: String;
    thumbnail: String;
    created_at: number;
    is_default: boolean;
    songCount: number;
    songs: Song[];
  }

  const { logout, userId, token } = useAuth();
  const { setQueue, PlayerHeight, setListUserPlaylist, listUserPlaylist } =
    useAudio();
  const { currentSongData } = useAudioState();
  const [playLists, setplayLists] = useState<Playlists[]>([]);
  const [playListData, setplayListData] = useState<PlayListData | null>(null);
  const [ModalPlaylistVisible, setModalPlaylistVisible] = useState(false);
  const [loadingSongsPlaylist, setLoadingSongsPlaylist] = useState(false);
  const [ModalCreatePlaylistVisible, setModalCreatePlaylistVisible] =
    useState(false);
  const [titlePlaylist, settitlePlaylist] = useState("");
  const [descriptionPlaylist, setDescriptionPlaylist] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [modalTitlePlaylist, setModalTitlePlaylist] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function fetchPlaylist() {
    try {
      const playlists = await AsyncStorage.getItem("listUserPlaylist");
      if (playlists) {
        const parse: Playlists[] = JSON.parse(playlists);
        setplayLists(parse);
      }
    } catch (error: any) {
      if (!error.response) {
        setErrorMessage("No se pudo conectar al servidor.");
      } else if (error.response.status >= 500) {
        setErrorMessage("Error del servidor. Intente mas tarde.");
      } else {
        setErrorMessage("Ocurrio un error inesperado.");
      }
    }
  }

  useEffect(() => {
    if (playListData && listUserPlaylist) {
      const updatedPlaylist = listUserPlaylist.find(
        (p) => p.id === playListData.id,
      );
      if (updatedPlaylist) {
        setplayListData({
          id: updatedPlaylist.id,
          name: updatedPlaylist.name,
          description: updatedPlaylist.description,
          thumbnail: updatedPlaylist.thumbnail,
          created_at: updatedPlaylist.created_at,
          is_default: updatedPlaylist.is_default,
          songCount: updatedPlaylist.songCount,
          songs: updatedPlaylist.songs,
        });
      }
    }
  }, [listUserPlaylist]);

  async function handlePlaylistModal(playlist: any) {
    setLoadingSongsPlaylist(true);
    setModalPlaylistVisible(true);
    setIsDefault(playlist.is_default);
    // Info para el modal crear
    settitlePlaylist(playlist.name.toString());
    setDescriptionPlaylist(playlist.description.toString());

    // Si ya tiene canciones cargadas, no llamamos al backend
    if (playlist.songs && playlist.songs.length > 0) {
      setplayListData({
        ...playlist,
        created_at: playlist.createdAt ?? playlist.created_at,
        is_default: playlist.isDefault ?? playlist.is_default,
      });
      setLoadingSongsPlaylist(false);
      return;
    }

    try {
      const reqSongs = await axiosInstance.get(
        `/api/albums/${playlist.id}/songs`,
      );
      const playlistSongs = reqSongs.data.map((song: any) => ({
        id: song.id,
        title: song.title,
        videoId: song.videoId,
        urlThumbnail: song.thumbnail,
        duration: song.duration,
      }));

      // Actualizamos la playlist que ya tenemos en el estado global con las canciones obtenidas async storage
      setListUserPlaylist((prev) =>
        prev.map((p) =>
          p.id === playlist.id ? { ...p, songs: playlistSongs } : p,
        ),
      );

      setplayListData({
        id: playlist.id,
        name: playlist.name,
        description: playlist.description,
        thumbnail: playlist.thumbnail,
        created_at: playlist.createdAt,
        is_default: playlist.isDefault,
        songCount: playlist.songCount,
        songs: playlistSongs || [],
      });
    } catch (e: any) {
      console.log(e);
    } finally {
      setLoadingSongsPlaylist(false);
    }
  }

  return (
    <View
      style={{
        display: "flex",
        flex: 1,
        marginBottom: currentSongData ? PlayerHeight : 0,
      }}
    >
      {/* Header "Tus Playlist" */}
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          marginVertical: 20,
          justifyContent: "space-between",
          paddingHorizontal: 20,
        }}
      >
        <Text
          style={{
            color: "white",
            fontSize: 20,
            fontWeight: "bold",
          }}
        >
          Tus Playlists
        </Text>
        <TouchableOpacity
          style={{ padding: 5 }}
          onPress={() => setModalCreatePlaylistVisible(true)}
        >
          <MaterialIcons name="add" size={22} color="white" />
        </TouchableOpacity>
      </View>
      {/* PLAYLISTS */}
      {errorMessage ? (
        <View style={{ paddingHorizontal: 20, marginTop: 10 }}>
          <Text style={{ color: "red" }}>{errorMessage}</Text>
        </View>
      ) : (
        <ScrollView>
          <View style={{ display: "flex", flex: 1, width: "100%" }}>
            {listUserPlaylist?.map((playlist) => (
              <TouchableOpacity
                key={playlist.id}
                style={{
                  backgroundColor: "#111",
                  paddingHorizontal: 20,
                  paddingVertical: 20,
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 12,
                }}
                onPress={() => handlePlaylistModal(playlist)}
              >
                <View
                  style={{
                    backgroundColor: "gray",
                    width: 70,
                    height: 70,
                    marginRight: 10,
                  }}
                >
                  <View
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      backgroundColor: "rgba(0,0,0,0.6)",
                      flexDirection: "row",
                      justifyContent: "center",
                      alignItems: "center",
                      paddingVertical: 2,
                    }}
                  >
                    <Text
                      style={{
                        color: "white",
                        fontSize: 11,
                        fontWeight: "bold",
                      }}
                    >
                      {playlist.songCount}
                    </Text>
                    <MaterialIcons name="music-note" size={11} color="white" />
                  </View>
                </View>
                <View
                  style={{ display: "flex", flexDirection: "column", gap: 5 }}
                >
                  <Text
                    style={{ color: "white", fontWeight: "bold", fontSize: 17 }}
                  >
                    {playlist.name}
                  </Text>
                  {playlist.description ? (
                    <Text style={{ color: "white", fontSize: 12 }}>
                      {playlist.description}
                    </Text>
                  ) : null}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}
      {/* Modal playlist */}
      {ModalPlaylistVisible && (
        <ModalPlaylists
          setplayListData={setplayListData}
          playListData={playListData}
          setModalPlaylistVisible={setModalPlaylistVisible}
          setLoadingSongsPLaylist={setLoadingSongsPlaylist}
          LoadingSongsPLaylist={loadingSongsPlaylist}
          isDefault={isDefault}
          onDeleted={() => {
            setModalPlaylistVisible(false);
            setplayListData(null);
          }}
          setIsEditing={setIsEditing}
          setModalCreatePlaylistVisible={setModalCreatePlaylistVisible}
        ></ModalPlaylists>
      )}
      {/* Modal CreatePlaylist */}
      {ModalCreatePlaylistVisible && (
        <ModalCreatePlaylist
          setModalCreatePlaylistVisible={setModalCreatePlaylistVisible}
          setTitlePlaylist={settitlePlaylist}
          setDescriptionPlaylist={setDescriptionPlaylist}
          titlePlaylist={titlePlaylist}
          descriptionPlaylist={descriptionPlaylist}
          onSave={() => {}}
          isEditingPlaylist={isEditing}
          playListData={playListData}
          modalVisible={ModalCreatePlaylistVisible}
        />
      )}
    </View>
  );
}
