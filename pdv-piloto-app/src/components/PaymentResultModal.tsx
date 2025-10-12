import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
} from 'react-native';

interface PaymentResultModalProps {
  visible: boolean;
  success: boolean;
  transactionId: string;
  amount: number;
  error?: string;
  onNewSale: () => void;
}

export const PaymentResultModal: React.FC<PaymentResultModalProps> = ({
  visible,
  success,
  transactionId,
  amount,
  error,
  onNewSale,
}) => {
  const scaleAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start();
    } else {
      scaleAnim.setValue(0);
    }
  }, [visible, scaleAnim]);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onNewSale}>
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.container,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}>
          {/* Ícone de Status */}
          <View
            style={[
              styles.iconContainer,
              {
                backgroundColor: success
                  ? 'rgba(34, 197, 94, 0.1)'
                  : 'rgba(239, 68, 68, 0.1)',
              },
            ]}>
            <Text style={styles.icon}>
              {success ? '✓' : '✕'}
            </Text>
          </View>

          {/* Título */}
          <Text style={styles.title}>
            {success ? 'Pagamento Aprovado!' : 'Pagamento Recusado'}
          </Text>

          {/* Checklist de Tarefas (apenas para sucesso) */}
          {success ? (
            <View style={styles.checklistContainer}>
              <View style={styles.checklistItem}>
                <Text style={styles.checkIcon}>✓</Text>
                <Text style={styles.checkText}>Pagamento processado</Text>
              </View>

              <View style={styles.checklistItem}>
                <Text style={styles.checkIcon}>✓</Text>
                <Text style={styles.checkText}>Cupom será impresso</Text>
              </View>

              <View style={styles.checklistItem}>
                <Text style={styles.checkIcon}>✓</Text>
                <Text style={styles.checkText}>Transação: {transactionId.substring(0, 15)}...</Text>
              </View>

              <View style={styles.checklistItem}>
                <Text style={styles.checkIcon}>✓</Text>
                <Text style={styles.checkText}>
                  Valor: R$ {amount.toFixed(2).replace('.', ',')}
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>
                {error || 'Operação não foi concluída'}
              </Text>
              <Text style={styles.errorHint}>
                Valor tentado: R$ {amount.toFixed(2).replace('.', ',')}
              </Text>
            </View>
          )}

          {/* Botão OK */}
          <TouchableOpacity
            style={[
              styles.button,
              {
                backgroundColor: success ? '#22C55E' : '#EF4444',
              },
            ]}
            onPress={onNewSale}
            activeOpacity={0.8}>
            <Text style={styles.buttonText}>
              OK
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    width: '100%',
    maxWidth: 500,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  icon: {
    fontSize: 60,
    fontWeight: 'bold',
    color: '#22C55E',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 24,
    textAlign: 'center',
  },
  checklistContainer: {
    width: '100%',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    gap: 16,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkIcon: {
    fontSize: 24,
    color: '#22C55E',
    fontWeight: 'bold',
  },
  checkText: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
    flex: 1,
  },
  errorContainer: {
    width: '100%',
    backgroundColor: '#FEE2E2',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  errorText: {
    fontSize: 16,
    color: '#991B1B',
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  errorHint: {
    fontSize: 14,
    color: '#7F1D1D',
    textAlign: 'center',
  },
  button: {
    width: '100%',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

