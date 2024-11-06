import { appSchema, tableSchema } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import Database from '@nozbe/watermelondb/Database';
import { Model } from '@nozbe/watermelondb';
import { field } from '@nozbe/watermelondb/decorators';
// const SQLiteAdapter = require('@nozbe/watermelondb/adapters/lokijs').default

// Define schema
const deckSchema = tableSchema({
  name: 'decks',
  columns: [
    { name: 'deckId', type: 'string', isPrimaryKey: true },
    { name: 'name', type: 'string' },
  ],
});

const wordSchema = tableSchema({
  name: 'words',
  columns: [
    {name: 'deckId', type: 'string', isIndexed: true },
    { name: 'word', type: 'string' , isIndexed: true },
    { name: 'meaning', type: 'string' },
    { name: 'status', type: 'string', isIndexed: true  },
  ],
});

// Create a model
class Deck extends Model {
  static table = 'decks';
  @field('deckId') deckId;
  @field('name') name;
}

class Word extends Model {
  static table = 'words';
  
  @field('deckId') deckId;
  @field('word') word;
  @field('meaning') meaning;
  @field('status') status;
}

// Set up WatermelonDB adapter and database
const adapter = new SQLiteAdapter({
//   jsi: true,
  dbName: 'flashcards',
  schema: appSchema({
    version: 1,
    tables: [deckSchema, wordSchema],
  }),
});

export const database = new Database({ adapter, modelClasses: [Deck, Word] });

async function seedDatabase() {
    const decksCollection = database.collections.get('decks');
    const wordsCollection = database.collections.get('words');
  
    // Check if any decks exist, if not, seed data
    const existingDecks = await decksCollection.query().fetchCount();
    if (existingDecks === 0) {
      // Insert decks
    //   const initialData = require('../assets/initialData.json');
      const initialData = {
        "decks": [
          { "id": "1", "name": "Basic 1" },
          { "id": "2", "name": "Basic 2" },
          { "id": "3", "name": "Intermediate 1" },
          { "id": "4", "name": "Intermediate 2" },
          { "id": "5", "name": "Advanced 1" }
        ],
        "words": [
          { "deckId": "1", "word": "apple", "meaning": "A fruit", "status": "unseen" },
          { "deckId": "1", "word": "banana", "meaning": "A yellow fruit", "status": "unseen" },
          { "deckId": "2", "word": "cherry", "meaning": "A small red fruit", "status": "unseen" },
          { "deckId": "2", "word": "date", "meaning": "A sweet fruit", "status": "unseen" },
          { "deckId": "3", "word": "elephant", "meaning": "A large animal", "status": "unseen" },
          { "deckId": "3", "word": "fox", "meaning": "A small wild animal", "status": "unseen" },
          { "deckId": "4", "word": "grape", "meaning": "A small round fruit", "status": "unseen" },
          { "deckId": "4", "word": "hippopotamus", "meaning": "A large mammal", "status": "unseen" },
          { "deckId": "5", "word": "igloo", "meaning": "A house made of ice", "status": "unseen" },
          { "deckId": "5", "word": "jaguar", "meaning": "A large wild cat", "status": "unseen" }
        ]
      }
      
      const createdDecks = await database.action(async () => {
        return Promise.all(
          initialData.decks.map(deckData => {
            return decksCollection.create(deck => {
              deck.deckId = deckData.deckId;
              deck.name = deckData.name;
            });
          })
        );
      });
  
      // Insert words into the corresponding decks
      await database.action(async () => {
        initialData.words.forEach(wordData => {
          const deck = createdDecks.find(deck => deck.deckId === wordData.deckId);
          if (deck) {
            wordsCollection.create(word => {
              word.word = wordData.word;
              word.meaning = wordData.meaning;
              word.status = wordData.status;
              word.deckId = deck.deckId;
            });
          }
        });
      });
    } else {
      console.log("Decks already exist in the database. No need to load initial data.");
    }
}

seedDatabase()

export async function getDecksWithMasteredCount() {
    const decksCollection = database.collections.get('decks');
    const wordsCollection = database.collections.get('words');
  
    // Step 1: Get all words with 'mastered' status and group by deckId
    const masteredWords = await wordsCollection
      .query(Q.where('status', 'mastered'))
      .fetch();
  
    // Create a dictionary for mastered counts by deckId
    const masteredCountByDeckId = {};
    masteredWords.forEach(word => {
      masteredCountByDeckId[word.deckId] = (masteredCountByDeckId[word.deckId] || 0) + 1;
    });
  
    // Step 2: Fetch all decks
    const allDecks = await decksCollection.query().fetch();
  
    // Step 3: Combine deck details with mastered count
    return allDecks.map(deck => ({
      deckId: deck.deckId,
      name: deck.name,
      masteredCount: masteredCountByDeckId[deck.deckId] || 0,  // Default to 0 if no mastered words
    }));
  }

export async function getWordsForDeck(deckId) {
    const wordsCollection = database.collections.get('words');
  
    // Get all words in a particular deck
    const words = await wordsCollection.query(Q.where('deckId', deckId)).fetch();
  
    return words.map(word => ({
      word: word.word,
      meaning: word.meaning,
      status: word.status,
    }));
  }


export async function updateWordStatus(deckId, word, newStatus) {
    const wordsCollection = database.collections.get('words');
  
    // Find the word in the specific deck
    const wordToUpdate = await wordsCollection
      .query(Q.where('deckId', deckId), Q.where('word', word))
      .fetchOne();
  
    if (wordToUpdate) {
      // Update the word's status
      await database.action(async () => {
        await wordToUpdate.update(word => {
          word.status = newStatus;
        });
      });
    } else {
      console.log(`Word "${word}" not found in deck "${deckId}"`);
    }
  }
  




  