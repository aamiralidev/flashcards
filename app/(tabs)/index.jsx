import { StyleSheet, TouchableOpacity, View, FlatList } from "react-native";
import { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useToast } from "react-native-toast-notifications";

import DeckCard from "@/components/DeckCard";
import Header from "@/components/Header";
import { getDecksWithMasteredAndTotalCount } from "@/db/watermelon";

export default function HomeScreen() {
    const [flashcards, setFlashcards] = useState([]);
    const toast = useToast();

    const renderItem = ({ item }) => (
        <TouchableOpacity
            onPress={() => {
                if (item.totalWords <= 0) {
                    toast.show("This deck has no words", {
                        duration: 4000,
                        offset: 30,
                        animationType: "slide-in",
                    });
                    return;
                }
                router.setParams({ ...item });
                router.navigate({ pathname: `learn`, params: item });
            }}
        >
            <DeckCard
                title={item.title}
                totalWords={item.totalWords}
                masteredWords={item.masteredWords}
            />
        </TouchableOpacity>
    );

    useEffect(() => {
        // Define an async function to fetch data and set state
        const fetchFlashcards = async () => {
            try {
                const data = await getDecksWithMasteredAndTotalCount();
                console.log(data);
                setFlashcards(data); // Update state with fetched data
            } catch (error) {
                toast.show("Error Loading Decks", {
                    duration: 4000,
                    offset: 30,
                    animationType: "slide-in",
                });
            }
        };

        fetchFlashcards(); // Call the async function
    }, []);
    return (
        <View style={styles.view}>
            <SafeAreaView>
                <Header />
                <View style={{ flex: 1, flexGrow: 1 }}>
                    <FlatList
                        style={{ height: "100vh" }}
                        keyExtractor={(item) => item.deckId}
                        data={flashcards}
                        renderItem={renderItem}
                    />
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
});
