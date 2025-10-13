# Integração Cielo LIO - PDV Piloto

Esta documentação contém todas as informações necessárias para integrar o PDV Piloto com a plataforma Cielo LIO.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Requisitos](#requisitos)
- [Configuração Inicial](#configuração-inicial)
- [Formas de Integração](#formas-de-integração)
- [Documentação Detalhada](#documentação-detalhada)
- [Exemplos de Código](#exemplos-de-código)
- [Troubleshooting](#troubleshooting)

## 🎯 Visão Geral

A Cielo LIO (Loja Integrada Online) é uma plataforma de pagamentos que permite integração com aplicativos Android através de duas abordagens principais:

1. **Integração Local (SDK)** - Integração direta com o SDK da Cielo
2. **Integração via Deep Link** - Comunicação via URIs/Intents (Recomendada)

### Vantagens da Integração Cielo

- ✅ **Compatibilidade ampliada** - funciona em novos terminais sem desenvolvimento adicional
- ✅ **Mais robustez e velocidade** - melhor tempo de aprovação nos pagamentos
- ✅ **Smart First** - todas as melhorias e novas funcionalidades na Cielo Smart
- ✅ **Independência de atualizações** - não depende de atualizações do SDK
- ✅ **Menor tamanho do aplicativo** - evita bibliotecas externas
- ✅ **Facilidade de implementação** - integrações via deeplink são mais simples

## ⚠️ Importante: Migração para Cielo Smart

**Atenção**: Estamos em processo de migração para a nova geração de terminais Cielo Smart.

- **Prazo**: Adaptação obrigatória até **15/10/2025**
- **Consequência**: Se não houver adaptação, o terminal pode ficar indisponível
- **Ação**: Utilize a integração via Deeplink e solicite um terminal Smart para testes

## 📋 Requisitos

### Requisitos Técnicos

- **Android**: minSdkVersion 25 (Android 7.1), targetSdkVersion 29+
- **Cielo Smart**: minSdkVersion 24, targetSdkVersion 29
- **Permissões**: INTERNET, ACCESS_FINE_LOCATION, ACCESS_COARSE_LOCATION
- **Credenciais**: Client ID e Access Token da Cielo

### Requisitos de Negócio

- Conta no Portal de Desenvolvedores da Cielo
- Credenciais (Client ID e Access Token)
- Terminal Cielo LIO ou Cielo Smart para testes

## 🚀 Configuração Inicial

### 1. Credenciais

Obtenha suas credenciais no [Portal de Desenvolvedores da Cielo](https://desenvolvedores.cielo.com.br/api-portal/myapps):

- **Client ID**: Identificação de acesso
- **Access Token**: Token de acesso com regras de permissão

**Exemplo de Credenciais:**
```kotlin
val CLIENT_ID = "hs7gR0uI2GbSynitwdGvfcjqAhVGajX9xmEVh4n8CJfQUjkUSN"
val ACCESS_TOKEN = "3b26iD3oEn3EDrqKjLAkc8UF6aTD9awBMHFTDa99NPbu539fh4"
```

### 2. Configuração do Projeto

Adicione as dependências necessárias no `build.gradle`:

```gradle
allprojects {
    repositories {
        mavenLocal()  // Necessário para o SDK da Cielo
        jcenter()
        google()
    }
}

dependencies {
    // SDK Principal da Cielo (opcional para Deep Link)
    implementation 'com.cielo.lio:order-manager:2.7.2'
    
    // Dependências do Datadog (necessárias para o SDK)
    implementation 'com.datadoghq:dd-sdk-android-gradle-plugin:1.14.0'
    implementation 'com.datadoghq:dd-sdk-android-logs:2.16.0'
    implementation 'com.datadoghq:dd-sdk-android-trace:2.16.0'
    implementation 'com.datadoghq:dd-sdk-android-rum:2.16.0'
}
```

### 3. Permissões

Adicione as permissões necessárias no `AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.MANAGE_EXTERNAL_STORAGE" />
```

## 🔗 Formas de Integração

### 1. Integração via Deep Link (Recomendada)

**Vantagens:**
- Independência de atualizações
- Menor tamanho do aplicativo
- Facilidade de implementação
- Compatibilidade com Cielo Smart

**Documentação:** [Integração via Deep Link](./deep-link-integration.md)

### 2. Integração Local (SDK)

**Vantagens:**
- Controle total sobre o fluxo
- Integração mais profunda
- Acesso a funcionalidades avançadas

**Documentação:** [Integração Local (SDK)](./sdk-integration.md)

## 📚 Documentação Detalhada

- [**Integração via Deep Link**](./deep-link-integration.md) - Guia completo para integração via URIs
- [**Integração Local (SDK)**](./sdk-integration.md) - Guia para integração com SDK
- [**Referência da API**](./api-reference.md) - Documentação completa das APIs
- [**Códigos de Pagamento**](./payment-codes.md) - Lista de todos os códigos disponíveis
- [**Estruturas de Dados**](./data-structures.md) - Formatos de requisição e resposta
- [**Funcionalidades de Impressão**](./printing.md) - Guia para impressão de textos e imagens

## 💻 Exemplos de Código

- [**Exemplo de Pagamento**](./examples/payment-example.md)
- [**Exemplo de Cancelamento**](./examples/cancellation-example.md)
- [**Exemplo de Impressão**](./examples/printing-example.md)
- [**Exemplo Completo**](./examples/complete-example.md)

## 🔧 Troubleshooting

### Problemas Comuns

1. **App não retorna após pagamento**
   - Verifique se o `urlCallback` está configurado corretamente
   - Confirme se a Activity de resposta está registrada no AndroidManifest.xml

2. **Erro de credenciais**
   - Verifique se o Client ID e Access Token estão corretos
   - Confirme se as credenciais estão ativas no Portal da Cielo

3. **Pagamento não é processado**
   - Verifique se o JSON está em formato correto
   - Confirme se o valor está em centavos (ex: R$ 10,00 = 1000)

### Logs e Debug

Para debug, verifique os logs do sistema:
```bash
adb logcat | grep -i cielo
adb logcat | grep -i lio
```

## 📞 Suporte

- **Portal de Desenvolvedores**: [desenvolvedores.cielo.com.br](https://desenvolvedores.cielo.com.br)
- **Email Cielo Smart**: atendimentosmart@cielo.com.br
- **Documentação Oficial**: [developercielo.github.io](https://developercielo.github.io/manual/cielo-lio)

## 📄 Licença

Esta documentação é parte do projeto PDV Piloto - Nebula Sistemas.

---

**Última atualização**: Janeiro 2025  
**Versão**: 1.0.0  
**Compatibilidade**: Cielo LIO v1.10.2+, Cielo Smart
