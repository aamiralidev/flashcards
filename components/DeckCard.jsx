// Deck.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ProgressBar from 'react-native-progress/Bar';

const DeckCard = ({ title, totalWords, masteredWords }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>

      {/* Progress Text: X of Y words mastered */}
      <Text style={styles.progressText}>
        {masteredWords} of {totalWords} words mastered
      </Text>

      {/* Progress Bar: Green/Gray */}
      <ProgressBar
      key={masteredWords}
        progress={masteredWords / totalWords || 0} 
        width={null}
        height={15}
        borderWidth={0}
        unfilledColor="#d3d3d3"
        color="green"
        borderRadius={5}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  progressText: {
    fontSize: 14,
    color: 'gray',
    marginBottom: 10,
  },
});

export default DeckCard;
