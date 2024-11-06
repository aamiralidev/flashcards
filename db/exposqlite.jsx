import * as SQLite from 'expo-sqlite';

// Open (or create) a database
const db = SQLite.openDatabaseAsync('flashcards');

// Function to create the necessary tables
const createTables = async () => {
    await db.withTransactionAsync(
        async () => {
            await db.execAsync(`
                CREATE TABLE IF NOT EXISTS decks ( deckId INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT;
                CREATE TABLE IF NOT EXISTS words (
                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                  deckId INTEGER NOT NULL,
                  word TEXT NOT NULL,
                  meaning TEXT NOT NULL,
                  status TEXT NOT NULL DEFAULT 'unseen',
                  FOREIGN KEY (deckId) REFERENCES decks(deckId);
            `)
        }
    )
  };

  createTables()

  const checkIfDataExists = async (tableName) => {
    return  (await db.getFirstAsync(`SELECT COUNT(*) AS count FROM ${tableName}`)).count;
  };

  const seedDatabase = async (data) => {
    if(!checkIfDataExists('decks')){
        for(const deck of data.decks){
            db.execAsync(
                `INSERT INTO decks (deckId, name) VALUES (${deck.deckId},${deck.name})`
            )
        }
        for(const word of data.words){
            db.execAsync(
                `INSERT INTO words (deckId, word, meaning) VALUES (${word.deckId},${word.word},${word.meaning})`
            )
        }
    }
  };

  seedDatabase(require('../assets/initialData.json'))


export async function getDecksWithMasteredCount() {
    return db.getAllAsync(`
SELECT decks.deckId, decks.name, COUNT(*) AS masteredCount
FROM decks
JOIN words ON decks.deckId = words.deckId
WHERE words.status = 'mastered'
GROUP BY decks.deckId, decks.name
ORDER BY decks.deckId;
    `);

}

