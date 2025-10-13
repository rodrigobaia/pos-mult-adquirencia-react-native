import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';

interface AboutScreenProps {
  onClose: () => void;
}

export const AboutScreen: React.FC<AboutScreenProps> = ({ onClose }) => {
  const { version } = require('../../package.json');

  // Logo oficial da Nebula dentro dos assets do app
  const nebulaLogo = require('../../assets/nebula-sistemas.png');

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Image
          source={require('../../assets/logo-pdv-piloto.png')}
          style={styles.appLogo}
          resizeMode="contain"
        />

        <Text style={styles.title}>PDV Piloto</Text>
        <Text style={styles.subtitle}>Sistema Multi-Adquirência para POS</Text>
        <Text style={styles.version}>Versão {version}</Text>

        <View style={styles.separator} />

        <Text style={styles.sectionTitle}>Fabricante</Text>
        <Image source={nebulaLogo} style={styles.manufacturerLogo} resizeMode="contain" />
        <Text style={styles.manufacturerName}>Nebula Sistemas Ltda</Text>
        <Text style={styles.text}>Betim, Minas Gerais - Brasil</Text>

        <View style={styles.infoBox}>
          <Text style={styles.infoItem}>• Website: https://nebulasistemas.com.br</Text>
          <Text style={styles.infoItem}>• E-mail: suporte@nebulasistemas.com.br</Text>
          <Text style={styles.infoItem}>• Contato: (31) 98440-0157</Text>
        </View>

        <View style={styles.separator} />

        <Text style={styles.sectionTitle}>Arquitetura</Text>
        <View style={styles.infoBox}>
          <Text style={styles.infoItem}>• Arquitetura MonoRepo Multi-Adquirência</Text>
          <Text style={styles.infoItem}>• Camadas: UI (React Native) + Bridges (Kotlin)</Text>
          <Text style={styles.infoItem}>• Providers: Stone implementado; Cielo/PagSeguro prontos</Text>
          <Text style={styles.infoItem}>• Deep Links: Pagamento e Impressão (Stone)</Text>
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.85}>
        <Text style={styles.closeButtonText}>Voltar</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    padding: 20,
    alignItems: 'center',
  },
  appLogo: {
    width: 200,
    height: 90,
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  version: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  separator: {
    height: 1,
    backgroundColor: '#E5E7EB',
    alignSelf: 'stretch',
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  manufacturerLogo: {
    width: 220,
    height: 70,
    marginBottom: 8,
  },
  manufacturerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  text: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 12,
  },
  infoBox: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
    alignSelf: 'stretch',
  },
  infoItem: {
    fontSize: 13,
    color: '#1F2937',
    marginBottom: 6,
  },
  closeButton: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#B89AD9', // roxo sutil para contorno
    margin: 16,
    borderRadius: 12,
  },
  closeButtonText: {
    color: '#662D91',
    fontSize: 16,
    fontWeight: '700',
  },
});


