import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

interface Part {
  name: string;
  type?: string;
  display_name?: string;
  code?: string;
}

export default function RegisterDeck() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [blades, setBlades] = useState<Part[]>([]);
  const [ratchets, setRatchets] = useState<Part[]>([]);
  const [bits, setBits] = useState<Part[]>([]);

  // Form data
  const [playerName, setPlayerName] = useState('');
  const [city, setCity] = useState('');
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  // Combo 1
  const [combo1Blade, setCombo1Blade] = useState('');
  const [combo1Ratchet, setCombo1Ratchet] = useState('');
  const [combo1Bit, setCombo1Bit] = useState('');

  // Combo 2
  const [combo2Blade, setCombo2Blade] = useState('');
  const [combo2Ratchet, setCombo2Ratchet] = useState('');
  const [combo2Bit, setCombo2Bit] = useState('');

  // Combo 3
  const [combo3Blade, setCombo3Blade] = useState('');
  const [combo3Ratchet, setCombo3Ratchet] = useState('');
  const [combo3Bit, setCombo3Bit] = useState('');

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

  const validateForm = () => {
    if (!playerName.trim()) {
      Alert.alert('Atenção', 'Digite o nome do jogador');
      return false;
    }
    if (!city.trim()) {
      Alert.alert('Atenção', 'Digite a cidade');
      return false;
    }
    if (!eventName.trim()) {
      Alert.alert('Atenção', 'Digite o nome do evento');
      return false;
    }
    if (!eventDate) {
      Alert.alert('Atenção', 'Digite a data do evento');
      return false;
    }

    // Validar combos
    const combos = [
      { blade: combo1Blade, ratchet: combo1Ratchet, bit: combo1Bit, num: 1 },
      { blade: combo2Blade, ratchet: combo2Ratchet, bit: combo2Bit, num: 2 },
      { blade: combo3Blade, ratchet: combo3Ratchet, bit: combo3Bit, num: 3 },
    ];

    for (const combo of combos) {
      if (!combo.blade || !combo.ratchet || !combo.bit) {
        Alert.alert('Atenção', `Complete todas as peças do Combo ${combo.num}`);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSubmitting(true);

    try {
      const response = await fetch(`${BACKEND_URL}/api/register-deck`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          player_name: playerName,
          city: city,
          event_name: eventName,
          event_date: eventDate,
          combo1: {
            blade: combo1Blade,
            ratchet: combo1Ratchet,
            bit: combo1Bit,
          },
          combo2: {
            blade: combo2Blade,
            ratchet: combo2Ratchet,
            bit: combo2Bit,
          },
          combo3: {
            blade: combo3Blade,
            ratchet: combo3Ratchet,
            bit: combo3Bit,
          },
        }),
      });

      if (response.ok) {
        Alert.alert(
          'Sucesso! 🎉',
          'Deck registrado com sucesso! Você contribuiu para o ranking nacional.',
          [
            {
              text: 'Ver Ranking',
              onPress: () => router.push('/ranking'),
            },
            {
              text: 'OK',
              onPress: () => router.push('/'),
            },
          ]
        );
      } else {
        Alert.alert('Erro', 'Não foi possível registrar o deck');
      }
    } catch (error) {
      console.error('Erro ao registrar deck:', error);
      Alert.alert('Erro', 'Não foi possível registrar o deck');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFD93D" />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* Info Card */}
          <View style={styles.infoCard}>
            <Ionicons name="information-circle" size={24} color="#6BCF7F" />
            <Text style={styles.infoText}>
              Registre seu deck de torneio e contribua para as estatísticas
              nacionais!
            </Text>
          </View>

          {/* Player Info Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>INFORMAÇÕES DO JOGADOR</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nome do Jogador</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Digite seu nome"
                placeholderTextColor="#666"
                value={playerName}
                onChangeText={setPlayerName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Cidade</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Ex: São Paulo, SP"
                placeholderTextColor="#666"
                value={city}
                onChangeText={setCity}
              />
            </View>
          </View>

          {/* Event Info Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>INFORMAÇÕES DO EVENTO</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nome do Evento</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Ex: Torneio Regional 2025"
                placeholderTextColor="#666"
                value={eventName}
                onChangeText={setEventName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Data do Evento</Text>
              <TextInput
                style={styles.textInput}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#666"
                value={eventDate}
                onChangeText={setEventDate}
              />
            </View>
          </View>

          {/* Combo 1 */}
          <View style={styles.comboSection}>
            <View style={styles.comboHeader}>
              <Ionicons name="star" size={20} color="#FFD93D" />
              <Text style={styles.comboTitle}>COMBO 1</Text>
            </View>

            <View style={styles.pickerGroup}>
              <Text style={styles.pickerLabel}>Blade</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={combo1Blade}
                  onValueChange={setCombo1Blade}
                  style={styles.picker}
                  dropdownIconColor="#fff"
                >
                  <Picker.Item label="Selecione..." value="" />
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

            <View style={styles.pickerGroup}>
              <Text style={styles.pickerLabel}>Ratchet</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={combo1Ratchet}
                  onValueChange={setCombo1Ratchet}
                  style={styles.picker}
                  dropdownIconColor="#fff"
                >
                  <Picker.Item label="Selecione..." value="" />
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

            <View style={styles.pickerGroup}>
              <Text style={styles.pickerLabel}>Bit</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={combo1Bit}
                  onValueChange={setCombo1Bit}
                  style={styles.picker}
                  dropdownIconColor="#fff"
                >
                  <Picker.Item label="Selecione..." value="" />
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
          </View>

          {/* Combo 2 */}
          <View style={styles.comboSection}>
            <View style={styles.comboHeader}>
              <Ionicons name="star" size={20} color="#6BCF7F" />
              <Text style={styles.comboTitle}>COMBO 2</Text>
            </View>

            <View style={styles.pickerGroup}>
              <Text style={styles.pickerLabel}>Blade</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={combo2Blade}
                  onValueChange={setCombo2Blade}
                  style={styles.picker}
                  dropdownIconColor="#fff"
                >
                  <Picker.Item label="Selecione..." value="" />
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

            <View style={styles.pickerGroup}>
              <Text style={styles.pickerLabel}>Ratchet</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={combo2Ratchet}
                  onValueChange={setCombo2Ratchet}
                  style={styles.picker}
                  dropdownIconColor="#fff"
                >
                  <Picker.Item label="Selecione..." value="" />
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

            <View style={styles.pickerGroup}>
              <Text style={styles.pickerLabel}>Bit</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={combo2Bit}
                  onValueChange={setCombo2Bit}
                  style={styles.picker}
                  dropdownIconColor="#fff"
                >
                  <Picker.Item label="Selecione..." value="" />
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
          </View>

          {/* Combo 3 */}
          <View style={styles.comboSection}>
            <View style={styles.comboHeader}>
              <Ionicons name="star" size={20} color="#FF6B6B" />
              <Text style={styles.comboTitle}>COMBO 3</Text>
            </View>

            <View style={styles.pickerGroup}>
              <Text style={styles.pickerLabel}>Blade</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={combo3Blade}
                  onValueChange={setCombo3Blade}
                  style={styles.picker}
                  dropdownIconColor="#fff"
                >
                  <Picker.Item label="Selecione..." value="" />
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

            <View style={styles.pickerGroup}>
              <Text style={styles.pickerLabel}>Ratchet</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={combo3Ratchet}
                  onValueChange={setCombo3Ratchet}
                  style={styles.picker}
                  dropdownIconColor="#fff"
                >
                  <Picker.Item label="Selecione..." value="" />
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

            <View style={styles.pickerGroup}>
              <Text style={styles.pickerLabel}>Bit</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={combo3Bit}
                  onValueChange={setCombo3Bit}
                  style={styles.picker}
                  dropdownIconColor="#fff"
                >
                  <Picker.Item label="Selecione..." value="" />
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
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={24} color="#fff" />
                <Text style={styles.submitButtonText}>REGISTRAR DECK</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1e',
  },
  scrollView: {
    flex: 1,
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
  section: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFD93D',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: '#a0a0a0',
    marginBottom: 8,
    fontWeight: '600',
  },
  textInput: {
    backgroundColor: '#0f0f1e',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16,
  },
  comboSection: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  comboHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  comboTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  pickerGroup: {
    marginBottom: 12,
  },
  pickerLabel: {
    fontSize: 13,
    color: '#a0a0a0',
    marginBottom: 6,
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
  submitButton: {
    backgroundColor: '#6BCF7F',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 16,
    gap: 12,
    marginBottom: 32,
    marginTop: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
