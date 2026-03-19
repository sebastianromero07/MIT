import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function AlertScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Alertas (placeholder)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#000' },
  text: { color: '#fff' }
});