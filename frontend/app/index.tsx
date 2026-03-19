import { Text, View, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function Index() {
  const router = useRouter();

  const menuItems = [
    {
      title: 'Montar Combo',
      subtitle: 'Crie e avalie seu Beyblade',
      icon: 'construct',
      route: '/builder',
      color: '#FF6B6B',
    },
    {
      title: 'Ranking Nacional',
      subtitle: 'Combos mais usados',
      icon: 'trophy',
      route: '/ranking',
      color: '#FFD93D',
    },
    {
      title: 'Registrar Deck',
      subtitle: 'Registre seu deck de torneio',
      icon: 'add-circle',
      route: '/register-deck',
      color: '#6BCF7F',
    },
    {
      title: 'Gerenciar Dados',
      subtitle: 'Exportar/Importar decks',
      icon: 'cloud-offline',
      route: '/data-management',
      color: '#A78BFA',
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>BEYBLADE X</Text>
        <Text style={styles.subtitle}>Combo Builder</Text>
        <Text style={styles.description}>
          Monte seu combo perfeito, receba análise completa e contribua para o ranking nacional!
        </Text>
      </View>

      <View style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.menuCard, { borderLeftColor: item.color }]}
            onPress={() => router.push(item.route as any)}
            activeOpacity={0.7}
          >
            <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
              <Ionicons name={item.icon as any} size={32} color={item.color} />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#fff" />
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          🔥 Participe da comunidade Beyblade X Brasil
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0f1e",
  },
  header: {
    paddingTop: 40,
    paddingHorizontal: 24,
    paddingBottom: 32,
    backgroundColor: "#1a1a2e",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 20,
    color: "#FFD93D",
    textAlign: "center",
    marginTop: 8,
    fontWeight: "600",
  },
  description: {
    fontSize: 14,
    color: "#a0a0a0",
    textAlign: "center",
    marginTop: 16,
    lineHeight: 20,
  },
  menuContainer: {
    padding: 24,
    gap: 16,
  },
  menuCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a1a2e",
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  menuSubtitle: {
    fontSize: 13,
    color: "#a0a0a0",
  },
  footer: {
    padding: 24,
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    color: "#6BCF7F",
    textAlign: "center",
    fontWeight: "600",
  },
});
