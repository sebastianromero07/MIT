import React, { useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, 
  Alert, Animated, Platform, PermissionsAndroid
} from 'react-native';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useRouter, useNavigation } from 'expo-router'; 
import { DrawerActions } from '@react-navigation/native';
import RNBluetoothClassic, { BluetoothDevice } from 'react-native-bluetooth-classic';

// --- CONFIGURACIÓN DE TU HC-05 ---
// Pon aquí el nombre exacto como aparece en los ajustes de tu celular (suele ser "HC-05")
const DEVICE_NAME_HC05 = "HC-05"; 

export default function DashboardScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  
  // Estados para almacenar los datos reales del sensor
  const [bpm, setBpm] = useState<string | number>("--");
  const [spo2, setSpo2] = useState<string | number>("--");
  const [connectionStatus, setConnectionStatus] = useState("TOCA PARA CONECTAR");
  const [connectedDevice, setConnectedDevice] = useState<BluetoothDevice | null>(null);

  // Bluetooth adapter state + one-time alert flag
  const [bluetoothState, setBluetoothState] = useState<boolean>(false);
  const [bluetoothAlertShown, setBluetoothAlertShown] = useState<boolean>(false);

  // TEMP: replace with real auth/role check in your app
  const isPaciente = true; // mostrar solo a pacientes

  // Animaciones
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const blinkAnim = useRef(new Animated.Value(1)).current;

  // Lógica de alerta si el Bluetooth está apagado
  useEffect(() => {
    const checkBluetoothState = async () => {
      try {
        const isEnabled = await RNBluetoothClassic.isBluetoothEnabled();
        setBluetoothState(isEnabled);

        const shown = (await AsyncStorage.getItem('bluetoothAlertShown')) === '1';
        setBluetoothAlertShown(shown);

        if (isPaciente && !isEnabled && !shown) {
          Alert.alert('Atención', 'Activa el Bluetooth para la sincronización', [
            { text: 'Hecho', onPress: async () => {
              await AsyncStorage.setItem('bluetoothAlertShown', '1');
              setBluetoothAlertShown(true);
            } }
          ], { cancelable: true });
        }
      } catch (error) {
        console.warn('Error chequeando estado del Bluetooth', error);
      }
    };

    checkBluetoothState();
    
    // Opcional: RNBluetoothClassic permite escuchar cambios de estado, pero varía según plataforma
    // Por simplicidad, lo chequeamos al montar el componente.
  }, []);

  // Animaciones de UI y desconexión
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.3, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true })
      ])
    ).start();

    // Limpieza al salir de la pantalla
    return () => {
      if (connectedDevice) {
        connectedDevice.disconnect();
      }
    };
  }, [connectedDevice]);

  const solicitarPermisosAndroid = async () => {
    if (Platform.OS === 'android' && Platform.Version >= 31) {
      await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      ]);
    }
  };

  const iniciarConexion = async () => {
    await solicitarPermisosAndroid();
    conectarHC05();
  };

  const conectarHC05 = async () => {
    setConnectionStatus("BUSCANDO HC-05...");

    try {
      const enabled = await RNBluetoothClassic.isBluetoothEnabled();
      if (!enabled) {
        setConnectionStatus("BLUETOOTH APAGADO");
        return;
      }

      // Obtener lista de dispositivos ya emparejados en el celular
      const bonded = await RNBluetoothClassic.getBondedDevices();
      const hc05Device = bonded.find(d => d.name === DEVICE_NAME_HC05);

      if (!hc05Device) {
        setConnectionStatus("NO EMPAREJADO");
        Alert.alert("Atención", `Primero ve a los ajustes de Bluetooth de tu celular y empareja el dispositivo llamado "${DEVICE_NAME_HC05}".`);
        return;
      }

      setConnectionStatus("CONECTANDO...");
      const connection = await hc05Device.connect();
      
      if (connection) {
        setConnectedDevice(hc05Device);
        setConnectionStatus("CONECTADO");

        // Empezar a leer datos del Arduino
        hc05Device.onDataReceived((data) => {
          const receivedText = data.data.trim(); 
          
          if (receivedText.includes(',')) {
            const [newBpm, newSpo2] = receivedText.split(',');
            if (newBpm) setBpm(newBpm);
            if (newSpo2) setSpo2(newSpo2);

            blinkAnim.setValue(0.5);
            Animated.timing(blinkAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
          }
        });
      } else {
        setConnectionStatus("FALLÓ LA CONEXIÓN");
      }

    } catch (error) {
      console.log("Error de Bluetooth Clásico:", error);
      setConnectionStatus("ERROR (REINTENTAR)");
    }
  };

  const handleSOS = () => {
    Alert.alert(
      "Confirmación de Emergencia",
      "¿Desea activar la alerta SOS de emergencia y notificar a sus contactos?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "ENVIAR ALERTA", 
          style: "destructive",
          onPress: () => Alert.alert("¡Alerta Enviada!", "Se ha notificado a tu red de contactos.") 
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())} style={styles.menuButton}>
            <MaterialIcons name="menu" size={28} color="rgba(255,255,255,0.6)" />
          </TouchableOpacity>
          <View style={styles.statusContainer}>
            <Animated.View style={[
              styles.statusDot, 
              { opacity: pulseAnim },
              connectionStatus !== "CONECTADO" && { backgroundColor: '#ef4444' }
            ]} />
            <Text style={styles.statusText}>MONITOREO ACTIVO</Text>
          </View>
        </View>
        <TouchableOpacity onPress={iniciarConexion}>
          <Text style={styles.connectionText}>
            ESTADO: <Text style={connectionStatus === "CONECTADO" ? styles.connectionTextActive : styles.connectionTextError}>
              {connectionStatus}
            </Text>
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.bpmSection}>
          <View style={styles.bpmHeader}>
            <MaterialCommunityIcons name="heart-pulse" size={40} color="#007fff" />
            <Text style={styles.bpmLabel}>FRECUENCIA</Text>
          </View>
          <View style={styles.bpmValueContainer}>
            <Animated.Text style={[styles.bpmNumber, { opacity: blinkAnim }]}>{bpm}</Animated.Text>
            <Text style={styles.bpmUnit}>BPM</Text>
          </View>
        </View>

        <View style={styles.ecgSection}>
          <View style={styles.ecgHeader}>
            <Text style={styles.ecgLabel}>LIVE CARDIAC SIGNALS</Text>
            <Text style={styles.ecgSpeed}>25mm/s</Text>
          </View>
          <View style={styles.ecgBox}>
            <MaterialCommunityIcons name="waveform" size={80} color="rgba(255,255,255,0.3)" style={{ alignSelf: 'center' }} />
            <Text style={styles.ecgPlaceholderText}>Esperando datos del HC-05...</Text>
          </View>
        </View>

        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <View style={styles.metricRow}>
              <View style={styles.metricIconBox}>
                <MaterialCommunityIcons name="water-percent" size={32} color="#007fff" />
              </View>
              <View>
                <Text style={styles.metricCardLabel}>OXÍGENO SpO2</Text>
                <Text style={styles.metricCardValue}>
                  {spo2 !== "--" ? `${spo2}%` : "--"}
                </Text>
              </View>
            </View>
            <Text style={styles.metricStatus}>{spo2 !== "--" ? 'ÓPTIMO' : 'ESPERANDO'}</Text>
          </View>

          <View style={[styles.metricCard, styles.centeredCard]}>
            <Text style={[
              styles.normalRhythmText, 
              bpm !== "--" && Number(bpm) > 100 && { color: '#ef4444' }
            ]}>
              {bpm !== "--" && Number(bpm) > 100 ? 'ALERTA: TAQUICARDIA' : 'RITMO NORMAL'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.sosButton} onPress={handleSOS} activeOpacity={0.8}>
          <Text style={styles.sosTitle}>SOS MANUAL</Text>
          <Text style={styles.sosSubtitle}>PRESIONE PARA EMERGENCIAS</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0a0a0a' },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: 'rgba(0,0,0,0.4)', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  menuButton: { padding: 4 },
  statusContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#22c55e' },
  statusText: { color: '#22c55e', fontSize: 16, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 },
  connectionText: { color: 'rgba(255,255,255,0.6)', fontSize: 10, fontWeight: 'bold', letterSpacing: 0.5 },
  connectionTextActive: { color: '#22c55e' },
  connectionTextError: { color: '#ef4444' },
  bpmSection: { alignItems: 'center', paddingVertical: 24, marginTop: 16 },
  bpmHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  bpmLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 18, fontWeight: '600', letterSpacing: 2 },
  bpmValueContainer: { flexDirection: 'row', alignItems: 'baseline' },
  bpmNumber: { color: '#007fff', fontSize: 100, fontWeight: '900', includeFontPadding: false },
  bpmUnit: { color: 'rgba(0, 127, 255, 0.8)', fontSize: 32, fontWeight: 'bold', marginLeft: 8 },
  ecgSection: { marginTop: 24, marginBottom: 24 },
  ecgHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingHorizontal: 4, marginBottom: 12 },
  ecgLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: 'bold', letterSpacing: 1.5 },
  ecgSpeed: { color: 'rgba(255,255,255,0.6)', fontSize: 10 },
  ecgBox: { height: 100, backgroundColor: 'rgba(0,0,0,0.6)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  ecgPlaceholderText: { color: 'rgba(255,255,255,0.3)', fontSize: 12, marginTop: 8 },
  metricsGrid: { gap: 16 },
  metricCard: { backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 8, padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  metricRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  metricIconBox: { backgroundColor: 'rgba(0, 127, 255, 0.2)', padding: 12, borderRadius: 30 },
  metricCardLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 'bold', letterSpacing: 1, marginBottom: 4 },
  metricCardValue: { color: '#ffffff', fontSize: 36, fontWeight: '900' },
  metricStatus: { color: '#22c55e', fontSize: 12, fontWeight: 'bold', letterSpacing: 0.5 },
  centeredCard: { justifyContent: 'center' },
  normalRhythmText: { color: '#22c55e', fontSize: 24, fontWeight: '900', letterSpacing: 2 },
  footer: { padding: 24, backgroundColor: 'rgba(0,0,0,0.8)', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' },
  sosButton: { backgroundColor: '#ef4444', paddingVertical: 24, borderRadius: 8, alignItems: 'center', justifyContent: 'center', height: 100, ...Platform.select({ ios: { shadowColor: '#ef4444', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20 }, android: { elevation: 10, shadowColor: '#ef4444' }}) },
  sosTitle: { color: '#ffffff', fontSize: 40, fontWeight: '900', letterSpacing: -1 },
  sosSubtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: 'bold', letterSpacing: 3, marginTop: 4 },
});