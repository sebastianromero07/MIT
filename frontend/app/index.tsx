import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function WelcomeScreen() {

    const router = useRouter();
    
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      <View style={styles.container}>
        {/* Top App Bar / Logo Section */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <MaterialIcons name="monitor-heart" size={48} color="#ff3131" />
          </View>
          <Text style={styles.title}>
            BIENVENIDO A <Text style={styles.titlePrimary}>VITALSALUD</Text>
          </Text>
          <Text style={styles.subtitle}>Selecciona tu perfil para continuar</Text>
        </View>

        {/* Profile Selection Cards */}
        <View style={styles.cardsContainer}>
          {/* Paciente Card */}
          <TouchableOpacity style={[styles.card, styles.glowBlue]} activeOpacity={0.7}>
            <View style={[styles.cardIconBox, styles.iconBoxBlue]}>
              <MaterialIcons name="favorite" size={32} color="#00d2ff" />
            </View>
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>PACIENTE</Text>
              <Text style={styles.cardDescription}>Monitorea tus signos vitales en tiempo real</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#64748b" />
          </TouchableOpacity>

          {/* Familiar Card */}
          <TouchableOpacity style={[styles.card, styles.glowGreen]} activeOpacity={0.7}>
            <View style={[styles.cardIconBox, styles.iconBoxGreen]}>
              <MaterialIcons name="group" size={32} color="#39ff14" />
            </View>
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>FAMILIAR</Text>
              <Text style={styles.cardDescription}>Recibe alertas y cuida a tus seres queridos</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#64748b" />
          </TouchableOpacity>
        </View>

        {/* Footer Actions */}
        <View style={styles.footer}>
          <TouchableOpacity style={[styles.primaryButton, styles.glowRed]} activeOpacity={0.8} onPress={() => router.push('/dashboard')}>
            <Text style={styles.primaryButtonText}>INICIAR SESIÓN</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} activeOpacity={0.6} onPress={() => router.push('/register')}>
            <Text style={styles.secondaryButtonText}>Crear Cuenta</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Decorative Background Element */}
      <View style={styles.bottomBar} />
    </SafeAreaView>
  );
}

// --- ESTILOS ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    paddingTop: 48,
    marginBottom: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  title: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  titlePrimary: {
    color: '#ff3131',
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: 16,
    marginTop: 8,
    textAlign: 'center',
  },
  cardsContainer: {
    flex: 1,
    gap: 16,
    justifyContent: 'center',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 16,
  },
  cardIconBox: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    marginRight: 16,
  },
  iconBoxBlue: {
    backgroundColor: 'rgba(0, 210, 255, 0.2)',
    borderColor: 'rgba(0, 210, 255, 0.3)',
  },
  iconBoxGreen: {
    backgroundColor: 'rgba(57, 255, 20, 0.2)',
    borderColor: 'rgba(57, 255, 20, 0.3)',
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  cardDescription: {
    color: '#94a3b8',
    fontSize: 14,
  },
  footer: {
    paddingBottom: 48,
    gap: 16,
  },
  primaryButton: {
    backgroundColor: '#ff3131',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  secondaryButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  secondaryButtonText: {
    color: '#cbd5e1',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: '#ff3131', // Acento rojo inferior
  },
  // Efectos de resplandor adaptados para móvil
  glowBlue: {
    ...Platform.select({
      ios: { shadowColor: '#00d2ff', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 10 },
      android: { elevation: 5, shadowColor: '#00d2ff' },
    }),
  },
  glowGreen: {
    ...Platform.select({
      ios: { shadowColor: '#39ff14', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 10 },
      android: { elevation: 5, shadowColor: '#39ff14' },
    }),
  },
  glowRed: {
    ...Platform.select({
      ios: { shadowColor: '#ff3131', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 15 },
      android: { elevation: 8, shadowColor: '#ff3131' },
    }),
  },
});