# Fabricantes Cielo LIO

## 📱 **Dispositivos Cielo LIO Disponíveis**

### **Ingenico**
- **Modelos**: L300 (LIO V3), DX8000
- **Sistema**: Android 7.1 (L300), Android 10 (DX8000)
- **Características**: 
  - L300: 5" AMOLED, 1GB RAM, 8GB storage
  - DX8000: 5.5" AMOLED, 1GB RAM, 8GB storage, Dual Chip

### **Positivo**
- **Modelos**: L400
- **Sistema**: Android 11
- **Características**: 
  - L400: 6.5" TFT IPS, 2GB RAM, 32GB storage, Dual Chip

## 🔧 **Configuração de Keystores**

Cada fabricante possui suas próprias credenciais de assinatura:

```
cielo/
├── ingenico/
│   ├── ingenico-keystore.jks
│   ├── ingenico-keystore.properties
│   └── ingenico-signing-config.gradle
└── positivo/
    ├── positivo-keystore.jks
    ├── positivo-keystore.properties
    └── positivo-signing-config.gradle
```

## 📋 **Flavors Disponíveis**

- `cielo-ingenico`: APK para dispositivos Cielo LIO Ingenico
- `cielo-positivo`: APK para dispositivos Cielo LIO Positivo

## 🚀 **Build Commands**

```bash
# Build para Cielo Ingenico
./scripts/build-by-acquirer.sh cielo ingenico debug
./scripts/build-by-acquirer.sh cielo ingenico release

# Build para Cielo Positivo
./scripts/build-by-acquirer.sh cielo positivo debug
./scripts/build-by-acquirer.sh cielo positivo release
```

## ⚠️ **Importante**

- **Migração Cielo Smart**: Até 15/10/2025
- **Deep Link**: Método recomendado de integração
- **Compatibilidade**: Android 7.1+ (L300), Android 10+ (DX8000), Android 11+ (L400)

---

**Última atualização**: Janeiro 2025  
**Versão**: 1.0.0  
**Compatibilidade**: Cielo LIO v1.10.2+, Cielo Smart
