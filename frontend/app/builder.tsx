import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

interface Part {
  name: string;
  type?: string;
  display_name?: string;
  code?: string;
}

export default function Builder() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);

  const [blades, setBlades] = useState<Part[]>([]);
  const [ratchets, setRatchets] = useState<Part[]>([]);
  const [bits, setBits] = useState<Part[]>([]);

  const [selectedBlade, setSelectedBlade] = useState('');
  const [selectedRatchet, setSelectedRatchet] = useState('');
  const [selectedBit, setSelectedBit] = useState('');

  useEffect(() => {
    fetchParts();
  }, []);

  const fetchParts = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/parts`);
      const data = await response.json();

      setBlades(data.blades);
      setRatchets(data.ratchets);
      setBits(data.bits);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar peças:', error);
      Alert.alert('Erro', 'Não foi possível carregar as peças');
      setLoading(false);
    }
  };

  const handleCalculate = async () => {
    if (!selectedBlade || !selectedRatchet || !selectedBit) {
      Alert.alert('Atenção', 'Selecione todas as peças do combo!');
      return;
    }

    setCalculating(true);

    try {
      const response = await fetch(`${BACKEND_URL}/api/calculate-combo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          blade: selectedBlade,
          ratchet: selectedRatchet,
          bit: selectedBit,
        }),
      });

      const result = await response.json();

      // Navegar para tela de resultado com os dados
      router.push({
        pathname: '/result',
        params: {
          combo: result.combo_string,
          attack: result.attack,
          defense: result.defense,
          stamina: result.stamina,
          xtreme_dash: result.xtreme_dash,
          burst_resistance: result.burst_resistance,
          rating: result.overall_rating,
          usage_count: result.usage_count,
        },
      });
    } catch (error) {
      console.error('Erro ao calcular combo:', error);
      Alert.alert('Erro', 'Não foi possível calcular o combo');
    } finally {
      setCalculating(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFD93D" />
        <Text style={styles.loadingText}>Carregando peças...</Text>
      </View>
    );
  }

  const getBladeType = (bladeName: string) => {
    const blade = blades.find(b => b.name === bladeName);
    return blade?.type || '';
  };

  const getBitType = (bitCode: string) => {
    const bit = bits.find(b => b.code === bitCode || b.display_name === bitCode);
    return bit?.type || '';
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color="#FFD93D" />
          <Text style={styles.infoText}>
            Monte seu combo selecionando uma Blade, Ratchet e Bit abaixo
          </Text>
        </View>

        {/* Blade Selector */}
        <View style={styles.selectorCard}>
          <View style={styles.selectorHeader}>
            <Ionicons name="disc" size={24} color="#FF6B6B" />
            <Text style={styles.selectorTitle}>BLADE</Text>
            {selectedBlade && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {getBladeType(selectedBlade)}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedBlade}
              onValueChange={(value) => setSelectedBlade(value)}
              style={styles.picker}
              dropdownIconColor="#fff"
            >
              <Picker.Item label="Selecione uma Blade..." value="" />
              {blades.map((blade) => (
                <Picker.Item
                  key={blade.name}
                  label={`${blade.name} (${blade.type})`}
                  value={blade.name}
                />
              ))}
            </Picker>
          </View>
        </View>

        {/* Ratchet Selector */}
        <View style={styles.selectorCard}>
          <View style={styles.selectorHeader}>
            <Ionicons name="settings" size={24} color="#6BCF7F" />
            <Text style={styles.selectorTitle}>RATCHET</Text>
          </View>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedRatchet}
              onValueChange={(value) => setSelectedRatchet(value)}
              style={styles.picker}
              dropdownIconColor="#fff"
            >
              <Picker.Item label="Selecione um Ratchet..." value="" />
              {ratchets.map((ratchet) => (
                <Picker.Item
                  key={ratchet.name}
                  label={ratchet.name}
                  value={ratchet.name}
                />
              ))}
            </Picker>
          </View>
        </View>

        {/* Bit Selector */}
        <View style={styles.selectorCard}>
          <View style={styles.selectorHeader}>
            <Ionicons name="flash" size={24} color="#A78BFA" />
            <Text style={styles.selectorTitle}>BIT</Text>
            {selectedBit && (
              <View style={[styles.badge, styles.bitBadge]}>
                <Text style={styles.badgeText}>
                  {getBitType(selectedBit.split(' ')[0])}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedBit}
              onValueChange={(value) => setSelectedBit(value)}
              style={styles.picker}
              dropdownIconColor="#fff"
            >
              <Picker.Item label="Selecione um Bit..." value="" />
              {bits.map((bit) => (
                <Picker.Item
                  key={bit.code}
                  label={bit.display_name}
                  value={bit.display_name}
                />
              ))}
            </Picker>
          </View>
        </View>

        {/* Selected Combo Preview */}
        {selectedBlade && selectedRatchet && selectedBit && (
          <View style={styles.previewCard}>
            <Text style={styles.previewTitle}>SEU COMBO:</Text>
            <Text style={styles.previewCombo}>
              {selectedBlade} {selectedRatchet} {selectedBit.split(' ')[0]}
            </Text>
          </View>
        )}

        {/* Calculate Button */}
        <TouchableOpacity
          style={[
            styles.calculateButton,
            (!selectedBlade || !selectedRatchet || !selectedBit) &&
              styles.buttonDisabled,
          ]}
          onPress={handleCalculate}
          disabled={
            !selectedBlade ||
            !selectedRatchet ||
            !selectedBit ||
            calculating
          }
        >
          {calculating ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="calculator" size={24} color="#fff" />
              <Text style={styles.calculateButtonText}>CALCULAR COMBO</Text>
            </>
          )}
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
  content: {
    padding: 24,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    gap: 12,
  },
  infoText: {
    flex: 1,
    color: '#a0a0a0',
    fontSize: 14,
    lineHeight: 20,
  },
  selectorCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  selectorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  selectorTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  badge: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  bitBadge: {
    backgroundColor: '#A78BFA',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  pickerContainer: {
    backgroundColor: '#0f0f1e',
    borderRadius: 12,
    overflow: 'hidden',
  },
  picker: {
    color: '#fff',
    height: 50,
  },
  previewCard: {
    backgroundColor: '#FFD93D20',
    borderWidth: 2,
    borderColor: '#FFD93D',
    borderRadius: 16,
    padding: 20,
    marginTop: 8,
    marginBottom: 24,
    alignItems: 'center',
  },
  previewTitle: {
    fontSize: 14,
    color: '#FFD93D',
    fontWeight: '600',
    marginBottom: 8,
  },
  previewCombo: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  calculateButton: {
    backgroundColor: '#FFD93D',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 16,
    gap: 12,
    marginBottom: 32,
  },
  buttonDisabled: {
    backgroundColor: '#3a3a3a',
    opacity: 0.5,
  },
  calculateButtonText: {
    color: '#0f0f1e',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
