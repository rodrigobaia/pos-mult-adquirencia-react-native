import React from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';

interface ValueInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  label?: string;
  style?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
}

export const ValueInput: React.FC<ValueInputProps> = ({
  value,
  onChangeText,
  placeholder = 'R$ 0,00',
  label = 'Valor do Pedido',
  style,
  inputStyle,
  labelStyle,
}) => {
  const formatCurrency = (text: string): string => {
    // Remove todos os caracteres não numéricos
    const numericValue = text.replace(/\D/g, '');
    
    // Se estiver vazio, retorna vazio
    if (!numericValue) return '';
    
    // Converte para centavos
    const cents = parseInt(numericValue, 10);
    
    // Converte para reais
    const reais = cents / 100;
    
    // Formata como moeda brasileira
    return reais.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const handleChangeText = (text: string) => {
    const formatted = formatCurrency(text);
    onChangeText(formatted);
  };

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text style={[styles.label, labelStyle]}>
          {label}
        </Text>
      )}
      <TextInput
        style={[styles.input, inputStyle]}
        value={value}
        onChangeText={handleChangeText}
        placeholder={placeholder}
        keyboardType="numeric"
        maxLength={20}
        autoFocus={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  input: {
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    color: '#1F2937',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});
