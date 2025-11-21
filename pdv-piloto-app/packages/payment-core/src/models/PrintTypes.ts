/**
 * Item de impressão
 */
export interface PrintItem {
  name: string;
  quantity: number;
  price: number;
  subtotal?: number;
}

/**
 * Dados de comprovante
 */
export interface Receipt {
  /** Cabeçalho (nome estabelecimento, etc) */
  header: string[];
  
  /** Itens do pedido */
  items: PrintItem[];
  
  /** Subtotal */
  subtotal: number;
  
  /** Desconto */
  discount?: number;
  
  /** Taxa de entrega */
  deliveryFee?: number;
  
  /** Total */
  total: number;
  
  /** Forma de pagamento */
  paymentMethod: string;
  
  /** ID da transação */
  transactionId?: string;
  
  /** Nome do cliente */
  customerName?: string;
  
  /** Telefone do cliente */
  customerPhone?: string;
  
  /** Endereço */
  address?: string;
  
  /** Data/hora */
  timestamp: Date;
  
  /** Informações adicionais */
  footer?: string[];
}

/**
 * Status da impressora
 */
export interface PrinterStatus {
  /** Impressora disponível */
  available: boolean;
  
  /** Papel baixo */
  paperLow: boolean;
  
  /** Erro (se houver) */
  error?: string;
}

/**
 * Tipos de fonte para impressão
 */
export enum PrintFont {
  NORMAL = 'normal',
  BOLD = 'bold',
  LARGE = 'large',
  SMALL = 'small',
}

/**
 * Alinhamento do texto
 */
export enum PrintAlignment {
  LEFT = 'left',
  CENTER = 'center',
  RIGHT = 'right',
}