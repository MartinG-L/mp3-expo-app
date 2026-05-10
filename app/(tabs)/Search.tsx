import ModalPreciseSearchSongs from "@/components/modals/ModalPreciseSearchSongs";
import { useAudioState } from "@/contexts/AudioStateContext";
import { useAudio } from "@/contexts/PlayerContext";
import { Stack } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import axiosInstance from "../utils/axiosInstance";

interface videoResult {
  id: number;
  title: string;
  videoId: string;
  urlThumbnail: string;
  duration: number;
  recordingId?: string;
}

interface Artist {
  id: number;
  name: string;
}

const artistSongsCache = new Map<
  string,
  { data: videoResult[]; timestamp: number }
>();
const CACHE_TTL = 30 * 60 * 1000;

export default function Search() {
  const [searchSong, setSearchSong] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSongs, setIsLoadingSongs] = useState(false);
  const [resultList, setresultList] = useState<videoResult[]>([]);
  const [resultArtistList, setresultArtistList] = useState<Artist[]>([]);
  const { queueAndPlay, PlayerHeight } = useAudio();
  const { currentSongData } = useAudioState();
  const [precise, setPrecise] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);

  useEffect(() => {
    setresultList([]);
    setresultArtistList([]);
  }, [precise]);

  async function fetchMusic() {
    setIsLoading(true);
    try {
      if (precise) {
        const request = await axiosInstance.get(
          `/api/audio/search/precise/artists?artist=${encodeURIComponent(searchSong)}`,
        );
        console.log(request.data);
        setresultArtistList(request.data);
        return;
      } else {
        const request = await axiosInstance.get(
          `/api/audio/search?searchSong=${encodeURIComponent(searchSong)}`,
        );
        setresultList(request.data);
        console.log(request.data);
        return;
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleModalSongsByArtist(artist: Artist) {
    setIsModalVisible(true);
    setSelectedArtist(artist);
    fetchSongsByArtist(artist);
  }

  async function fetchSongsByArtist(artist: Artist) {
    const cacheKey = artist.id.toString();
    const cached = artistSongsCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      setresultList(cached.data);
      return;
    }

    setIsLoadingSongs(true);
    try {
      const request = await axiosInstance.get(
        `/api/audio/search/precise/songsByArtist`,
        {
          params: {
            artistId: artist.id,
            artistName: artist.name,
          },
        },
      );

      console.log("Resultados para el artista:", request.data.length);
      artistSongsCache.set(cacheKey, {
        data: request.data,
        timestamp: Date.now(),
      });
      console.log(artistSongsCache);
      setresultList(request.data);
      return;
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoadingSongs(false);
    }
  }

  return (
    <View
      style={{
        display: "flex",
        alignItems: "center",
        flex: 1,
        marginBottom: currentSongData ? PlayerHeight : 0,
      }}
    >
      <Stack.Screen options={{ title: "Buscar" }} />
      <TextInput
        placeholder="Busca una cancion.."
        value={searchSong}
        onChangeText={setSearchSong}
        placeholderTextColor="rgba(255, 255, 255, 0.3)"
        onSubmitEditing={fetchMusic}
        returnKeyType="search"
        style={{
          borderWidth: 1,
          borderColor: "gray",
          padding: 10,
          marginTop: 15,
          marginBottom: 10,
          borderRadius: 5,
          width: "99%",
          color: "white",
        }}
      />
      <Pressable
        onPress={() => setPrecise((prev) => !prev)}
        style={[styles.toggleButton, precise && styles.toggleButtonActive]}
      >
        <Text
          selectable={false}
          style={[styles.toggleText, precise && styles.toggleTextActive]}
        >
          {precise ? "Busqueda precisa ✓" : "Busqueda precisa por artista"}
        </Text>
      </Pressable>

      <View style={{ flex: 1, width: "100%" }}>
        {isLoading ? (
          <ActivityIndicator
            style={{ marginTop: 120 }}
            size="large"
            color="#FFD700"
          />
        ) : precise ? (
          <FlatList
            data={resultArtistList}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{
              paddingHorizontal: 5,
            }}
            renderItem={({ item: artist }) => (
              <TouchableOpacity
                onPress={() => {
                  handleModalSongsByArtist(artist);
                }}
                style={{
                  flexDirection: "row",
                  marginVertical: 5,
                  alignItems: "center",
                  paddingVertical: 13,
                  paddingHorizontal: 7,
                  backgroundColor: "#111",
                  borderRadius: 5,
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={{ color: "white" }}>{artist.name}</Text>
                </View>
              </TouchableOpacity>
            )}
            initialNumToRender={8}
            windowSize={5}
            maxToRenderPerBatch={8}
            removeClippedSubviews
          />
        ) : (
          <FlatList
            data={resultList}
            keyExtractor={(item, index) =>
              (precise ? item.recordingId : item.videoId) ?? index.toString()
            }
            contentContainerStyle={{
              paddingHorizontal: 5,
            }}
            renderItem={({ item: music, index }) => (
              <TouchableOpacity
                onPress={() => queueAndPlay(resultList, index)}
                style={{
                  flexDirection: "row",
                  marginVertical: 5,
                  alignItems: "center",
                  paddingVertical: precise ? 13 : 10,
                  paddingHorizontal: 7,
                  backgroundColor: "#111",
                  borderRadius: 5,
                }}
              >
                {currentSongData?.title === music.title && (
                  <View
                    pointerEvents="none"
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      borderBottomWidth: 2,
                      borderColor: "#FFD700",
                      borderRadius: 2,
                    }}
                  />
                )}
                <Image
                  source={{ uri: music.urlThumbnail }}
                  style={{
                    width: 70,
                    height: 60,
                    borderRadius: 5,
                    marginRight: 10,
                  }}
                />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: "white" }}>{music.title}</Text>
                </View>
              </TouchableOpacity>
            )}
            initialNumToRender={8}
            windowSize={5}
            maxToRenderPerBatch={8}
            removeClippedSubviews
          />
        )}
      </View>

      {isModalVisible && (
        <ModalPreciseSearchSongs
          isLoading={isLoadingSongs}
          artist={selectedArtist}
          resultList={resultList}
          precise={precise}
          queueAndPlay={queueAndPlay}
          currentSongData={currentSongData}
          setIsModalVisible={setIsModalVisible}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  toggleButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#666",
    backgroundColor: "#111",
    alignSelf: "center",
  },
  toggleButtonActive: {
    backgroundColor: "#FFD700",
    borderColor: "#FFD700",
  },
  toggleText: {
    color: "#aaa",
    fontSize: 13,
    fontWeight: "700",
  },
  toggleTextActive: {
    color: "#000",
    fontWeight: "700",
  },
});
