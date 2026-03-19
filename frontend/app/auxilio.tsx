import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function AuxilioScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Auxilio (placeholder)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#000' },
  text: { color: '#fff' }
});