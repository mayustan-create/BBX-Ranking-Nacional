import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

const DECKS_KEY = '@beyblade_decks';
const PARTS_KEY = '@beyblade_parts';

// Interface dos dados
export interface Deck {
  id: string;
  player_name: string;
  city: string;
  event_name: string;
  event_date: string;
  combos: string[];
  registered_at: string;
  source: 'local' | 'imported';
}

export interface ComboStats {
  combo: string;
  usage_count: number;
  percentage: number;
}

// ==================== SALVAR/CARREGAR LOCALMENTE ====================

export const saveDecks = async (decks: Deck[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(DECKS_KEY, JSON.stringify(decks));
  } catch (error) {
    console.error('Erro ao salvar decks:', error);
    throw error;
  }
};

export const loadDecks = async (): Promise<Deck[]> => {
  try {
    const data = await AsyncStorage.getItem(DECKS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Erro ao carregar decks:', error);
    return [];
  }
};

export const addDeck = async (deck: Omit<Deck, 'id' | 'registered_at' | 'source'>): Promise<Deck> => {
  try {
    const decks = await loadDecks();
    const newDeck: Deck = {
      ...deck,
      id: Date.now().toString(),
      registered_at: new Date().toISOString(),
      source: 'local',
    };
    decks.push(newDeck);
    await saveDecks(decks);
    return newDeck;
  } catch (error) {
    console.error('Erro ao adicionar deck:', error);
    throw error;
  }
};

// ==================== RANKING ====================

export const calculateRanking = async (): Promise<ComboStats[]> => {
  try {
    const decks = await loadDecks();
    const comboCount: { [key: string]: number } = {};

    // Contar uso de cada combo
    decks.forEach((deck) => {
      deck.combos.forEach((combo) => {
        comboCount[combo] = (comboCount[combo] || 0) + 1;
      });
    });

    // Calcular total de usos
    const totalUses = Object.values(comboCount).reduce((a, b) => a + b, 0);

    // Criar ranking
    const ranking: ComboStats[] = Object.entries(comboCount)
      .map(([combo, count]) => ({
        combo,
        usage_count: count,
        percentage: totalUses > 0 ? (count / totalUses) * 100 : 0,
      }))
      .sort((a, b) => b.usage_count - a.usage_count);

    return ranking;
  } catch (error) {
    console.error('Erro ao calcular ranking:', error);
    return [];
  }
};

// ==================== EXPORTAR ====================

export const exportDecks = async (): Promise<void> => {
  try {
    const decks = await loadDecks();
    
    if (decks.length === 0) {
      throw new Error('Nenhum deck para exportar!');
    }

    // Criar JSON
    const exportData = {
      version: '1.0',
      exported_at: new Date().toISOString(),
      total_decks: decks.length,
      decks: decks,
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    const fileName = `beyblade_decks_${Date.now()}.json`;
    const fileUri = FileSystem.documentDirectory + fileName;

    // Salvar arquivo
    await FileSystem.writeAsStringAsync(fileUri, jsonString);

    // Compartilhar
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/json',
        dialogTitle: 'Compartilhar Decks Beyblade X',
      });
    } else {
      throw new Error('Compartilhamento não disponível neste dispositivo');
    }
  } catch (error) {
    console.error('Erro ao exportar decks:', error);
    throw error;
  }
};

// ==================== IMPORTAR ====================

export const importDecks = async (jsonString: string): Promise<number> => {
  try {
    const importData = JSON.parse(jsonString);

    if (!importData.decks || !Array.isArray(importData.decks)) {
      throw new Error('Arquivo inválido!');
    }

    const currentDecks = await loadDecks();
    const existingIds = new Set(currentDecks.map((d) => d.id));
    
    // Adicionar apenas decks novos
    const newDecks = importData.decks
      .filter((deck: Deck) => !existingIds.has(deck.id))
      .map((deck: Deck) => ({
        ...deck,
        source: 'imported' as const,
      }));

    if (newDecks.length === 0) {
      return 0; // Nenhum deck novo
    }

    const updatedDecks = [...currentDecks, ...newDecks];
    await saveDecks(updatedDecks);

    return newDecks.length;
  } catch (error) {
    console.error('Erro ao importar decks:', error);
    throw error;
  }
};

// ==================== ESTATÍSTICAS ====================

export const getStats = async () => {
  try {
    const decks = await loadDecks();
    const ranking = await calculateRanking();

    return {
      total_decks: decks.length,
      local_decks: decks.filter((d) => d.source === 'local').length,
      imported_decks: decks.filter((d) => d.source === 'imported').length,
      unique_combos: ranking.length,
      most_used_combo: ranking[0]?.combo || 'Nenhum',
    };
  } catch (error) {
    console.error('Erro ao obter stats:', error);
    return {
      total_decks: 0,
      local_decks: 0,
      imported_decks: 0,
      unique_combos: 0,
      most_used_combo: 'Nenhum',
    };
  }
};

// ==================== LIMPAR DADOS ====================

export const clearAllDecks = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(DECKS_KEY);
  } catch (error) {
    console.error('Erro ao limpar decks:', error);
    throw error;
  }
};
