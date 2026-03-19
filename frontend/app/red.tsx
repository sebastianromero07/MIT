import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, Alert, TextInput, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import TarjetaContacto from '@/components/TarjetaContacto';

const INITIAL_CONTACTS = [
  { id: '1', name: 'María Gómez', role: 'Familiar', phone: '+34 600 123 456', installed: true, notify: true },
  { id: '2', name: 'Dr. Luis Pérez', role: 'Médico', phone: '+34 600 654 321', installed: true, notify: false },
  { id: '3', name: 'Carlos Ruiz', role: 'Familiar', phone: '+34 600 987 654', installed: false, notify: false },
];

export default function RedScreen() {
  const router = useRouter();
  const [contacts, setContacts] = useState(INITIAL_CONTACTS);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return contacts;
    return contacts.filter(c => c.name.toLowerCase().includes(q) || c.role.toLowerCase().includes(q) || c.phone.includes(q));
  }, [search, contacts]);

  const handleContactAction = (contact: any) => {
    Alert.alert(contact.name, `¿Qué deseas hacer con ${contact.name}?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Llamar', onPress: () => Alert.alert('Llamando', contact.phone) },
      { text: 'Enviar Auxilio', style: 'destructive', onPress: () => Alert.alert('Auxilio', `${contact.name} ha sido notificado.`) },
    ]);
  };

  const toggleNotify = (id: string) => {
    setContacts(prev => prev.map(c => c.id === id ? { ...c, notify: !c.notify } : c));
  };

  const handleAdd = () => {
    Alert.alert('Añadir Familiar', 'Funcionalidad de añadir familiar pendiente (demo).');
  };

  const handleSave = () => {
    Alert.alert('Guardado', 'La configuración de notificaciones se ha guardado.');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={22} color="#cbd5e1" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>TU RED DE CUIDADO</Text>

        <View style={{ width: 36 }} />
      </View>

      {/* Add Contact Card */}
      <View style={styles.addSection}>
        <TouchableOpacity style={styles.addButton} activeOpacity={0.8} onPress={handleAdd}>
          <View style={styles.addIconBox}>
            <MaterialIcons name="add" size={20} color="#007fff" />
          </View>
          <Text style={styles.addText}>AÑADIR FAMILIAR A TU RED</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchWrap}>
        <MaterialIcons name="search" size={18} color="#94a3b8" />
        <TextInput
          placeholder="Buscar por nombre, rol o teléfono"
          placeholderTextColor="#94a3b8"
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}> 
            <MaterialIcons name="close" size={18} color="#94a3b8" />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(i) => i.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TarjetaContacto
            id={item.id}
            name={item.name}
            role={item.role}
            phone={item.phone}
            installed={!!item.installed}
            notify={!!item.notify}
            onPress={() => handleContactAction(item)}
            onToggleNotify={() => toggleNotify(item.id)}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListFooterComponent={<View style={{ height: 140 }} />}
      />

      {/* Footer Save Button */}
      <View style={styles.footerBar} pointerEvents="box-none">
        <TouchableOpacity style={styles.saveButton} activeOpacity={0.85} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Guardar Configuración</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0a0a0a' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)' },
  backButton: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#ffffff', fontSize: 16, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },

  addSection: { padding: 16 },
  addButton: { borderWidth: 2, borderStyle: 'dashed', borderColor: 'rgba(255,255,255,0.12)', paddingVertical: 22, paddingHorizontal: 18, borderRadius: 12, alignItems: 'center', backgroundColor: 'rgba(0,127,255,0.03)' },
  addIconBox: { backgroundColor: 'rgba(0,127,255,0.12)', padding: 12, borderRadius: 999, marginBottom: 10 },
  addText: { color: '#d1d5db', fontSize: 13, fontWeight: '700', letterSpacing: 1 },

  searchWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 16, marginBottom: 12, paddingHorizontal: 12, backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 12, height: 48 },
  searchInput: { flex: 1, color: '#ffffff', paddingHorizontal: 8, fontSize: 15 },

  list: { paddingHorizontal: 16, paddingTop: 6, paddingBottom: 24 },

  footerBar: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: 16, backgroundColor: 'transparent' },
  saveButton: { backgroundColor: '#007fff', paddingVertical: 14, borderRadius: 12, alignItems: 'center', shadowColor: '#007fff', ...Platform.select({ ios: { shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 16 }, android: { elevation: 6 } }) },
  saveButtonText: { color: '#ffffff', fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
});
