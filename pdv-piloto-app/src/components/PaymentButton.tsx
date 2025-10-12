import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';

export type PaymentMethod = 'credit' | 'debit' | 'pix' | 'print';

interface PaymentButtonProps {
  method: PaymentMethod;
  onPress: () => void;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const getButtonConfig = (method: PaymentMethod) => {
  switch (method) {
    case 'credit':
      return {
        title: 'Crédito',
        icon: '💳',
        color: '#2563EB',
        backgroundColor: '#EFF6FF',
      };
    case 'debit':
      return {
        title: 'Débito',
        icon: '💳',
        color: '#059669',
        backgroundColor: '#ECFDF5',
      };
    case 'pix':
      return {
        title: 'PIX',
        icon: '⚡',
        color: '#7C3AED',
        backgroundColor: '#F3E8FF',
      };
    case 'print':
      return {
        title: 'Imprimir',
        icon: '🖨️',
        color: '#DC2626',
        backgroundColor: '#FEF2F2',
      };
    default:
      return {
        title: 'Pagamento',
        icon: '💰',
        color: '#6B7280',
        backgroundColor: '#F9FAFB',
      };
  }
};

export const PaymentButton: React.FC<PaymentButtonProps> = ({
  method,
  onPress,
  disabled = false,
  style,
  textStyle,
}) => {
  const config = getButtonConfig(method);

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: config.backgroundColor,
          borderColor: config.color,
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}>
      <Text style={[styles.icon, { color: config.color }]}>
        {config.icon}
      </Text>
      <Text
        style={[
          styles.text,
          { color: config.color },
          textStyle,
        ]}>
        {config.title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
    marginHorizontal: 4,
  },
  icon: {
    fontSize: 24,
    marginBottom: 4,
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});
