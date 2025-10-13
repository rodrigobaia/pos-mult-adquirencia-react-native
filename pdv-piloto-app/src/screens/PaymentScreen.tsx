import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Alert,
  ScrollView,
  AppState,
  Image,
  NativeModules,
  DeviceEventEmitter,
} from 'react-native';
import { ValueInput } from '../components/ValueInput';
import { PaymentButton } from '../components/PaymentButton';
import { PaymentResultModal } from '../components/PaymentResultModal';
import { AboutScreen } from './AboutScreen';
import type { PaymentMethod } from '../components/PaymentButton';
import { PaymentProviderFactory, AcquirerType } from '../../packages/payment-core/src/factory/PaymentProviderFactory';
import { PrinterProviderFactory } from '../../packages/payment-core/src/factory/PrinterProviderFactory';
import { PaymentType } from '../../packages/payment-core/src/models/PaymentTypes';
import type { PaymentResult } from '../../packages/payment-core/src/models/PaymentTypes';

const { StoneBridge } = NativeModules;
const { version } = require('../../package.json');

export const PaymentScreen: React.FC = () => {
  const [value, setValue] = useState<string>('');
  const [processing, setProcessing] = useState<boolean>(false);
  const [showResultModal, setShowResultModal] = useState<boolean>(false);
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null);
  const [lastPaymentAmount, setLastPaymentAmount] = useState<number>(0);
  const [lastPaymentType, setLastPaymentType] = useState<string>('');
  const [showAbout, setShowAbout] = useState<boolean>(false);
  const appState = useRef(AppState.currentState);
  const processingTimeRef = useRef<number>(0);
  const confirmationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 🆕 Buscar eventos pendentes do SharedPreferences ao inicializar
  useEffect(() => {
    const checkPendingEvents = async () => {
      try {
        console.log('🔍 Checking for pending payment events from SharedPreferences...');
        const result = await StoneBridge.getPendingPaymentEvent();
        
        if (result.hasPendingEvent) {
          console.log('📥 Found pending event! Emitting:', result.eventData);
          
          // Emitir evento via DeviceEventEmitter
          // Os listeners já registrados do StonePaymentProvider vão capturar
          DeviceEventEmitter.emit('paymentReceived', result.eventData);
          console.log('✅ Pending event emitted successfully');
        } else {
          console.log('✅ No pending payment events');
        }
      } catch (error) {
        console.log('❌ Error checking pending events:', error);
      }
    };
    
    // Verificar após pequeno delay para garantir que listeners estejam prontos
    const timer = setTimeout(() => {
      checkPendingEvents();
    }, 1000); // 1 segundo para garantir que listeners estejam registrados
    
    return () => clearTimeout(timer);
  }, []);

  // Registrar listener para resultado de pagamento
  useEffect(() => {
    const paymentProvider = PaymentProviderFactory.getActive();
    
    const unsubscribe = paymentProvider.onPaymentReceived(async (result) => {
      console.log('Payment result received via Deep Link:', result);
      
      // Cancelar timeout de confirmação manual (recebeu Deep Link)
      if (confirmationTimeoutRef.current) {
        clearTimeout(confirmationTimeoutRef.current);
        confirmationTimeoutRef.current = null;
      }
      
      setProcessing(false);
      setShowConfirmationModal(false); // Fechar confirmação manual se estiver aberta
      setPaymentResult(result);
      setShowResultModal(true);
      
      // Se pagamento foi aprovado, imprimir cupom automaticamente
      if (result.success && result.amount > 0) {
        try {
          await printPaymentReceipt(result);
        } catch (error) {
          console.log('Erro ao imprimir cupom:', error);
          // Não mostrar erro ao usuário, apenas logar
        }
      }
    });
    
    return unsubscribe;
  }, []);

  // Detectar quando app volta do background
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      console.log('AppState changed from', appState.current, 'to', nextAppState);
      
      // Se estava em background e voltou para foreground
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // Se estava processando (voltou do Stone)
        if (processing) {
          console.log('App voltou do background após pagamento');
          
          // Aguardar 5 segundos para ver se recebe Deep Link
          confirmationTimeoutRef.current = setTimeout(() => {
            console.log('Deep Link não recebido em 5s - operação pode ter sido cancelada ou falhou');
            setProcessing(false);
            
            // Criar resultado de FALHA genérico (mais seguro que assumir sucesso)
            const result: PaymentResult = {
              success: false,
              transactionId: '',
              amount: lastPaymentAmount,
              timestamp: new Date(),
              extras: {
                paymentType: lastPaymentType,
                error: 'Operação não confirmada. Verifique no Stone se o pagamento foi processado.',
                note: 'Deep Link não recebido',
              },
            };
            
            setPaymentResult(result);
            setShowResultModal(true);
            
            // NÃO imprimir em caso de falha/cancelamento
          }, 5000);
        }
      }
      
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
      if (confirmationTimeoutRef.current) {
        clearTimeout(confirmationTimeoutRef.current);
      }
    };
  }, [processing, lastPaymentAmount, lastPaymentType]);

  const handleNewSale = () => {
    setShowResultModal(false);
    setPaymentResult(null);
    setValue(''); // Limpar valor para nova venda
    setProcessing(false); // Garantir que não está mais processando
  };


  /**
   * Imprime cupom não fiscal de pagamento
   */
  const printPaymentReceipt = async (result: PaymentResult) => {
    try {
      const printerProvider = PrinterProviderFactory.getActive();
      
      // Configurar callback para resultado da impressão
      if (printerProvider.setPrintResultCallback) {
        printerProvider.setPrintResultCallback((printResult: string) => {
          console.log('Resultado da impressão:', printResult);
          
          if (printResult === 'SUCCESS') {
            console.log('Cupom impresso com sucesso');
          } else {
            console.error('Erro na impressão:', printResult);
          }
        });
      }
      
      // Determinar forma de pagamento
      let paymentMethodText = 'Stone - ';
      if (result.extras?.cardBrand) {
        paymentMethodText += result.extras.cardBrand;
      } else {
        paymentMethodText += 'Cartão';
      }
      
      await printerProvider.printReceipt({
        header: [
          'PDV PILOTO',
          'CUPOM NÃO FISCAL',
        ],
        items: [
          {
            name: 'Venda',
            quantity: 1,
            price: result.amount,
          },
        ],
        subtotal: result.amount,
        total: result.amount,
        paymentMethod: paymentMethodText,
        timestamp: result.timestamp,
        footer: [
          `ITK: ${result.transactionId}`,
          'Obrigado pela preferência!',
        ],
      });
      
      console.log('Deep Link para impressão enviado');
    } catch (error) {
      console.error('Erro ao enviar impressão:', error);
      throw error;
    }
  };

  const handlePayment = async (method: PaymentMethod) => {
    if (!value || value === 'R$ 0,00') {
      Alert.alert('Erro', 'Por favor, informe um valor válido');
      return;
    }

    const numericValue = value.replace(/[^\d]/g, '');
    const amount = parseInt(numericValue, 10) / 100;

    // Mapear método do botão para PaymentType
    const paymentTypeMap: Record<PaymentMethod, PaymentType> = {
      credit: PaymentType.CREDIT,
      debit: PaymentType.DEBIT,
      pix: PaymentType.PIX,
      print: PaymentType.CASH, // Print não é pagamento, mas precisa de um valor
    };

    switch (method) {
      case 'credit':
        await processPayment(amount, PaymentType.CREDIT, 'Crédito');
        break;
        
      case 'debit':
        await processPayment(amount, PaymentType.DEBIT, 'Débito');
        break;
        
      case 'pix':
        Alert.alert(
          'PIX',
          'PIX via Deep Link Stone não é suportado no momento.\n\nEssa funcionalidade será implementada na próxima versão.',
          [{ text: 'OK' }]
        );
        break;
        
      case 'print':
        await handlePrint(amount);
        break;
    }
  };

  const processPayment = async (
    amount: number,
    type: PaymentType,
    typeName: string
  ) => {
    try {
      // Obter provider ativo
      const paymentProvider = PaymentProviderFactory.getActive();
      
      // Verificar disponibilidade
      const available = await paymentProvider.isAvailable();
      
      if (!available) {
        Alert.alert(
          'Erro',
          'App Stone não está instalado neste dispositivo.\n\nPara usar pagamentos reais, instale o app Stone.',
          [{ text: 'OK' }]
        );
        return;
      }
      
      try {
        setProcessing(true);
        processingTimeRef.current = Date.now(); // Salvar quando iniciou
        
        // Salvar dados do pagamento para uso posterior
        setLastPaymentAmount(amount);
        setLastPaymentType(typeName);
        
        // Iniciar pagamento via provider (vai direto para Stone)
        await paymentProvider.requestPayment({
          amount,
          type,
          installments: 1,
        });
        
      } catch (error) {
        setProcessing(false);
        Alert.alert(
          'Erro',
          error instanceof Error ? error.message : 'Falha ao iniciar pagamento'
        );
      }
      
    } catch (error) {
      console.error('Erro no pagamento:', error);
      Alert.alert(
        'Erro',
        error instanceof Error ? error.message : 'Erro desconhecido'
      );
    }
  };

  const handlePrint = async (amount: number) => {
    console.log('handlePrint chamado com amount:', amount);
    
    try {
      setProcessing(true);
      console.log('Obtendo printer provider...');
      const printerProvider = PrinterProviderFactory.getActive();
      console.log('Printer provider obtido:', printerProvider);
      
      // Verificar status da impressora
      console.log('Verificando status da impressora...');
      const status = await printerProvider.getPrinterStatus();
      console.log('Status da impressora:', status);
      
      if (!status.available) {
        setProcessing(false);
        Alert.alert(
          'Erro',
          `Impressora não disponível${status.error ? ': ' + status.error : ''}`,
          [{ text: 'OK' }]
        );
        return;
      }
      
      console.log('Iniciando impressão...');
      
      // Configurar callback para resultado da impressão
      if (printerProvider.setPrintResultCallback) {
        printerProvider.setPrintResultCallback((printResult: string) => {
          console.log('Resultado da impressão (handlePrint):', printResult);
          setProcessing(false);
          
          if (printResult === 'SUCCESS') {
            console.log('Impressão realizada com sucesso');
          } else {
            console.error('Erro na impressão:', printResult);
            Alert.alert('Erro', `Falha na impressão: ${printResult}`);
          }
        });
      }
      
      // Imprimir cupom de teste
      await printerProvider.printReceipt({
        header: [
          'PDV PILOTO',
          'CUPOM DE TESTE',
        ],
        items: [
          {
            name: 'Teste de Impressão',
            quantity: 1,
            price: amount,
          },
        ],
        subtotal: amount,
        total: amount,
        paymentMethod: 'TESTE - Stone',
        timestamp: new Date(),
        footer: [
          'Este é um cupom de teste',
          'Obrigado!',
        ],
      });
      
      console.log('Impressão concluída!');
      setProcessing(false);
      
      Alert.alert(
        'Sucesso',
        'Cupom de teste impresso!\n\nVerifique a impressora.',
        [
          {
            text: 'OK',
            onPress: () => setValue(''),
          },
        ]
      );
      
    } catch (error) {
      setProcessing(false);
      console.error('Erro na impressão:', error);
      Alert.alert(
        'Erro',
        error instanceof Error ? error.message : 'Falha ao imprimir'
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Image
            source={require('../../assets/logo-pdv-piloto.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>PDVFlow Piloto</Text>
          <Text style={styles.subtitle}>Sistema de Pagamento Piloto</Text>
          <Text style={styles.version}>Versão {version}</Text>
          <Text style={styles.aboutLink} onPress={() => setShowAbout(true)}>
            Sobre o aplicativo
          </Text>
          {processing && (
            <Text style={styles.processing}>⏳ Processando no Stone...</Text>
          )}
        </View>

        {/* Input de Valor */}
        <ValueInput
          value={value}
          onChangeText={setValue}
          label="Valor do Pedido"
          placeholder="R$ 0,00"
        />

        {/* Botões de Pagamento */}
        <View style={styles.paymentButtons}>
          <View style={styles.buttonRow}>
            <PaymentButton
              method="credit"
              onPress={() => handlePayment('credit')}
              disabled={processing}
            />
            <PaymentButton
              method="debit"
              onPress={() => handlePayment('debit')}
              disabled={processing}
            />
          </View>
          
          <View style={styles.buttonRow}>
            <PaymentButton
              method="pix"
              onPress={() => handlePayment('pix')}
              disabled={processing}
            />
            <PaymentButton
              method="print"
              onPress={() => handlePayment('print')}
              disabled={processing}
            />
          </View>
        </View>


        {/* Informações essenciais (mantidas sucintas; demais detalhes no Sobre) */}
        <View style={styles.info}>
          <Text style={styles.infoText}>🏦 Adquirente ativa: {PaymentProviderFactory.getActiveAcquirer()}</Text>
          <Text style={styles.infoText}>📱 Deep Link: {PaymentProviderFactory.getActiveAcquirer() === AcquirerType.STONE ? 'stone_payment_scheme://pay-response' : 'lio://payment'}</Text>
        </View>
      </ScrollView>

      {/* Modal de Resultado */}
      {paymentResult && (
        <PaymentResultModal
          visible={showResultModal}
          success={paymentResult.success}
          transactionId={paymentResult.transactionId}
          amount={paymentResult.amount}
          error={paymentResult.extras?.error}
          extras={paymentResult.extras}
          onNewSale={handleNewSale}
        />
      )}

      {/* Sobre - página inteira */}
      {showAbout && (
        <View style={styles.fullscreenOverlay}>
          <AboutScreen onClose={() => setShowAbout(false)} />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  content: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    paddingTop: 20,
  },
  logo: {
    width: 200,
    height: 80,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  version: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
    fontWeight: '400',
  },
  aboutLink: {
    fontSize: 15,
    color: '#662D91',
    marginTop: 8,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  processing: {
    fontSize: 14,
    color: '#F59E0B',
    fontWeight: '600',
    marginTop: 8,
  },
  paymentButtons: {
    marginBottom: 32,
  },
  buttonRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  acquirerSwitch: {
    marginBottom: 16,
  },
  switchButton: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  switchButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  info: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
    textAlign: 'center',
  },
  fullscreenOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
  },
});