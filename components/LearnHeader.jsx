import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";

export default function LearnHeader({ title }) {
    return (
        <View style={styles.header}>
            <TouchableOpacity style={styles.button} onPress={router.back}>
                <MaterialIcons
                    name="arrow-back"
                    size={20}
                    color="#fff"
                    style={{ paddingTop: 4, paddingRight: 4 }}
                />
                <Text style={styles.headerText}>Back</Text>
            </TouchableOpacity>

            <Text style={styles.headerText}>{title}</Text>

            <View style={styles.placeholder} />
        </View>
    );
}

const styles = StyleSheet.create({
    button: {
        flexDirection: "row",
    },
    header: {
        height: 60, // Height of the header
        flexDirection: "row", // Row layout for icon and text
        alignItems: "center", // Center items vertically
        justifyContent: "space-between",
        paddingHorizontal: 15, // Padding for left and right sides
        width: "100%",
    },
    headerText: {
        flex: 1, // Take up remaining space for centering
        color: "white",
        fontSize: 20,
        fontWeight: "bold",
        textAlign: "center",
    },
    placeholder: {
        width: 28,
    },
    text: {
        paddingLeft: 10,
    },
});
