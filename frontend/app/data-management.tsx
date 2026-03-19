import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { exportDecks, importDecks, getStats, clearAllDecks } from '../utils/localData';

export default function DataManagement() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    total_decks: 0,
    local_decks: 0,
    imported_decks: 0,
    unique_combos: 0,
    most_used_combo: 'Nenhum',
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const data = await getStats();
    setStats(data);
  };

  const handleExport = async () => {
    if (stats.total_decks === 0) {
      Alert.alert('Atenção', 'Você não tem nenhum deck para exportar!');
      return;
    }

    setLoading(true);
    try {
      await exportDecks();
      Alert.alert(
        'Sucesso! 🎉',
        `${stats.total_decks} deck(s) exportado(s)!\n\nCompartilhe o arquivo com outros jogadores.`
      );
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Não foi possível exportar');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      setLoading(true);

      const fileContent = await FileSystem.readAsStringAsync(result.assets[0].uri);
      const imported = await importDecks(fileContent);

      if (imported === 0) {
        Alert.alert('Info', 'Nenhum deck novo encontrado. Todos já estavam importados.');
      } else {
        Alert.alert(
          'Sucesso! 🎉',
          `${imported} deck(s) importado(s) com sucesso!\n\nO ranking foi atualizado.`
        );
        await loadStats();
      }
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Arquivo inválido!');
    } finally {
      setLoading(false);
    }
  };

  const handleClearData = () => {
    Alert.alert(
      'Confirmar',
      'Tem certeza que deseja apagar TODOS os decks?\n\nIsso não pode ser desfeito!',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Apagar',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAllDecks();
              await loadStats();
              Alert.alert('Sucesso', 'Todos os decks foram apagados');
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível apagar os dados');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="cloud-offline" size={64} color="#FFD93D" />
          <Text style={styles.headerTitle}>Modo Offline</Text>
          <Text style={styles.headerSubtitle}>
            Seus dados ficam salvos no celular!
          </Text>
        </View>

        {/* Stats Card */}
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>📊 ESTATÍSTICAS</Text>
          
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Total de Decks:</Text>
            <Text style={styles.statValue}>{stats.total_decks}</Text>
          </View>

          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Decks Locais:</Text>
            <Text style={styles.statValue}>{stats.local_decks}</Text>
          </View>

          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Decks Importados:</Text>
            <Text style={styles.statValue}>{stats.imported_decks}</Text>
          </View>

          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Combos Únicos:</Text>
            <Text style={styles.statValue}>{stats.unique_combos}</Text>
          </View>

          <View style={styles.mostUsedCard}>
            <Text style={styles.mostUsedLabel}>🏆 Combo Mais Usado:</Text>
            <Text style={styles.mostUsedCombo}>{stats.most_used_combo}</Text>
          </View>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color="#6BCF7F" />
          <Text style={styles.infoText}>
            <Text style={styles.bold}>Como funciona:{'\n'}</Text>
            1. Registre seus decks normalmente{'\n'}
            2. Exporte e compartilhe no grupo{'\n'}
            3. Outros importam seus decks{'\n'}
            4. Ranking atualiza com decks de todos!
          </Text>
        </View>

        {/* Export Button */}
        <TouchableOpacity
          style={styles.exportButton}
          onPress={handleExport}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#0f0f1e" />
          ) : (
            <>
              <Ionicons name="share" size={24} color="#0f0f1e" />
              <Text style={styles.exportButtonText}>
                EXPORTAR MEUS DECKS
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Import Button */}
        <TouchableOpacity
          style={styles.importButton}
          onPress={handleImport}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="download" size={24} color="#fff" />
              <Text style={styles.importButtonText}>
                IMPORTAR DECKS
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Clear Data Button */}
        <TouchableOpacity
          style={styles.clearButton}
          onPress={handleClearData}
          disabled={loading}
        >
          <Ionicons name="trash" size={20} color="#FF6B6B" />
          <Text style={styles.clearButtonText}>Apagar Todos os Dados</Text>
        </TouchableOpacity>

        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={20} color="#fff" />
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1e',
  },
  content: {
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    paddingVertical: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 16,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#a0a0a0',
    marginTop: 8,
  },
  statsCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#0f0f1e',
  },
  statLabel: {
    fontSize: 15,
    color: '#a0a0a0',
  },
  statValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFD93D',
  },
  mostUsedCard: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#0f0f1e',
    borderRadius: 12,
  },
  mostUsedLabel: {
    fontSize: 14,
    color: '#a0a0a0',
    marginBottom: 8,
  },
  mostUsedCombo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#1a1a2e',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    gap: 12,
  },
  infoText: {
    flex: 1,
    color: '#a0a0a0',
    fontSize: 13,
    lineHeight: 20,
  },
  bold: {
    fontWeight: 'bold',
    color: '#6BCF7F',
  },
  exportButton: {
    backgroundColor: '#FFD93D',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 12,
    gap: 12,
    marginBottom: 12,
  },
  exportButtonText: {
    color: '#0f0f1e',
    fontSize: 16,
    fontWeight: 'bold',
  },
  importButton: {
    backgroundColor: '#6BCF7F',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 12,
    gap: 12,
    marginBottom: 12,
  },
  importButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FF6B6B',
  },
  clearButtonText: {
    color: '#FF6B6B',
    fontSize: 14,
    fontWeight: '600',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    borderWidth: 2,
    borderColor: '#fff',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
