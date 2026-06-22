import FullScreenPanelHome from "@/components/FullScreenPanelHome";
import { useAudio } from "@/contexts/PlayerContext";
import { MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import axiosInstance from "../utils/axiosInstance";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface Song {
  id: number;
  title: string;
  videoId: string;
  urlThumbnail: string;
  duration: number;
}

// ── Skeleton ────────────────────────────────────────────────────────────────
function Skeleton({
  width,
  height,
  borderRadius = 8,
}: {
  width: number | string;
  height: number;
  borderRadius?: number;
}) {
  const anim = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0.4,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);
  return (
    <View
      style={{ width: width as any, height, borderRadius, overflow: "hidden" }}
    >
      <Animated.View
        style={{ flex: 1, backgroundColor: "#1e1e1e", opacity: anim }}
      />
    </View>
  );
}

// ── TrackRow ─────────────────────────────────────────────────────────────────
function TrackRow({
  track,
  index,
  onPress,
  onLongPress,
}: {
  track: any;
  index: number;
  onPress: () => void;
  onLongPress?: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
      style={styles.trackRow}
    >
      <Text style={styles.trackIndex}>{index + 1}</Text>
      {track.thumbnail ? (
        <Image source={{ uri: track.thumbnail }} style={styles.trackThumb} />
      ) : (
        <View style={[styles.trackThumb, styles.trackThumbFallback]}>
          <MaterialIcons name="music-note" size={18} color="#555" />
        </View>
      )}
      <View style={styles.trackInfo}>
        <Text style={styles.trackTitle} numberOfLines={1}>
          {track.title}
        </Text>
        <Text style={styles.trackArtist} numberOfLines={1}>
          {track.artist}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

// ── ArtistCard ────────────────────────────────────────────────────────────────
function ArtistCard({ artist, onPress }: { artist: any; onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={styles.artistCard}
    >
      {artist.thumbnail ? (
        <Image source={{ uri: artist.thumbnail }} style={styles.artistImage} />
      ) : (
        <View style={[styles.artistImage, styles.artistImageFallback]}>
          <MaterialIcons name="person" size={32} color="#555" />
        </View>
      )}
      <View style={styles.artistGradient} />
      <Text style={styles.artistName} numberOfLines={1}>
        {artist.name}
      </Text>
      <Text style={styles.artistLabel}>Artista</Text>
    </TouchableOpacity>
  );
}

// ── StatCard ──────────────────────────────────────────────────────────────────
function StatCard({
  value,
  label,
  delay,
}: {
  value: any;
  label: string;
  delay: number;
}) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 500,
      delay,
      useNativeDriver: true,
    }).start();
  }, []);
  return (
    <Animated.View
      style={[
        styles.statCard,
        {
          opacity: anim,
          transform: [
            {
              translateY: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [12, 0],
              }),
            },
          ],
        },
      ]}
    >
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Animated.View>
  );
}

// ── SectionHeader ─────────────────────────────────────────────────────────────
function SectionHeader({
  title,
  action,
}: {
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionHeaderLeft}>
        <View style={styles.sectionAccent} />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {action}
    </View>
  );
}

// ── HomeScreen ────────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const username = "L0rkz2";
  const { queueAndPlay, PlayerHeight } = useAudio();
  const [topTracks, setTopTracks] = useState<any[]>([]);
  const [topArtists, setTopArtists] = useState<any[]>([]);
  const [loadingTracks, setLoadingTracks] = useState(true);
  const [loadingArtists, setLoadingArtists] = useState(true);

  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [showSongOptions, setShowSongOptions] = useState(false);

  const [showAllTracks, setShowAllTracks] = useState(false);

  // loadSongsByArtist selected
  const [selectedArtist, setSelectedArtist] = useState<any>(null);
  const [artistSongs, setArtistSongs] = useState<any[]>([]);
  const [loadingArtistSongs, setLoadingArtistSongs] = useState(false);

  const artistScrollRef = useRef<ScrollView>(null);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Buenos días" : hour < 18 ? "Buenas tardes" : "Buenas noches";

  const heroAnim = useRef(new Animated.Value(0)).current;

  // Load songs by selected artist
  const handleArtistClick = async (artist: any) => {
    setSelectedArtist(artist);
    setLoadingArtistSongs(true);
    setArtistSongs([]);
    const res = await axiosInstance.get(
      `/api/audio/search/precise/songsByArtist?artistName=${artist.name}`,
    );
    setArtistSongs(res.data);
    setLoadingArtistSongs(false);
  };

  // fetchHomeData
  useEffect(() => {
    Animated.timing(heroAnim, {
      toValue: 1,
      duration: 700,
      useNativeDriver: true,
    }).start();

    const fetchData = async () => {
      setLoadingArtists(true);
      setLoadingTracks(true);

      const [tracksRes, artistsRes] = await Promise.all([
        axiosInstance.get("/api/charts/tracks"),
        axiosInstance.get("/api/charts/artists"),
      ]);

      setTopTracks(tracksRes.data);
      setLoadingTracks(false);
      setTopArtists(artistsRes.data);
      setLoadingArtists(false);
    };

    fetchData();
  }, []);

  const heroStyle = {
    opacity: heroAnim,
    transform: [
      {
        translateY: heroAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [16, 0],
        }),
      },
    ],
  };

  return (
    <View style={{ marginBottom: PlayerHeight, flex: 1 }}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero ──────────────────────────────────────────────────────────── */}
        <Animated.View style={[styles.hero, heroStyle]}>
          <Text style={styles.greeting}>{greeting}</Text>
          <Text style={styles.welcomeText}>Bienvenido, {username}</Text>
          <Text style={styles.subtitle}>Esto suena bien hoy</Text>
        </Animated.View>

        {/* ── Stats ─────────────────────────────────────────────────────────── */}
        <View style={styles.statsRow}>
          <StatCard value={topTracks.length} label="Top canciones" delay={0} />
          <StatCard value={topArtists.length} label="Top artistas" delay={80} />
          <StatCard value="🇲🇽" label="Tendencias" delay={160} />
        </View>

        {/* ── Top Artistas ──────────────────────────────────────────────────── */}
        <View style={styles.section}>
          <SectionHeader
            title="Top Artistas"
            action={
              <View style={styles.scrollButtons}>
                <TouchableOpacity
                  onPress={() =>
                    artistScrollRef.current?.scrollTo({ x: 0, animated: true })
                  }
                  style={styles.scrollBtn}
                >
                  <MaterialIcons name="chevron-left" size={18} color="#aaa" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() =>
                    artistScrollRef.current?.scrollToEnd({ animated: true })
                  }
                  style={styles.scrollBtn}
                >
                  <MaterialIcons name="chevron-right" size={18} color="#aaa" />
                </TouchableOpacity>
              </View>
            }
          />
          <ScrollView
            ref={artistScrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 12, paddingBottom: 8 }}
          >
            {loadingArtists
              ? Array.from({ length: 6 }).map((_, i) => (
                  <View key={i} style={{ gap: 6 }}>
                    <Skeleton width={130} height={130} borderRadius={12} />
                    <Skeleton width={100} height={12} />
                  </View>
                ))
              : topArtists.map((artist) => (
                  <ArtistCard
                    key={artist.id}
                    artist={artist}
                    onPress={() => handleArtistClick(artist)}
                  />
                ))}
          </ScrollView>
        </View>

        {/* ── Top Songs ─────────────────────────────────────────────────────── */}
        <View style={styles.section}>
          <SectionHeader
            title="Top Songs"
            action={
              <TouchableOpacity
                style={styles.verMasBtn}
                onPress={() => setShowAllTracks(true)}
              >
                <Text style={styles.verMasText}>Ver más</Text>
                <MaterialIcons name="chevron-right" size={16} color="#888" />
              </TouchableOpacity>
            }
          />
          {loadingTracks
            ? Array.from({ length: 10 }).map((_, i) => (
                <View key={i}>
                  <Skeleton width="100%" height={58} borderRadius={8} />
                </View>
              ))
            : topTracks.slice(0, 10).map((track, i) => (
                <TrackRow
                  key={track.id}
                  track={track}
                  index={i}
                  onPress={() => {
                    queueAndPlay(topTracks, i);
                  }}
                  onLongPress={() => {}}
                />
              ))}
        </View>
      </ScrollView>

      {/* Top Songs Modal*/}
      <FullScreenPanelHome
        visible={showAllTracks}
        title="Top Songs"
        onClose={() => setShowAllTracks(false)}
      >
        <FlatList
          data={topTracks}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item, index }) => (
            <TrackRow
              track={item}
              index={index}
              onPress={() => {
                queueAndPlay(topTracks, index);
              }}
              onLongPress={() => {
                setSelectedSong(item);
                setShowSongOptions(true);
              }}
            />
          )}
        />
      </FullScreenPanelHome>

      {/* Artist Songs Modal*/}
      <FullScreenPanelHome
        visible={!!selectedArtist}
        title={selectedArtist?.name ?? ""}
        onClose={() => {
          setSelectedArtist(null);
          setArtistSongs([]);
        }}
      >
        {loadingArtistSongs ? (
          <View style={{ padding: 16, gap: 8 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} width="100%" height={58} borderRadius={8} />
            ))}
          </View>
        ) : (
          <FlatList
            data={artistSongs}
            keyExtractor={(item) => item.videoId ?? item.id}
            renderItem={({ item, index }) => (
              <TrackRow
                track={item}
                index={index}
                onPress={() => {
                  queueAndPlay(artistSongs, index);
                }}
              />
            )}
          />
        )}
      </FullScreenPanelHome>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a0a",
  },
  content: {
    paddingHorizontal: 12,
  },

  // Hero
  hero: {
    paddingTop: 8,
    paddingBottom: 28,
  },
  greeting: {
    fontSize: 11,
    color: "#555",
    letterSpacing: 3,
    textTransform: "uppercase",
    marginBottom: 6,
    fontWeight: "500",
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: "700",
    letterSpacing: -1,
    lineHeight: 36,
    color: "#fde047",
  },
  subtitle: {
    color: "#555",
    marginTop: 6,
    fontSize: 13,
  },

  // Stats
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#111",
    borderWidth: 1,
    borderColor: "#1e1e1e",
    borderRadius: 12,
    padding: 14,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fde047",
  },
  statLabel: {
    fontSize: 11,
    color: "#555",
    marginTop: 2,
  },

  // Section
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  sectionHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  sectionAccent: {
    width: 3,
    height: 18,
    borderRadius: 2,
    backgroundColor: "#fde047",
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 2,
    textTransform: "uppercase",
    color: "#aaa",
  },
  scrollButtons: {
    flexDirection: "row",
    gap: 6,
  },
  scrollBtn: {
    backgroundColor: "#111",
    borderWidth: 1,
    borderColor: "#1e1e1e",
    borderRadius: 8,
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  verMasBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderColor: "#1e1e1e",
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  verMasText: {
    fontSize: 12,
    color: "#888",
  },

  // Artist card
  artistCard: {
    width: 130,
  },
  artistImage: {
    width: 130,
    height: 130,
    borderRadius: 12,
    marginBottom: 8,
  },
  artistImageFallback: {
    backgroundColor: "#111",
    borderWidth: 1,
    borderColor: "#1e1e1e",
    alignItems: "center",
    justifyContent: "center",
  },
  artistGradient: {
    position: "absolute",
    bottom: 28,
    left: 0,
    right: 0,
    height: 40,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  artistName: {
    fontSize: 13,
    fontWeight: "500",
    color: "#e0e0e0",
  },
  artistLabel: {
    fontSize: 11,
    color: "#555",
    marginTop: 2,
  },

  // Track row
  trackRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 3,
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: "#111",
    borderRadius: 8,
    gap: 10,
  },
  trackIndex: {
    fontSize: 12,
    color: "#444",
    width: 18,
    textAlign: "center",
  },
  trackThumb: {
    width: 40,
    height: 40,
    borderRadius: 6,
  },
  trackThumbFallback: {
    backgroundColor: "#1a1a1a",
    alignItems: "center",
    justifyContent: "center",
  },
  trackInfo: {
    flex: 1,
    gap: 3,
  },
  trackTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#e0e0e0",
  },
  trackArtist: {
    fontSize: 12,
    color: "#555",
  },
});
