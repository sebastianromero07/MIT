import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Drawer } from 'expo-router/drawer';
import { MaterialIcons } from '@expo/vector-icons';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';

// --- COMPONENTE PERSONALIZADO DEL MENÚ LATERAL ---
// Este componente dibuja el interior de la barra lateral (la foto, el nombre, cerrar sesión, etc.)
function CustomDrawerContent(props: any) {
  const { state, navigation } = props;
  const activeRouteName = state?.routeNames?.[state.index];

  // desired order / labels for menu
  const MENU_ITEMS = [
    { name: 'dashboard', label: 'Inicio', icon: 'dashboard' },
    { name: 'red', label: 'Contactos', icon: 'group' },
    // add more items here if you later create matching screens
  ];

  return (
    <View style={styles.drawerContainer}>
      <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 0 }}>
        {/* Drawer Header */}
        <View style={styles.drawerHeader}>
          <View style={styles.logoArea}>
            <View style={styles.logoIconBox}>
              <MaterialIcons name="emergency" size={20} color="#ffffff" />
            </View>
            <Text style={styles.logoText}>VitalSalud</Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.closeDrawer()}
            style={styles.closeButton}
            accessibilityLabel="Cerrar menú">
            <MaterialIcons name="close" size={20} color="#cbd5e1" />
          </TouchableOpacity>
        </View>

        {/* Profile */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <MaterialIcons name="person" size={40} color="#64748b" />
          </View>
          <View>
            <Text style={styles.userName}>Alex Rivera</Text>
            <Text style={styles.userRole}>Miembro Premium</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Navigation Links (custom rendering so we can match the design) */}
        <View style={styles.navSection}>
          {MENU_ITEMS.map((item) => {
            if (!state.routeNames.includes(item.name)) return null;
            const isActive = activeRouteName === item.name;

            return (
              <TouchableOpacity
                key={item.name}
                style={[styles.navItem, isActive && styles.navItemActive]}
                onPress={() => navigation.navigate(item.name)}
                activeOpacity={0.8}
              >
                <MaterialIcons name={item.icon as any} size={22} color={isActive ? '#ffffff' : '#cbd5e1'} />
                <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>{item.label}</Text>
              </TouchableOpacity>
            );
          })}

          {/* Example of a non-navigation link (placeholder for analytics/plans) */}
          <TouchableOpacity style={styles.navItemPlaceholder} onPress={() => { /* placeholder action */ }} activeOpacity={0.8}>
            <MaterialIcons name="analytics" size={22} color="#cbd5e1" />
            <Text style={styles.navLabel}>Estadísticas</Text>
          </TouchableOpacity>

        </View>
      </DrawerContentScrollView>

      {/* Bottom Action */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.logoutButton} onPress={() => navigation.navigate('index') }>
          <MaterialIcons name="logout" size={20} color="#ef4444" />
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// --- CONFIGURACIÓN PRINCIPAL DEL LAYOUT ---
export default function Layout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={{
          headerShown: false, // Ocultamos el header por defecto
          drawerStyle: {
            backgroundColor: '#080808',
            width: 320,
          },
          drawerActiveBackgroundColor: 'rgba(255, 49, 49, 0.15)',
          drawerActiveTintColor: '#ffffff',
          drawerInactiveTintColor: '#94a3b8',
          drawerLabelStyle: {
            marginLeft: -16,
            fontSize: 16,
            fontWeight: '600',
          },
          // make drawer overlay and behavior match an overlaying sidebar
          drawerType: 'front',
          overlayColor: 'rgba(2,6,23,0.6)'
        }}
      >
        {/* --- PANTALLAS DEL DRAWER --- */}
        <Drawer.Screen
          name="dashboard" // Nombre del archivo (app/dashboard.tsx)
          options={{
            drawerLabel: 'Inicio',
            title: 'Inicio',
            drawerIcon: ({ color }) => <MaterialIcons name="dashboard" size={24} color={color} />,
          }}
        />
        <Drawer.Screen
          name="red" // Nombre del archivo (app/red.tsx) - CREAREMOS ESTE DESPUÉS
          options={{
            drawerLabel: 'Tu Red de Cuidado',
            title: 'Contactos',
            drawerIcon: ({ color }) => <MaterialIcons name="group" size={24} color={color} />,
          }}
        />

        {/* --- PANTALLAS OCULTAS DEL MENÚ (pero que existen en la app) --- */}
        <Drawer.Screen
          name="index" // Pantalla de bienvenida
          options={{
            drawerItemStyle: { display: 'none' }, // Oculta del menú lateral
            swipeEnabled: false, // Evita abrir el menú deslizando en esta pantalla
          }}
        />
        <Drawer.Screen
          name="register" // Pantalla de registro
          options={{
            drawerItemStyle: { display: 'none' },
            swipeEnabled: false,
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}

// --- ESTILOS DEL DRAWER ---
const styles = StyleSheet.create({
  drawerContainer: { flex: 1, backgroundColor: '#0a0a0a' },
  drawerHeader: { padding: 24, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)', paddingTop: 60, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  logoArea: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logoIconBox: { width: 36, height: 36, backgroundColor: '#ff3131', borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  logoText: { color: '#ffffff', fontSize: 20, fontWeight: 'bold' },
  closeButton: { padding: 8, borderRadius: 10, backgroundColor: 'transparent' },

  profileSection: { padding: 24, flexDirection: 'row', alignItems: 'center', gap: 16 },
  avatarContainer: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#1e293b', borderWidth: 2, borderColor: 'rgba(255, 49, 49, 0.4)', justifyContent: 'center', alignItems: 'center' },
  userName: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' },
  userRole: { color: '#94a3b8', fontSize: 14 },

  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.05)', marginHorizontal: 24, marginBottom: 16 },
  navSection: { paddingHorizontal: 12 },
  navItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 12, marginVertical: 4 },
  navItemActive: { backgroundColor: 'rgba(255,49,49,0.12)', borderColor: 'rgba(255,49,49,0.24)', borderWidth: 1 },
  navLabel: { color: '#cbd5e1', fontSize: 16, fontWeight: '600' },
  navLabelActive: { color: '#ffffff' },
  navItemPlaceholder: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 12, marginVertical: 4, opacity: 0.9 },

  footer: { padding: 24, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' },
  logoutButton: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  logoutText: { color: '#ef4444', fontSize: 16, fontWeight: '600' },
});