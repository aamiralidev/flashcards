import Ionicons from "@expo/vector-icons/Ionicons";
import { StyleSheet, TouchableOpacity, Animated } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { View, Text, ActivityIndicator } from "react-native";
import LearnHeader from "@/components/LearnHeader";
import { getWordsForDeck } from "@/db/watermelon";
import { useEffect, useState, useRef } from "react";
import { router } from "expo-router";
import { useToast } from "react-native-toast-notifications";

import { SafeAreaView } from "react-native-safe-area-context";
export default function Learn() {
    const toast = useToast();
    const deck = useLocalSearchParams();
    const [words, setWords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFlipped, setIsFlipped] = useState(false);
    const flipAnim = useRef(new Animated.Value(0)).current;

    const frontRotation = flipAnim.interpolate({
        inputRange: [0, 180],
        outputRange: ["0deg", "180deg"],
    });

    const backRotation = flipAnim.interpolate({
        inputRange: [0, 180],
        outputRange: ["180deg", "360deg"],
    });

    // Toggle flip
    const flipCard = () => {
        if (isFlipped) {
            Animated.spring(flipAnim, {
                toValue: 0,
                useNativeDriver: true,
            }).start();
        } else {
            Animated.spring(flipAnim, {
                toValue: 180,
                useNativeDriver: true,
            }).start();
        }
        setIsFlipped(!isFlipped);
    };

    useEffect(() => {
        const fetchWords = async () => {
            try {
                const data = await getWordsForDeck(deck.deckId);
                console.log(data);
                if (data.length <= 0) {
                    toast.show("No words in this deck", {
                        type: "error,",
                        duration: 4000,
                        offset: 30,
                        animationType: "slide-in",
                    });
                    router.back();
                }
                setWords(data);
                setLoading(false);
            } catch (error) {
                toast.show("Error loading deck", {
                    type: "error",
                    duration: 4000,
                    offset: 30,
                    animationType: "slide-in",
                });
                router.back();
            }
        };

        fetchWords();
    }, []);
    console.log(loading);
    return (
        <View style={styles.view}>
            <SafeAreaView>
                <LearnHeader title={deck?.name || "Loading..."} />

                <View style={{ flex: 1, flexGrow: 1 }}>
                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="white" />
                        </View>
                    ) : (
                        <View style={styles.cardWrapper}>
                            {/* Front Side */}
                            <Animated.View
                                style={[
                                    styles.cardContainer,
                                    styles.cardFront,
                                    { transform: [{ rotateY: frontRotation }] },
                                ]}
                            >
                                {/* Status Badge */}
                                <View style={styles.statusBadge}>
                                    <Text style={styles.statusText}>
                                        Mastered
                                    </Text>
                                </View>
                                <View style={styles.contentContainer}>
                                    <Text style={styles.cardText}>Word</Text>
                                </View>
                                <TouchableOpacity
                                    style={styles.bottomButton}
                                    onPress={flipCard}
                                >
                                    <Text style={styles.buttonText}>
                                        Tap to see meaning
                                    </Text>
                                </TouchableOpacity>
                            </Animated.View>

                            {/* Back Side */}
                            <Animated.View
                                style={[
                                    styles.cardContainer,
                                    styles.cardBack,
                                    { transform: [{ rotateY: backRotation }] },
                                ]}
                            >
                                <View style={styles.contentContainer}>
                                    <Text style={styles.cardText}>Meaning</Text>
                                </View>
                                <TouchableOpacity
                                    style={styles.bottomButton}
                                    onPress={flipCard}
                                >
                                    <Text style={styles.buttonText}>
                                        Tap to see word
                                    </Text>
                                </TouchableOpacity>
                            </Animated.View>
                        </View>
                    )}
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    view: {
        backgroundColor: "#800080",
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 40,
    },
    cardWrapper: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 10,
    },
    cardContainer: {
        backgroundColor: "#ffffff",
        padding: 20,
        borderRadius: 15,
        width: "90%",
        height: 200, // Adjust height as needed
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 10,
        position: "relative",
        backfaceVisibility: "hidden",
    },
    cardFront: {
        backgroundColor: "#ffffff",
    },
    statusBadge: {
        position: "absolute",
        top: 10,
        right: 10,
        backgroundColor: "#ff6347", // Customize color based on status
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 5,
    },
    statusText: {
        color: "#fff",
        fontSize: 11,
        fontWeight: "bold",
    },
    contentContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    cardText: {
        fontSize: 20,
        color: "#333",
        textAlign: "center",
    },
    bottomButton: {
        backgroundColor: "#800080", // Button background color
        paddingVertical: 10,
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
    },
});
