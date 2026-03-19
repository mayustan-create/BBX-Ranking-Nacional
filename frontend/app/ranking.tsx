import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { calculateRanking, ComboStats } from '../utils/localData';

export default function Ranking() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [ranking, setRanking] = useState<ComboStats[]>([]);

  useEffect(() => {
    fetchRanking();
  }, []);

  const fetchRanking = async () => {
    try {
      const data = await calculateRanking();
      setRanking(data);
    } catch (error) {
      console.error('Erro ao carregar ranking:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchRanking();
  };

  const getMedalColor = (position: number) => {
    if (position === 0) return '#FFD700'; // Gold
    if (position === 1) return '#C0C0C0'; // Silver
    if (position === 2) return '#CD7F32'; // Bronze
    return '#a0a0a0';
  };

  const getMedalIcon = (position: number) => {
    if (position < 3) return 'trophy';
    return 'ribbon';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFD93D" />
        <Text style={styles.loadingText}>Carregando ranking...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="analytics" size={32} color="#FFD93D" />
        <Text style={styles.headerTitle}>Ranking Local</Text>
        <Text style={styles.headerSubtitle}>
          Baseado nos decks registrados + importados
        </Text>
        <TouchableOpacity
          style={styles.manageButton}
          onPress={() => router.push('/data-management')}
        >
          <Ionicons name="settings" size={16} color="#FFD93D" />
          <Text style={styles.manageButtonText}>Gerenciar Dados</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#FFD93D"
          />
        }
      >
        {ranking.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="sad-outline" size={64} color="#a0a0a0" />
            <Text style={styles.emptyText}>Nenhum combo registrado ainda</Text>
            <Text style={styles.emptySubtext}>
              Seja o primeiro a registrar um deck!
            </Text>
          </View>
        ) : (
          ranking.map((item, index) => (
            <View
              key={index}
              style={[
                styles.rankingCard,
                index < 3 && styles.topThreeCard,
              ]}
            >
              <View style={styles.positionContainer}>
                <Ionicons
                  name={getMedalIcon(index) as any}
                  size={28}
                  color={getMedalColor(index)}
                />
                <Text
                  style={[
                    styles.position,
                    index < 3 && styles.topThreePosition,
                  ]}
                >
                  #{index + 1}
                </Text>
              </View>

              <View style={styles.comboInfo}>
                <Text style={styles.comboText}>{item.combo}</Text>
                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <Ionicons name="people" size={16} color="#FFD93D" />
                    <Text style={styles.statText}>
                      {item.usage_count}x usado
                    </Text>
                  </View>
                  <View style={styles.percentageContainer}>
                    <Text style={styles.percentageText}>
                      {item.percentage.toFixed(1)}%
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          ))
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Total de {ranking.length} combos únicos registrados
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1e',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f0f1e',
  },
  loadingText: {
    marginTop: 16,
    color: '#fff',
    fontSize: 16,
  },
  header: {
    backgroundColor: '#1a1a2e',
    padding: 24,
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 12,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#a0a0a0',
    marginTop: 8,
    textAlign: 'center',
  },
  manageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FFD93D',
  },
  manageButtonText: {
    color: '#FFD93D',
    fontSize: 13,
    fontWeight: '600',
  },
  listContainer: {
    flex: 1,
    padding: 16,
  },
  rankingCard: {
    flexDirection: 'row',
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  topThreeCard: {
    borderWidth: 2,
    borderColor: '#FFD93D40',
  },
  positionContainer: {
    alignItems: 'center',
    marginRight: 16,
    width: 50,
  },
  position: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#a0a0a0',
    marginTop: 4,
  },
  topThreePosition: {
    color: '#FFD93D',
  },
  comboInfo: {
    flex: 1,
  },
  comboText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 13,
    color: '#a0a0a0',
  },
  percentageContainer: {
    backgroundColor: '#FFD93D20',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  percentageText: {
    fontSize: 13,
    color: '#FFD93D',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
    marginTop: 24,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#a0a0a0',
    marginTop: 8,
  },
  footer: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    color: '#6BCF7F',
    fontWeight: '600',
  },
});
