import AsyncStorage from '@react-native-async-storage/async-storage';

const JOURNAL_ENTRIES_KEY = '@lumio:journal_entries';
const JOURNAL_DRAFT_KEY = '@lumio:journal_draft';

export interface JournalEntry {
  id: string;
  content: string;
  date: string; // ISO date string
  createdAt: number; // timestamp
  updatedAt: number; // timestamp
}

/**
 * Journal storage utilities
 * Handles saving and loading journal entries
 */
export const JournalStorage = {
  // Save a journal entry
  async saveEntry(entry: JournalEntry): Promise<void> {
    try {
      const entries = await this.getAllEntries();
      const existingIndex = entries.findIndex((e) => e.id === entry.id);
      
      if (existingIndex >= 0) {
        entries[existingIndex] = entry;
      } else {
        entries.push(entry);
      }
      
      // Sort by date descending (newest first)
      entries.sort((a, b) => b.createdAt - a.createdAt);
      
      await AsyncStorage.setItem(JOURNAL_ENTRIES_KEY, JSON.stringify(entries));
    } catch (error) {
      console.error('Error saving journal entry:', error);
    }
  },

  // Get all journal entries
  async getAllEntries(): Promise<JournalEntry[]> {
    try {
      const data = await AsyncStorage.getItem(JOURNAL_ENTRIES_KEY);
      if (!data) return [];
      return JSON.parse(data);
    } catch (error) {
      console.error('Error loading journal entries:', error);
      return [];
    }
  },

  // Get entry by ID
  async getEntryById(id: string): Promise<JournalEntry | null> {
    try {
      const entries = await this.getAllEntries();
      return entries.find((e) => e.id === id) || null;
    } catch (error) {
      console.error('Error getting journal entry:', error);
      return null;
    }
  },

  // Get entry for a specific date
  async getEntryByDate(date: string): Promise<JournalEntry | null> {
    try {
      const entries = await this.getAllEntries();
      return entries.find((e) => e.date === date) || null;
    } catch (error) {
      console.error('Error getting journal entry by date:', error);
      return null;
    }
  },

  // Delete an entry
  async deleteEntry(id: string): Promise<void> {
    try {
      const entries = await this.getAllEntries();
      const filtered = entries.filter((e) => e.id !== id);
      await AsyncStorage.setItem(JOURNAL_ENTRIES_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting journal entry:', error);
    }
  },

  // Save draft (temporary storage while writing)
  async saveDraft(content: string): Promise<void> {
    try {
      await AsyncStorage.setItem(JOURNAL_DRAFT_KEY, content);
    } catch (error) {
      console.error('Error saving draft:', error);
    }
  },

  // Get draft
  async getDraft(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(JOURNAL_DRAFT_KEY);
    } catch (error) {
      console.error('Error getting draft:', error);
      return null;
    }
  },

  // Clear draft
  async clearDraft(): Promise<void> {
    try {
      await AsyncStorage.removeItem(JOURNAL_DRAFT_KEY);
    } catch (error) {
      console.error('Error clearing draft:', error);
    }
  },
};

