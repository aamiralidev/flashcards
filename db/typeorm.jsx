const { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, createConnection } = require('typeorm');


@Entity()
class Word {
  @PrimaryGeneratedColumn('uuid')  // Using UUID as primary key
  id;

  @Column('text')
  word;

  @Column('text')
  meaning;

  @Column('text')
  status;

  @ManyToOne(() => Deck, deck => deck.words)
  deck;  // Reference to Deck
}

@Entity()
class Deck {
  @PrimaryGeneratedColumn('uuid')  // Using UUID as primary key
  deckId;

  @Column('text')
  name;

  @OneToMany(() => Word, word => word.deck)  // Establish a one-to-many relationship with Word
  words;
}

async function connectDatabase() {
  const connection = await createConnection({
    type: 'better-sqlite3',
    database: 'flashcards.db',  // Your SQLite database file
    synchronize: true,           // Automatically create tables if not exist
    logging: false,
    entities: [Deck, Word],      // List of entities
  });

  return connection;
}

async function seedDatabase() {
  const connection = await connectDatabase();
  const deckRepository = connection.getRepository(Deck);
  const wordRepository = connection.getRepository(Word);

  // Check if decks exist
  const existingDecks = await deckRepository.find();
  if (existingDecks.length === 0) {
    // Insert decks
    const decks = [
      { name: 'Basic 1' },
      { name: 'Basic 2' },
      { name: 'Intermediate 1' },
      { name: 'Intermediate 2' },
      { name: 'Advanced 1' },
    ];
    const createdDecks = await deckRepository.save(decks);

    // Insert words for each deck
    const words = [
      { word: 'apple', meaning: 'A fruit', status: 'unseen', deck: createdDecks[0] },
      { word: 'banana', meaning: 'A yellow fruit', status: 'unseen', deck: createdDecks[0] },
      { word: 'cherry', meaning: 'A small red fruit', status: 'unseen', deck: createdDecks[1] },
      { word: 'date', meaning: 'A sweet fruit', status: 'unseen', deck: createdDecks[1] },
      // Add more words...
    ];
    await wordRepository.save(words);

    console.log('Database seeded successfully');
  } else {
    console.log('Decks already exist, no need to seed data');
  }

  await connection.close();
}

seedDatabase().catch(console.error);

export async function getDecksWithMasteredCount() {
  const connection = await connectDatabase();
  const deckRepository = connection.getRepository(Deck);
  const wordRepository = connection.getRepository(Word);

  // Fetch all decks
  const decks = await deckRepository.find();

  // Get count of mastered words for each deck
  const masteredCountByDeckId = {};
  const masteredWords = await wordRepository.find({ where: { status: 'mastered' } });
  masteredWords.forEach(word => {
    masteredCountByDeckId[word.deck.deckId] = (masteredCountByDeckId[word.deck.deckId] || 0) + 1;
  });

  // Combine deck details with mastered word count
  const decksWithMasteredCount = decks.map(deck => ({
    deckId: deck.deckId,
    name: deck.name,
    masteredCount: masteredCountByDeckId[deck.deckId] || 0,  // Default to 0 if no mastered words
  }));

  await connection.close();
  return decksWithMasteredCount;
}

export async function getWordsForDeck(deckId) {
  const connection = await connectDatabase();
  const wordRepository = connection.getRepository(Word);

  // Fetch all words for the given deckId
  const words = await wordRepository.find({ where: { deck: { deckId } } });

  await connection.close();
  return words.map(word => ({
    word: word.word,
    meaning: word.meaning,
    status: word.status,
  }));
}

export async function updateWordStatus(deckId, word, newStatus) {
  const connection = await connectDatabase();
  const wordRepository = connection.getRepository(Word);

  // Find the word in the deck
  const wordToUpdate = await wordRepository.findOne({
    where: { word, deck: { deckId } },
  });

  if (wordToUpdate) {
    // Update the word's status
    wordToUpdate.status = newStatus;
    await wordRepository.save(wordToUpdate);
    console.log(`Updated word "${word}" in deck "${deckId}"`);
  } else {
    console.log(`Word "${word}" not found in deck "${deckId}"`);
  }

  await connection.close();
}