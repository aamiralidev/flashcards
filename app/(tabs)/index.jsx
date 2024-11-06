import { StyleSheet, TouchableWithoutFeedback, View, Text, FlatList, ScrollView } from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import Header from '@/components/Header'
import DeckCard from '@/components/DeckCard'
import { SafeAreaView } from 'react-native-safe-area-context';
import {getDecksWithMasteredCount} from '@/db/exposqlite'


const flashcards = [
  { id: '1', title: 'What is React?', answer: 'A JavaScript library for building UIs', totalWords: 51, masteredWords: 25 },
  { id: '2', title: 'What is React Native?', answer: 'A framework for building native apps with React', totalWords: 51, masteredWords: 15  },
  { id: '3', title: 'What is a component?', answer: 'A reusable piece of UI', totalWords: 51, masteredWords: 45  },
  { id: '4', title: 'What is a component?', answer: 'A reusable piece of UI', totalWords: 51, masteredWords: 45  },
  { id: '5', title: 'What is a component?', answer: 'A reusable piece of UI', totalWords: 51, masteredWords: 45  },
  { id: '6', title: 'What is a component?', answer: 'A reusable piece of UI', totalWords: 51, masteredWords: 45  },
  { id: '7', title: 'What is a component?', answer: 'A reusable piece of UI', totalWords: 51, masteredWords: 45  },
  // Add more flashcards here
];

const renderItem = ({ item }) => (
  <DeckCard
    title={item.title}
    totalWords={item.totalWords}
    masteredWords={item.masteredWords}
  />
);

export default function HomeScreen() {
  return (
    <View style={styles.view}>
      <SafeAreaView>
        <Header />
        <View style={{flex : 1, flexGrow :1}}>
        <FlatList style={{height: '100vh'}} keyExtractor={item => item.id} data={flashcards} renderItem={renderItem} />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  view: {
    backgroundColor: '#800080',
    flex: 1
  },
});
