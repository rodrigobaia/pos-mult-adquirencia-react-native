import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
} from 'react-native';

interface PaymentConfirmationModalProps {
  visible: boolean;
  amount: number;
  paymentType: string;
  onConfirmSuccess: (transactionId: string) => void;
  onConfirmFailed: () => void;
  onCancel: () => void;
}

export const PaymentConfirmationModal: React.FC<PaymentConfirmationModalProps> = ({
  visible,
  amount,
  paymentType,
  onConfirmSuccess,
  onConfirmFailed,
  onCancel,
}) => {
  const handleSuccess = () => {
    // Gerar ID temporário até receber o real via Deep Link
    const tempId = `MANUAL-${Date.now()}`;
    onConfirmSuccess(tempId);
  };

  const handleFailed = () => {
    onConfirmFailed();
  };

  const handleCancel = () => {
    onCancel();
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={handleCancel}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Título */}
          <View style={styles.header}>
            <Text style={styles.title}>Confirmar Pagamento</Text>
            <Text style={styles.subtitle}>
              O pagamento foi aprovado no Stone?
            </Text>
          </View>

          {/* Informações */}
          <View style={styles.infoBox}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Valor:</Text>
              <Text style={styles.infoValue}>
                R$ {amount.toFixed(2).replace('.', ',')}
              </Text>
            </View>
            <View style={styles.separator} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Tipo:</Text>
              <Text style={styles.infoValue}>{paymentType}</Text>
            </View>
          </View>

          {/* Instrução */}
          <View style={styles.warningBox}>
            <Text style={styles.warningIcon}>⚠️</Text>
            <Text style={styles.warningText}>
              Não foi possível confirmar o pagamento automaticamente.
              {'\n\n'}
              Verifique na tela do Stone se foi aprovado ou recusado.
            </Text>
          </View>

          {/* Pergunta */}
          <Text style={styles.question}>O pagamento foi aprovado?</Text>

          {/* Botões Sim/Não */}
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={[styles.button, styles.successButton]}
              onPress={handleSuccess}
              activeOpacity={0.8}>
              <Text style={styles.buttonText}>✓ Sim, Aprovado</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.failedButton]}
              onPress={handleFailed}
              activeOpacity={0.8}>
              <Text style={styles.buttonText}>✕ Não, Recusado</Text>
            </TouchableOpacity>
          </View>
        </View>
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
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 500,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  infoBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '600',
  },
  separator: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 4,
  },
  warningBox: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  warningIcon: {
    fontSize: 24,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: '#92400E',
    fontWeight: '500',
    lineHeight: 20,
  },
  question: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  buttonsContainer: {
    gap: 12,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  successButton: {
    backgroundColor: '#22C55E',
  },
  failedButton: {
    backgroundColor: '#EF4444',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

