# Configurações de Fabricantes por Adquirente

> Configurações de build, keystores e signing configs organizadas por adquirente

**[⬅ Voltar para o README principal](../../../README.md)**

---

## 📋 Índice

1. [Visão Geral](#-visão-geral)
2. [Estrutura Organizacional](#-estrutura-organizacional)
3. [Adquirentes Suportados](#-adquirentes-suportados)
4. [Como Usar](#-como-usar)

---

## 🎯 Visão Geral

Este diretório contém todas as configurações específicas de build Android para diferentes fabricantes de dispositivos POS, organizadas por **adquirente**.

### Por Que Organizar por Adquirente?

- **Separação Clara**: Cada adquirente (Stone, Cielo, PagSeguro) tem seus próprios fabricantes homologados
- **Manutenibilidade**: Fácil identificar e manter configurações de cada adquirente
- **Escalabilidade**: Adicionar novos adquirentes sem misturar configurações
- **Versionamento**: Todas as configurações são versionadas no Git

---

## 📁 Estrutura Organizacional

```
android/manufacturers/
├── README.md                    ← Este arquivo
├── stone/                       ← Adquirente Stone
│   ├── README.md               ← Documentação específica Stone
│   ├── gertec/
│   │   ├── gertec-keystore.properties
│   │   └── gertec-signing-config.gradle
│   ├── ingenico/
│   ├── positivo/
│   ├── sunmi/
│   └── tectoy/
├── cielo/                       ← Adquirente Cielo (futuro)
│   └── README.md
└── pagseguro/                   ← Adquirente PagSeguro (futuro)
    └── README.md
```

### Separação de Responsabilidades

| Diretório | Conteúdo |
|-----------|----------|
| `android/manufacturers/` | ✅ Configurações de build, keystores, signing configs |
| `packages/{adquirente}-sdk/` | ✅ Código TypeScript e Kotlin de cada SDK |
| `packages/payment-core/` | ✅ Interfaces genéricas de pagamento |

---

## 🏢 Adquirentes Suportados

### Stone ✅

- **Pasta**: [`stone/`](stone/)
- **Status**: Implementado
- **Fabricantes**: Gertec, Ingenico, Positivo, Sunmi, Tectoy
- **Documentação**: [stone/README.md](stone/README.md)

### Cielo 🚧

- **Pasta**: `cielo/`
- **Status**: Planejado
- **Fabricantes**: A definir

### PagSeguro 🚧

- **Pasta**: `pagseguro/`
- **Status**: Planejado
- **Fabricantes**: A definir

---

## 🔧 Como Usar

### 1. Aplicar Configurações no Build

No arquivo `android/app/build.gradle`, as configurações são aplicadas assim:

```gradle
// Aplicar configurações de signing do fabricante
apply from: '../manufacturers/stone/gertec/gertec-signing-config.gradle'
```

### 2. Adicionar Novo Fabricante

Para adicionar um novo fabricante à Stone:

1. Criar pasta: `android/manufacturers/stone/novo-fabricante/`
2. Adicionar arquivos:
   - `novo-fabricante-keystore.properties`
   - `novo-fabricante-signing-config.gradle`
3. Atualizar `android/app/build.gradle`
4. Documentar no `stone/README.md`

### 3. Adicionar Nova Adquirente

Para adicionar uma nova adquirente:

1. Criar pasta: `android/manufacturers/nova-adquirente/`
2. Criar `README.md` específico
3. Adicionar fabricantes homologados
4. Criar SDK em `packages/nova-adquirente-sdk/`
5. Documentar neste README

---

## 📚 Referências

- [Documentação Stone](stone/README.md)
- [Documentação do Projeto](../../../README.md)
- [Guia de Desenvolvimento](../../../docs/desenvolvimento/)

---

**Última atualização**: Outubro 2025

