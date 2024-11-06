import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function Header() {
  return (
    <View style={styles.header}>
      {/* Hamburger Icon */}
      <TouchableOpacity>
        <MaterialIcons name="menu" size={28} color='#fff'/>
      </TouchableOpacity>
      
      {/* App Name in the Center */}
      <Text style={styles.headerText}>Flashcards</Text>
      
      {/* Placeholder for Center Alignment - Add Empty View */}
      <View style={styles.placeholder} />
    </View>
  );
}

const styles = StyleSheet.create({
    text: {
      fontSize: 18,
    },
    header: {
      height: 60,              // Height of the header
      flexDirection: 'row',     // Row layout for icon and text
      alignItems: 'center',     // Center items vertically
      justifyContent: 'space-between',
      paddingHorizontal: 15,    // Padding for left and right sides
    },
    headerText: {
      flex: 1,                  // Take up remaining space for centering
      color: 'white',
      fontSize: 20,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    placeholder: {
      width: 28,                // Placeholder to align title centrally
    },
  });
  