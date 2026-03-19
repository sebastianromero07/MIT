import React, { useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  View, Text, StyleSheet, TouchableOpacity, 
  Alert, Animated, Platform, PermissionsAndroid
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useRouter, useNavigation } from 'expo-router'; 
import { DrawerActions } from '@react-navigation/native';
import RNBluetoothClassic, { BluetoothDevice } from 'react-native-bluetooth-classic';

const DEVICE_NAME_BT05 = "Tacho1"; 

export default function DashboardScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  
  // Estados para almacenar los datos reales del sensor
  const [bpm, setBpm] = useState<string | number>("--");
  const [spo2, setSpo2] = useState<string | number>("--");
  const [connectionStatus, setConnectionStatus] = useState("TOCA PARA CONECTAR");
  const [connectedDevice, setConnectedDevice] = useState<BluetoothDevice | null>(null);
  
  const [bluetoothState, setBluetoothState] = useState<boolean>(false);
  const [bluetoothAlertShown, setBluetoothAlertShown] = useState<boolean>(false);

  // Theme state (light/dark)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

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

        // Cargar preferencia de tema
        const savedTheme = await AsyncStorage.getItem('themeMode');
        if (savedTheme !== null) {
          setIsDarkMode(savedTheme === 'dark');
        }
      } catch (error) {
        console.warn('Error chequeando estado del Bluetooth', error);
      }
    };

    checkBluetoothState();
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
    setConnectionStatus("BUSCANDO...");

    try {
      const enabled = await RNBluetoothClassic.isBluetoothEnabled();
      if (!enabled) {
        setConnectionStatus("BT APAGADO");
        Alert.alert('Bluetooth apagado', 'Activa Bluetooth y presiona Conectar.', [{ text: 'OK' }]);
        return;
      }      

      const bonded = await RNBluetoothClassic.getBondedDevices();
      const hc05Device = bonded.find(d => d.name === DEVICE_NAME_BT05 || d.address === DEVICE_NAME_BT05);

      if (!hc05Device) {
        setConnectionStatus("NO EMPAREJADO");
        Alert.alert("Atención", `Empareja el dispositivo "${DEVICE_NAME_BT05}" en los ajustes de Bluetooth.`);
        return;
      }

      setConnectionStatus("CONECTANDO...");
      const connection = await RNBluetoothClassic.connectToDevice(hc05Device.address || hc05Device.id);

      if (connection && (connection as any).isConnected !== false) {
        setConnectedDevice(connection);
        setConnectionStatus("CONECTADO");        

        connection.onDataReceived && connection.onDataReceived((data: any) => {
          try {
            const receivedText = (data?.data || '').toString().trim();
            const separator = receivedText.includes(',') ? ',' : ' ';
            
            if (receivedText.includes(',') || receivedText.includes(' ')) {
              const parts = receivedText.split(separator).map((s: string) => s.trim());
              const newBpm = parts[0];
              const newSpo2 = parts[1];
              
              if (newBpm && !isNaN(Number(newBpm))) setBpm(Number(newBpm));
              if (newSpo2 && !isNaN(Number(newSpo2))) setSpo2(Number(newSpo2));
              
              blinkAnim.setValue(0.5);
              Animated.timing(blinkAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
            }
          } catch (e) {
            console.warn('Parseo dato HC-05:', e);
          }
        });
      } else {
        setConnectionStatus("FALLÓ LA CONEXIÓN");
        Alert.alert('Error', 'No se pudo conectar. Reintentar?', [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Reintentar', onPress: conectarHC05 }
        ]);
      }

    } catch (error) {
      console.log("Error de Bluetooth Clásico:", error);
      setConnectionStatus("ERROR (REINTENTAR)");
      Alert.alert('Error Bluetooth', String(error), [{ text: 'Reintentar', onPress: conectarHC05 }, { text: 'Cerrar', style: 'cancel' }]);
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

  const toggleTheme = async () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    try {
      await AsyncStorage.setItem('themeMode', newTheme ? 'dark' : 'light');
    } catch (error) {
      console.warn('Error guardando preferencia de tema:', error);
    }
  };

  // --- VARIABLES DE COLOR DINÁMICAS ---
  const bgColor = isDarkMode ? '#0a0a0a' : '#f0f4f8';
  const textColor = isDarkMode ? '#ffffff' : '#1f2937';
  const textMuted = isDarkMode ? 'rgba(255,255,255,0.6)' : '#6b7280';
  const cardBg = isDarkMode ? 'rgba(255,255,255,0.05)' : '#ffffff';
  const borderColor = isDarkMode ? 'rgba(255,255,255,0.1)' : '#e5e7eb';
  const headerBg = isDarkMode ? 'rgba(0,0,0,0.4)' : '#ffffff';

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: bgColor }]}>
      
      {/* HEADER CORREGIDO */}
      <View style={[styles.header, { backgroundColor: headerBg, borderBottomColor: borderColor }]}>
        
        {/* Lado Izquierdo: Menú */}
        <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())} style={styles.iconButton}>
          <MaterialIcons name="menu" size={28} color={textMuted} />
        </TouchableOpacity>
        
        {/* Centro: Estado del Bluetooth y Monitoreo */}
        <View style={styles.headerCenter}>
           <View style={styles.statusContainer}>
            <Animated.View style={[
              styles.statusDot, 
              { opacity: pulseAnim },
              connectionStatus !== "CONECTADO" && { backgroundColor: '#ef4444' }
            ]} />
            <Text style={styles.statusText} numberOfLines={1} adjustsFontSizeToFit>MONITOREO ACTIVO</Text>
          </View>
          <TouchableOpacity onPress={iniciarConexion}>
            <Text style={[styles.connectionText, { color: textMuted }]} numberOfLines={1} adjustsFontSizeToFit>
              ESTADO: <Text style={connectionStatus === "CONECTADO" ? styles.connectionTextActive : styles.connectionTextError}>
                {connectionStatus}
              </Text>
            </Text>
          </TouchableOpacity>
        </View>

        {/* Lado Derecho: Tema */}
        <TouchableOpacity onPress={toggleTheme} style={styles.iconButton}>
            <MaterialIcons 
              name={isDarkMode ? "wb-sunny" : "nights-stay"} 
              size={26} 
              color={isDarkMode ? "#FFD700" : "#4F46E5"} 
            />
        </TouchableOpacity>

      </View>

      {/* CONTENIDO PRINCIPAL */}
      <View style={styles.content}>
        
        {/* FRECUENCIA */}
        <View style={styles.bpmSection}>
          <View style={styles.bpmHeader}>
            <MaterialCommunityIcons name="heart-pulse" size={40} color="#007fff" />
            <Text style={[styles.bpmLabel, { color: textMuted }]}>FRECUENCIA</Text>
          </View>
          <View style={styles.bpmValueContainer}>
            <Animated.Text style={[styles.bpmNumber, { opacity: blinkAnim, color: '#007fff' }]}>{bpm}</Animated.Text>
            <Text style={styles.bpmUnit}>BPM</Text>
          </View>
        </View>

        {/* ECG PLACEHOLDER */}
        <View style={styles.ecgSection}>
          <View style={styles.ecgHeader}>
            <Text style={[styles.ecgLabel, { color: textMuted }]}>LIVE CARDIAC SIGNALS</Text>
            <Text style={[styles.ecgSpeed, { color: textMuted }]}>25mm/s</Text>
          </View>
          <View style={[styles.ecgBox, { backgroundColor: isDarkMode ? 'rgba(0,0,0,0.6)' : '#e5e7eb', borderColor: borderColor }]}>
            <MaterialCommunityIcons name="waveform" size={80} color={isDarkMode ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.1)"} style={{ alignSelf: 'center' }} />
            <Text style={[styles.ecgPlaceholderText, { color: textMuted }]}>Esperando datos del HC-05...</Text>
          </View>
        </View>

        {/* MÉTRICAS SECUNDARIAS */}
        <View style={styles.metricsGrid}>
          <View style={[styles.metricCard, { backgroundColor: cardBg, borderColor: borderColor }]}>
            <View style={styles.metricRow}>
              <View style={styles.metricIconBox}>
                <MaterialCommunityIcons name="water-percent" size={32} color="#007fff" />
              </View>
              <View>
                <Text style={[styles.metricCardLabel, { color: textMuted }]}>OXÍGENO SpO2</Text>
                <Text style={[styles.metricCardValue, { color: textColor }]}>
                  {spo2 !== "--" ? `${spo2}%` : "--"}
                </Text>
              </View>
            </View>
            <Text style={styles.metricStatus}>{spo2 !== "--" ? 'ÓPTIMO' : 'ESPERANDO'}</Text>
          </View>

          <View style={[styles.metricCard, styles.centeredCard, { backgroundColor: cardBg, borderColor: borderColor }]}>
            <Text style={[
              styles.normalRhythmText, 
              bpm !== "--" && Number(bpm) > 100 && { color: '#ef4444' }
            ]}>
              {bpm !== "--" && Number(bpm) > 100 ? 'ALERTA: TAQUICARDIA' : 'RITMO NORMAL'}
            </Text>
          </View>
        </View>
      </View>

      {/* BOTÓN SOS */}
      <View style={[styles.footer, { backgroundColor: isDarkMode ? 'rgba(0,0,0,0.8)' : '#ffffff', borderTopColor: borderColor }]}>
        <TouchableOpacity style={styles.sosButton} onPress={handleSOS} activeOpacity={0.8}>
          <Text style={styles.sosTitle}>SOS MANUAL</Text>
          <Text style={styles.sosSubtitle}>PRESIONE PARA EMERGENCIAS</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 16 },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 16, 
    paddingVertical: 12,
    borderBottomWidth: 1 
  },
  iconButton: { width: 40, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1, alignItems: 'center', paddingHorizontal: 5 },
  statusContainer: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#22c55e' },
  statusText: { color: '#22c55e', fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5 }, 
  connectionText: { fontSize: 9, fontWeight: 'bold', letterSpacing: 0.5, textAlign: 'center' },
  connectionTextActive: { color: '#22c55e' },
  connectionTextError: { color: '#ef4444' },
  
  bpmSection: { alignItems: 'center', paddingVertical: 16, marginTop: 8 },
  bpmHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 4 },
  bpmLabel: { fontSize: 18, fontWeight: '600', letterSpacing: 2 },
  bpmValueContainer: { flexDirection: 'row', alignItems: 'baseline' },
  bpmNumber: { fontSize: 100, fontWeight: '900', includeFontPadding: false },
  bpmUnit: { color: 'rgba(0, 127, 255, 0.8)', fontSize: 32, fontWeight: 'bold', marginLeft: 8 },
  
  ecgSection: { marginTop: 16, marginBottom: 24 },
  ecgHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingHorizontal: 4, marginBottom: 8 },
  ecgLabel: { fontSize: 12, fontWeight: 'bold', letterSpacing: 1.5 },
  ecgSpeed: { fontSize: 10 },
  ecgBox: { height: 90, borderWidth: 1, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  ecgPlaceholderText: { fontSize: 12, marginTop: 4 },
  
  metricsGrid: { gap: 12 },
  metricCard: { borderWidth: 1, borderRadius: 12, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  metricRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  metricIconBox: { backgroundColor: 'rgba(0, 127, 255, 0.15)', padding: 12, borderRadius: 30 },
  metricCardLabel: { fontSize: 12, fontWeight: 'bold', letterSpacing: 1, marginBottom: 4 },
  metricCardValue: { fontSize: 36, fontWeight: '900' },
  metricStatus: { color: '#22c55e', fontSize: 12, fontWeight: 'bold', letterSpacing: 0.5 },
  centeredCard: { justifyContent: 'center', paddingVertical: 20 },
  normalRhythmText: { color: '#22c55e', fontSize: 22, fontWeight: '900', letterSpacing: 2 },
  
  footer: { padding: 20, borderTopWidth: 1 },
  sosButton: { 
    backgroundColor: '#ef4444', 
    paddingVertical: 20, 
    borderRadius: 12, 
    alignItems: 'center', 
    justifyContent: 'center', 
    height: 90, 
    ...Platform.select({ 
      ios: { shadowColor: '#ef4444', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 15 }, 
      android: { elevation: 8, shadowColor: '#ef4444' }
    }) 
  },
  sosTitle: { color: '#ffffff', fontSize: 36, fontWeight: '900', letterSpacing: -1 },
  sosSubtitle: { color: 'rgba(255,255,255,0.9)', fontSize: 12, fontWeight: 'bold', letterSpacing: 2, marginTop: 2 },
});