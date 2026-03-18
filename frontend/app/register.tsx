import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView, 
  Platform,
  ScrollView,
  KeyboardAvoidingView
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function RegisterScreen() {
  const router = useRouter();
  const [role, setRole] = useState<'paciente' | 'familiar' | null>(null);

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          
          {/* Top App Bar */}
          <View style={styles.appBar}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <MaterialIcons name="arrow-back" size={28} color="#ffffff" />
            </TouchableOpacity>
            
            <View style={styles.logoContainer}>
              <View style={[styles.logoIconBox, styles.glowRedSmall]}>
                <MaterialIcons name="emergency" size={16} color="#ffffff" />
              </View>
              <Text style={styles.logoText}>VitalSalud</Text>
            </View>
            <View style={{ width: 48 }} /* Spacer to center logo */ />
          </View>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Crear Cuenta</Text>
            <Text style={styles.subtitle}>Acceso a salud de grado crítico</Text>
          </View>

          {/* Registration Form */}
          <View style={styles.formContainer}>
            
            {/* Role Selection */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>TIPO DE CUENTA</Text>
                <MaterialIcons name="manage-accounts" size={16} color="#475569" />
              </View>
              <View style={styles.roleContainer}>
                <TouchableOpacity 
                  style={[styles.roleButton, role === 'paciente' && styles.roleButtonActive]}
                  onPress={() => setRole('paciente')}
                  activeOpacity={0.7}
                >
                  <MaterialIcons name="person" size={20} color={role === 'paciente' ? '#ffffff' : '#94a3b8'} />
                  <Text style={[styles.roleText, role === 'paciente' && styles.roleTextActive]}>PACIENTE</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.roleButton, role === 'familiar' && styles.roleButtonActive]}
                  onPress={() => setRole('familiar')}
                  activeOpacity={0.7}
                >
                  <MaterialIcons name="group" size={20} color={role === 'familiar' ? '#ffffff' : '#94a3b8'} />
                  <Text style={[styles.roleText, role === 'familiar' && styles.roleTextActive]}>FAMILIAR</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Input Fields */}
            <InputBlock label="NOMBRE" icon="person" placeholder="Introduce tu nombre" />
            <InputBlock label="APELLIDOS" icon="badge" placeholder="Introduce tus apellidos" />
            <InputBlock label="CORREO ELECTRÓNICO" icon="mail" placeholder="usuario@vitalsalud.app" keyboardType="email-address" />
            <InputBlock label="CONTRASEÑA" icon="lock" placeholder="••••••••••••" secureTextEntry />

            {/* Register Button */}
            <View style={styles.submitContainer}>
              <TouchableOpacity style={[styles.submitButton, styles.glowRed]} activeOpacity={0.8}>
                <Text style={styles.submitButtonText}>REGISTRARSE</Text>
                <MaterialIcons name="chevron-right" size={24} color="#ffffff" />
              </TouchableOpacity>
              
              <Text style={styles.policyText}>
                Al registrarte, aceptas nuestros <Text style={styles.policyLink}>Términos de Protocolo</Text> y <Text style={styles.policyLink}>Política de Encriptación</Text>.
              </Text>
            </View>
          </View>

          {/* Footer Link */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              ¿Ya tienes cuenta?{' '}
              <Text style={styles.footerLink} onPress={() => router.back()}>
                Iniciar sesión
              </Text>
            </Text>
          </View>

          {/* System Status Bar */}
          <View style={styles.statusBar}>
            <View style={styles.statusLeft}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>SISTEMA SEGURO</Text>
            </View>
            <Text style={styles.statusText}>VITALSALUD v4.0.2-B</Text>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Subcomponente para los inputs para no repetir código
function InputBlock({ label, icon, placeholder, secureTextEntry = false, keyboardType = 'default' }: any) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.inputGroup}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        <MaterialIcons name={icon} size={16} color="#475569" />
      </View>
      <TextInput
        style={[styles.input, isFocused && styles.inputFocused]}
        placeholder={placeholder}
        placeholderTextColor="#334155"
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
    </View>
  );
}

// --- ESTILOS ---
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#000000' },
  scrollContainer: { flexGrow: 1, paddingBottom: 24 },
  
  appBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  backButton: { width: 48, height: 48, justifyContent: 'center', alignItems: 'flex-start' },
  logoContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoIconBox: { width: 32, height: 32, backgroundColor: '#ff3131', borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  logoText: { color: '#ffffff', fontSize: 18, fontWeight: 'bold', letterSpacing: -0.5 },
  
  header: { paddingHorizontal: 24, paddingTop: 32, paddingBottom: 24 },
  title: { color: '#ffffff', fontSize: 36, fontWeight: 'bold' },
  subtitle: { color: '#64748b', fontSize: 12, marginTop: 8, textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: '600' },
  
  formContainer: { paddingHorizontal: 24, gap: 24 },
  inputGroup: { gap: 8 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 4 },
  label: { color: '#cbd5e1', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 },
  
  roleContainer: { flexDirection: 'row', gap: 12 },
  roleButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 56, borderRadius: 12, borderWidth: 1, borderColor: '#1e293b', backgroundColor: 'rgba(15, 23, 42, 0.4)' },
  roleButtonActive: { borderColor: '#ff3131', backgroundColor: 'rgba(255, 49, 49, 0.1)' },
  roleText: { color: '#94a3b8', fontSize: 14, fontWeight: 'bold' },
  roleTextActive: { color: '#ffffff' },
  
  input: { height: 64, borderRadius: 12, borderWidth: 1, borderColor: '#1e293b', backgroundColor: 'rgba(15, 23, 42, 0.4)', color: '#ffffff', paddingHorizontal: 16, fontSize: 18 },
  inputFocused: { borderColor: '#ff3131' },
  
  submitContainer: { paddingTop: 8 },
  submitButton: { backgroundColor: '#ff3131', height: 64, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  submitButtonText: { color: '#ffffff', fontSize: 18, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 },
  policyText: { color: '#475569', fontSize: 10, textAlign: 'center', marginTop: 12, paddingHorizontal: 16 },
  policyLink: { color: '#cbd5e1', textDecorationLine: 'underline' },
  
  footer: { marginTop: 'auto', paddingTop: 48, paddingBottom: 24, alignItems: 'center' },
  footerText: { color: '#64748b', fontSize: 14, fontWeight: '500' },
  footerLink: { color: '#ffffff', fontWeight: 'bold' },
  
  statusBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, opacity: 0.3 },
  statusLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusDot: { width: 6, height: 6, backgroundColor: '#22c55e', borderRadius: 3 },
  statusText: { color: '#64748b', fontSize: 9, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5 },
  
  glowRedSmall: {
    ...Platform.select({
      ios: { shadowColor: '#ff3131', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 8 },
      android: { elevation: 4, shadowColor: '#ff3131' },
    }),
  },
  glowRed: {
    ...Platform.select({
      ios: { shadowColor: '#ff3131', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 15 },
      android: { elevation: 8, shadowColor: '#ff3131' },
    }),
  },
});