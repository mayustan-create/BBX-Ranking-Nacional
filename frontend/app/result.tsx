import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { RadarChart } from 'react-native-gifted-charts';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function Result() {
  const params = useLocalSearchParams();
  const router = useRouter();

  const combo = params.combo as string;
  const attack = parseInt(params.attack as string);
  const defense = parseInt(params.defense as string);
  const stamina = parseInt(params.stamina as string);
  const xtreme_dash = parseInt(params.xtreme_dash as string);
  const burst_resistance = parseInt(params.burst_resistance as string);
  const rating = parseFloat(params.rating as string);
  const usage_count = parseInt(params.usage_count as string) || 0;

  // Dados para o gráfico radar
  const radarData = [
    { label: 'Ataque', value: attack },
    { label: 'Defesa', value: defense },
    { label: 'Estamina', value: stamina },
    { label: 'X-Dash', value: xtreme_dash },
    { label: 'Burst Res.', value: burst_resistance },
  ];

  const getRatingColor = (rating: number) => {
    if (rating >= 8) return '#6BCF7F';
    if (rating >= 6) return '#FFD93D';
    if (rating >= 4) return '#FFA500';
    return '#FF6B6B';
  };

  const getRatingLabel = (rating: number) => {
    if (rating >= 9) return 'EXCEPCIONAL';
    if (rating >= 8) return 'EXCELENTE';
    if (rating >= 7) return 'MUITO BOM';
    if (rating >= 6) return 'BOM';
    if (rating >= 5) return 'REGULAR';
    if (rating >= 4) return 'FRACO';
    return 'MUITO FRACO';
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Combo Name Card */}
        <View style={styles.comboCard}>
          <Text style={styles.comboLabel}>SEU COMBO</Text>
          <Text style={styles.comboName}>{combo}</Text>
        </View>

        {/* Rating Card */}
        <View style={[styles.ratingCard, { borderColor: getRatingColor(rating) }]}>
          <Text style={styles.ratingLabel}>NOTA GERAL</Text>
          <Text style={[styles.ratingValue, { color: getRatingColor(rating) }]}>
            {rating.toFixed(1)}
          </Text>
          <Text style={styles.ratingSubtext}>{getRatingLabel(rating)}</Text>
        </View>

        {/* Usage Stats */}
        {usage_count > 0 && (
          <View style={styles.usageCard}>
            <Ionicons name="people" size={24} color="#FFD93D" />
            <Text style={styles.usageText}>
              Usado {usage_count}x em torneios registrados
            </Text>
          </View>
        )}

        {/* Radar Chart */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>CARACTERÍSTICAS</Text>
          
          <View style={styles.chartContainer}>
            <RadarChart
              data={radarData.map(item => ({
                value: item.value,
              }))}
              maxValue={100}
              labelsData={radarData.map(item => item.label)}
              radius={width * 0.35}
              strokeWidth={2}
              strokeColor="#FFD93D"
              fillColor="#FFD93D"
              fillOpacity={0.3}
              dataPointsColor="#FFD93D"
              dataPointsRadius={6}
              dataPointsLabelComponent={(label: any, index: number) => {
                return (
                  <Text style={styles.dataPointLabel}>
                    {radarData[index].value}
                  </Text>
                );
              }}
              chartConfig={{
                backgroundGradientFrom: '#1a1a2e',
                backgroundGradientTo: '#1a1a2e',
                color: (opacity = 1) => `rgba(255, 217, 61, ${opacity})`,
              }}
            />
          </View>

          {/* Stats Breakdown */}
          <View style={styles.statsBreakdown}>
            {radarData.map((stat, index) => (
              <View key={index} style={styles.statRow}>
                <Text style={styles.statLabel}>{stat.label}</Text>
                <View style={styles.statBarContainer}>
                  <View
                    style={[
                      styles.statBar,
                      {
                        width: `${stat.value}%`,
                        backgroundColor: getRatingColor(stat.value / 10),
                      },
                    ]}
                  />
                </View>
                <Text style={styles.statValue}>{stat.value}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Action Buttons */}
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push('/builder')}
        >
          <Ionicons name="construct" size={20} color="#0f0f1e" />
          <Text style={styles.primaryButtonText}>Montar Outro Combo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.push('/register-deck')}
        >
          <Ionicons name="add-circle-outline" size={20} color="#fff" />
          <Text style={styles.secondaryButtonText}>Registrar em um Deck</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.push('/ranking')}
        >
          <Ionicons name="trophy-outline" size={20} color="#fff" />
          <Text style={styles.secondaryButtonText}>Ver Ranking Nacional</Text>
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
  comboCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  comboLabel: {
    fontSize: 12,
    color: '#a0a0a0',
    fontWeight: '600',
    marginBottom: 8,
  },
  comboName: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  ratingCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    borderWidth: 3,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  ratingLabel: {
    fontSize: 14,
    color: '#a0a0a0',
    fontWeight: '600',
    marginBottom: 8,
  },
  ratingValue: {
    fontSize: 56,
    fontWeight: 'bold',
  },
  ratingSubtext: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
    marginTop: 8,
  },
  usageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD93D20',
    borderWidth: 1,
    borderColor: '#FFD93D',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    marginBottom: 16,
  },
  usageText: {
    flex: 1,
    color: '#FFD93D',
    fontSize: 14,
    fontWeight: '600',
  },
  chartCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
  },
  chartTitle: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    height: width * 0.8,
  },
  dataPointLabel: {
    color: '#FFD93D',
    fontSize: 12,
    fontWeight: 'bold',
  },
  statsBreakdown: {
    gap: 16,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    width: 80,
  },
  statBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: '#0f0f1e',
    borderRadius: 4,
    overflow: 'hidden',
  },
  statBar: {
    height: '100%',
    borderRadius: 4,
  },
  statValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    width: 35,
    textAlign: 'right',
  },
  primaryButton: {
    backgroundColor: '#FFD93D',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#0f0f1e',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    marginBottom: 12,
  },
  secondaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
