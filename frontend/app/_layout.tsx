import { Stack } from 'expo-router';
import { StatusBar } from 'react-native';

export default function RootLayout() {
  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#1a1a2e',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: 'Beyblade X Builder',
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="builder"
          options={{
            title: 'Montar Combo',
          }}
        />
        <Stack.Screen
          name="result"
          options={{
            title: 'Resultado do Combo',
          }}
        />
        <Stack.Screen
          name="ranking"
          options={{
            title: 'Ranking Nacional',
          }}
        />
        <Stack.Screen
          name="register-deck"
          options={{
            title: 'Registrar Deck',
          }}
        />
      </Stack>
    </>
  );
}
