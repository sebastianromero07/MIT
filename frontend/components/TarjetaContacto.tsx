import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function TarjetaContacto({ id, name, role, phone, onPress, installed = false, notify = false, onToggleNotify }: any) {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={onPress}>
      <View style={styles.left}>
        <View style={[styles.avatar, installed ? styles.avatarOnline : styles.avatarOffline]}>
          <MaterialIcons name="person" size={28} color="#64748b" />
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.role}>APLICACIÓN INSTALADA: <Text style={{ color: installed ? '#34d399' : '#fb7185', fontWeight: '700' }}>{installed ? 'SÍ' : 'NO'}</Text></Text>

          {/* Notify row moved below details */}
          <View style={styles.notifyContainer}>
            <Text style={styles.notifyLabel}>Notificar en emergencias críticas</Text>
            <Switch
              value={notify}
              onValueChange={() => onToggleNotify && onToggleNotify(id)}
              thumbColor={notify ? '#007fff' : '#fff'}
              trackColor={{ true: 'rgba(0,127,255,0.3)', false: '#374151' }}
            />
          </View>
        </View>
      </View>

      <View style={styles.right}>
        <TouchableOpacity style={styles.menuBtn} onPress={onPress}>
          <MaterialIcons name="more-vert" size={20} color="#94a3b8" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', backgroundColor: 'rgba(255,255,255,0.03)', padding: 14, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.04)' },
  left: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, flex: 1 },
  avatar: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginRight: 12, marginTop: 2 },
  avatarOnline: { backgroundColor: '#0b1220', borderWidth: 2, borderColor: 'rgba(0,127,255,0.2)' },
  avatarOffline: { backgroundColor: '#0b1220', borderWidth: 2, borderColor: 'rgba(255,255,255,0.06)' },
  info: { flex: 1 },
  name: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
  role: { color: '#94a3b8', fontSize: 12, marginTop: 4 },
  notifyContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.02)' },
  notifyLabel: { color: '#cbd5e1', fontSize: 13, flex: 1, marginRight: 12 },
  right: { width: 40, alignItems: 'flex-end' },
  menuBtn: { padding: 6 },
});
