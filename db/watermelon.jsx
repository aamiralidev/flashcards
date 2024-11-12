import { Platform } from "react-native";
import { appSchema, tableSchema } from "@nozbe/watermelondb";
// import SQLiteAdapter from "@nozbe/watermelondb/adapters/sqlite";
import Database from "@nozbe/watermelondb/Database";
import { Model } from "@nozbe/watermelondb";
import { field } from "@nozbe/watermelondb/decorators";
// import LokiJSAdapter from "@nozbe/watermelondb/adapters/lokijs";
import { Q } from "@nozbe/watermelondb"; // Ensure Q is imported

const Adapter =
    Platform.OS === "web"
        ? require("@nozbe/watermelondb/adapters/lokijs").default
        : require("@nozbe/watermelondb/adapters/sqlite").default;
// Define schema
export const deckSchema = tableSchema({
    name: "decks",
    columns: [
        { name: "deckId", type: "string" },
        { name: "name", type: "string" },
    ],
});

export const wordSchema = tableSchema({
    name: "words",
    columns: [
        { name: "deckId", type: "string", isIndexed: true },
        { name: "word", type: "string", isIndexed: true },
        { name: "meaning", type: "string" },
        { name: "status", type: "string", isIndexed: true },
    ],
});

const schema = appSchema({
    version: 8,
    tables: [deckSchema, wordSchema],
});

// Create a model
export class Deck extends Model {
    static table = "decks";
    @field("deckId") deckId;
    @field("name") name;
}

export class Word extends Model {
    static table = "words";
    @field("deckId") deckId;
    @field("word") word;
    @field("meaning") meaning;
    @field("status") status;
}
const adapter =
    Platform.OS === "web"
        ? new Adapter({
              schema,
              useWebWorker: false, // Optional, depending on your preference
              useIncrementalIndexedDB: true, // Speeds up LokiJS for web
              dbName: "flashcards-web", // Unique name for LokiJS IndexedDB
          })
        : new Adapter({
              schema,
              dbName: "flashcards-mobile", // Unique name for SQLite
              jsi: true, // Enable JSI for better performance on mobile
          });

export const database = new Database({
    adapter,
    modelClasses: [Deck, Word],
});

async function seedDatabase() {
    const decksCollection = database.collections.get("decks");
    const wordsCollection = database.collections.get("words");

    try {
        // Check if any decks exist, if not, seed data
        // await database.adapter.unsafeResetDatabase();
        const existingDecks = await decksCollection.query().fetchCount();
        console.log(`Found ${existingDecks}`);
        if (existingDecks === 0) {
            // Initial data
            const initialData = require("../assets/initialData.json");

            // Insert decks
            const createdDecks = await database.write(async () => {
                return Promise.all(
                    initialData.decks.map((deckData) => {
                        return decksCollection.create((deck) => {
                            deck.deckId = deckData.deckId;
                            deck.name = deckData.name;
                        });
                    })
                );
            });

            // Create a map for faster deck lookup
            const deckMap = createdDecks.reduce((acc, deck) => {
                acc[deck.deckId] = deck;
                return acc;
            }, {});

            // Insert words into the corresponding decks
            await database.write(async () => {
                await Promise.all(
                    initialData.words.map((wordData) => {
                        const deck = deckMap[wordData.deckId];
                        if (deck) {
                            return wordsCollection.create((word) => {
                                word.word = wordData.word;
                                word.meaning = wordData.meaning;
                                word.status = wordData.status;
                                word.deckId = deck.deckId;
                            });
                        }
                    })
                );
            });
        } else {
            console.log(
                "Decks already exist in the database. No need to load initial data."
            );
        }
    } catch (error) {
        console.error("Error seeding database:", error);
    }
}

seedDatabase();

export async function getDecksWithMasteredAndTotalCount() {
    try {
        const decksCollection = database.collections.get("decks");
        const wordsCollection = database.collections.get("words");

        // Step 1: Get all words with 'mastered' status and group by deckId
        const masteredWords = await wordsCollection
            .query(Q.where("status", "mastered"))
            .fetch();

        // Create a dictionary for mastered counts by deckId
        const masteredCountByDeckId = {};
        masteredWords.forEach((word) => {
            masteredCountByDeckId[word.deckId] =
                (masteredCountByDeckId[word.deckId] || 0) + 1;
        });

        // Step 2: Get all words and group by deckId for total counts
        const allWords = await wordsCollection.query().fetch();

        const totalCountByDeckId = {};
        allWords.forEach((word) => {
            totalCountByDeckId[word.deckId] =
                (totalCountByDeckId[word.deckId] || 0) + 1;
        });

        // Step 3: Fetch all decks
        const allDecks = await decksCollection.query().fetch();

        // Step 4: Combine deck details with mastered and total counts
        return allDecks.map((deck) => ({
            deckId: deck.deckId,
            name: deck.name,
            masteredWords: masteredCountByDeckId[deck.deckId] || 0, // Default to 0 if no mastered words
            totalWords: totalCountByDeckId[deck.deckId] || 0, // Default to 0 if no words
        }));
    } catch (error) {
        console.error(
            "Error fetching decks with mastered and total counts:",
            error
        );
        return []; // Return an empty array if an error occurs
    }
}

export async function getWordsForDeck(deckId) {
    const wordsCollection = database.collections.get("words");

    // Get all words in a particular deck
    const words = await wordsCollection
        .query(Q.where("deckId", deckId))
        .fetch();

    return words.map((word) => ({
        word: word.word,
        meaning: word.meaning,
        status: word.status,
    }));
}

// export async function updateWordStatus(deckId, word, newStatus) {
//     const wordsCollection = database.collections.get("words");

//     // Find the word in the specific deck
//     const wordToUpdate = await wordsCollection
//         .query(Q.where("deckId", deckId), Q.where("word", word))
//         .fetchOne();

//     if (wordToUpdate) {
//         // Update the word's status
//         await database.action(async () => {
//             await wordToUpdate.update((word) => {
//                 word.status = newStatus;
//             });
//         });
//     } else {
//         console.log(`Word "${word}" not found in deck "${deckId}"`);
//     }
// }
