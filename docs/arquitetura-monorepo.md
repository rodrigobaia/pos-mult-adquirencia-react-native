# 🏗️ Arquitetura MonoRepo - Guia Completo

**[← Voltar ao README Principal](../README.md)** | **[📚 Visão Geral do Projeto](./visao-geral-projeto.md)**

> Entenda como e por que o PDV Piloto utiliza arquitetura MonoRepo

---

## 📋 Índice

1. [O que é MonoRepo](#o-que-é-monorepo)
2. [Por que MonoRepo no PDV Piloto](#por-que-monorepo-no-pdv-piloto)
3. [Vantagens e Desvantagens](#vantagens-e-desvantagens)
4. [Estrutura do MonoRepo](#estrutura-do-monorepo)
5. [Packages Implementados](#packages-implementados)
6. [Gerenciamento de Dependências](#gerenciamento-de-dependências)
7. [Boas Práticas](#boas-práticas)
8. [Referências e Estudos](#referências-e-estudos)

---

## 🎯 O que é MonoRepo

### Definição

**MonoRepo (Monolithic Repository)** é uma estratégia de desenvolvimento onde múltiplos projetos, packages ou módulos são armazenados em um **único repositório Git**, ao invés de terem repositórios separados.

### Conceito Visual

```
❌ MultiRepo (Tradicional):
├── repo-stone-sdk/          (Git repo 1)
├── repo-cielo-sdk/          (Git repo 2)
├── repo-pagseguro-sdk/      (Git repo 3)
├── repo-payment-core/       (Git repo 4)
└── repo-pdv-app/            (Git repo 5)

✅ MonoRepo (PDV Piloto):
└── pos-mult-adquirencia-react-native/  (1 único Git repo)
    └── pdv-piloto-app/
        └── packages/
            ├── stone-sdk/
            ├── cielo-sdk/
            ├── pagseguro-sdk/
            ├── payment-core/
            └── shared-*/
```

### Empresas que Usam MonoRepo

| Empresa | Ferramenta | Escala |
|---------|-----------|--------|
| **Google** | Bazel | 2 bilhões de linhas de código |
| **Facebook/Meta** | Buck | Milhões de linhas |
| **Microsoft** | Custom | Windows, Office, VS Code |
| **Twitter/X** | Pants | Toda infraestrutura |
| **Uber** | Bazel | Centenas de serviços |

---

## 💡 Por que MonoRepo no PDV Piloto

### 1. Problema: Múltiplas Adquirentes

Sem MonoRepo, teríamos:

```
stone-sdk/            (repo 1)
├── package.json
└── src/

cielo-sdk/            (repo 2)
├── package.json
└── src/

payment-core/         (repo 3)
├── package.json
└── src/

pdv-app/              (repo 4)
├── package.json
├── node_modules/
│   ├── stone-sdk/    ← precisa publicar no npm
│   ├── cielo-sdk/    ← precisa publicar no npm
│   └── payment-core/ ← precisa publicar no npm
```

**Problemas:**
- ❌ 4 repositórios para clonar
- ❌ 4 lugares para fazer commit
- ❌ Precisa publicar packages no npm/registro privado
- ❌ Versionamento complexo
- ❌ Difícil manter sincronizado
- ❌ Bug fix precisa atualizar em 4 lugares

### 2. Solução: MonoRepo

```
pos-mult-adquirencia-react-native/  (1 único repo)
└── pdv-piloto-app/
    ├── package.json                (app principal)
    ├── packages/
    │   ├── stone-sdk/              ← local, sem npm
    │   ├── cielo-sdk/              ← local, sem npm
    │   ├── payment-core/           ← local, sem npm
    │   └── shared-*/
    └── src/
```

**Benefícios:**
- ✅ 1 único `git clone`
- ✅ 1 único `git commit` para múltiplos packages
- ✅ Packages locais (sem publicar)
- ✅ Versionamento simplificado
- ✅ Sempre sincronizado
- ✅ Refatoração atômica

---

## ⚖️ Vantagens e Desvantagens

### ✅ Vantagens

#### 1. **Visibilidade Total**
```typescript
// Fácil ver como payment-core é usado por stone-sdk
// Tudo no mesmo repo!
packages/
├── payment-core/
│   └── src/interfaces/IPaymentProvider.ts
└── stone-sdk/
    └── typescript/StonePaymentProvider.ts  ← implementa interface
```

#### 2. **Refatoração Atômica**
```bash
# Um único commit muda payment-core E todos os SDKs
git commit -m "feat: add cancelTransaction to all providers"

# Alterações:
packages/payment-core/interfaces/IPaymentProvider.ts
packages/stone-sdk/typescript/StonePaymentProvider.ts
packages/cielo-sdk/typescript/CieloPaymentProvider.ts
```

#### 3. **Compartilhamento de Código**
```typescript
// shared-utils usado por TODOS os SDKs
packages/shared-utils/src/formatters.ts

// Importado facilmente:
import { formatCurrency } from '../../shared-utils/src/formatters';
```

#### 4. **Teste Integrado**
```bash
# Testar mudança em payment-core contra TODOS os SDKs
npm test

# Executa testes de:
- payment-core
- stone-sdk
- cielo-sdk
- app principal
```

#### 5. **Onboarding Simplificado**
```bash
# Novo desenvolvedor:
git clone repo
cd pdv-piloto-app
npm install
npm start

# Pronto! Tem acesso a TUDO
```

### ❌ Desvantagens

#### 1. **Repositório Grande**
- Mais tempo para clonar
- Mais espaço em disco
- Git operations mais lentas

**Mitigação no PDV Piloto:**
```bash
# Clone superficial
git clone --depth 1 repo-url

# Ou sparse checkout (apenas o que precisa)
git sparse-checkout set pdv-piloto-app/packages/stone-sdk
```

#### 2. **Complexidade de Build**
- Todos os packages precisam buildar
- Ordem de build importante
- Cache pode ser problemático

**Mitigação:**
```json
// package.json com scripts organizados
{
  "scripts": {
    "build": "npm run build:core && npm run build:sdks",
    "build:core": "cd packages/payment-core && npm run build",
    "build:sdks": "npm run build --workspaces"
  }
}
```

#### 3. **Permissões Granulares**
- Todo mundo tem acesso a tudo
- Difícil restringir acesso por módulo

**Não é problema para PDV Piloto:**
- Equipe pequena
- Todos precisam ver toda arquitetura

---

## 🗂️ Estrutura do MonoRepo

### Arquitetura de Packages

```
pdv-piloto-app/
├── package.json                    ← Root package (app principal)
├── node_modules/                   ← Dependências compartilhadas
│
├── packages/                       ← MonoRepo packages
│   │
│   ├── payment-core/               ← Package 1: Core/Interfaces
│   │   ├── package.json
│   │   └── src/
│   │       ├── interfaces/
│   │       │   ├── IPaymentProvider.ts
│   │       │   └── IPrinterProvider.ts
│   │       ├── factory/
│   │       │   ├── PaymentProviderFactory.ts
│   │       │   └── PrinterProviderFactory.ts
│   │       └── models/
│   │           ├── PaymentTypes.ts
│   │           └── PrintTypes.ts
│   │
│   ├── stone-sdk/                  ← Package 2: Stone
│   │   ├── package.json
│   │   ├── typescript/
│   │   │   ├── StonePaymentProvider.ts
│   │   │   └── StonePrinterProvider.ts
│   │   └── android/
│   │       ├── payment/
│   │       └── printer/
│   │
│   ├── cielo-sdk/                  ← Package 3: Cielo (futuro)
│   │   ├── package.json
│   │   ├── typescript/
│   │   └── android/
│   │
│   ├── pagseguro-sdk/              ← Package 4: PagSeguro (futuro)
│   ├── shared-ui/                  ← Package 5: Componentes UI
│   └── shared-utils/               ← Package 6: Utilitários
│
├── src/                            ← Código do app principal
│   ├── screens/
│   └── components/
│
└── android/                        ← Configuração Android
    ├── app/
    └── manufacturers/
```

### Dependências entre Packages

```
┌─────────────────────────────────────────────┐
│         App Principal (src/)                │
│         PaymentScreen.tsx                   │
└──────────────┬──────────────────────────────┘
               │ usa
               ▼
┌─────────────────────────────────────────────┐
│    PaymentProviderFactory (payment-core)    │
│    Seleciona qual SDK usar                  │
└──────────────┬──────────────────────────────┘
               │ retorna
        ┌──────┴──────┬──────────┐
        ▼             ▼          ▼
┌──────────────┐ ┌─────────┐ ┌──────────┐
│  Stone SDK   │ │Cielo SDK│ │PagSeguro │
│(implementa)  │ │(futuro) │ │SDK       │
└──────┬───────┘ └─────────┘ └──────────┘
       │
       │ implementa
       ▼
┌─────────────────────────────────────────────┐
│      IPaymentProvider (payment-core)        │
│      Interface que todos implementam        │
└─────────────────────────────────────────────┘
```

---

## 📦 Packages Implementados

### 1. payment-core

**Propósito:** Definir interfaces e abstrações comuns

**Exports:**
```typescript
export { IPaymentProvider } from './interfaces/IPaymentProvider';
export { IPrinterProvider } from './interfaces/IPrinterProvider';
export { PaymentProviderFactory } from './factory/PaymentProviderFactory';
export { PrinterProviderFactory } from './factory/PrinterProviderFactory';
export * from './models/PaymentTypes';
```

**Usado por:**
- stone-sdk
- cielo-sdk (futuro)
- App principal

### 2. stone-sdk

**Propósito:** Implementação Stone específica

**Estrutura:**
```
stone-sdk/
├── typescript/           ← JavaScript/TypeScript
│   ├── StonePaymentProvider.ts
│   └── StonePrinterProvider.ts
└── android/             ← Código nativo
    ├── payment/
    │   └── StoneBridge.kt
    └── printer/
        └── StonePrinterBridge.kt
```

**Implementa:**
- `IPaymentProvider`
- `IPrinterProvider`

### 3. shared-ui (futuro)

**Propósito:** Componentes React reutilizáveis

**Exemplos:**
```typescript
// Botões, modals, inputs compartilhados
export { PaymentButton } from './PaymentButton';
export { ResultModal } from './ResultModal';
export { CurrencyInput } from './CurrencyInput';
```

### 4. shared-utils (futuro)

**Propósito:** Funções utilitárias

**Exemplos:**
```typescript
export const formatCurrency = (value: number) => { ... };
export const formatDate = (date: Date) => { ... };
export const validateCPF = (cpf: string) => { ... };
```

---

## 🔗 Gerenciamento de Dependências

### Como Packages Se Referenciam

#### Método 1: Paths no tsconfig.json

```json
// pdv-piloto-app/tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@payment-core/*": ["packages/payment-core/src/*"],
      "@stone-sdk/*": ["packages/stone-sdk/typescript/*"],
      "@shared-ui/*": ["packages/shared-ui/src/*"]
    }
  }
}
```

**Uso:**
```typescript
// Ao invés de:
import { IPaymentProvider } from '../../packages/payment-core/src/interfaces/IPaymentProvider';

// Pode usar:
import { IPaymentProvider } from '@payment-core/interfaces/IPaymentProvider';
```

#### Método 2: Imports Relativos (atual)

```typescript
// packages/stone-sdk/typescript/StonePaymentProvider.ts
import type { IPaymentProvider } from '../../payment-core/src/interfaces/IPaymentProvider';
```

**Vantagens:**
- ✅ Simples
- ✅ Funciona sem configuração
- ✅ Explícito

**Desvantagens:**
- ⚠️ Paths longos
- ⚠️ Dificulta mover arquivos

---

## 📚 Boas Práticas

### 1. Estrutura Clara de Packages

```
✅ BOM:
packages/
├── payment-core/         (abstração)
├── stone-sdk/           (implementação)
├── cielo-sdk/           (implementação)
└── shared-utils/        (utilitários)

❌ EVITAR:
packages/
├── utils/               (muito genérico)
├── helpers/             (vago)
└── common/              (não descritivo)
```

### 2. Dependências Unidirecionais

```
✅ BOM:
stone-sdk → payment-core
(implementação depende de interface)

❌ EVITAR:
payment-core → stone-sdk
(interface depende de implementação)
```

### 3. Versionamento Interno

```json
// Cada package tem sua versão
packages/payment-core/package.json:
{
  "version": "1.0.0"
}

packages/stone-sdk/package.json:
{
  "version": "1.2.3",
  "dependencies": {
    "payment-core": "^1.0.0"
  }
}
```

### 4. Scripts Compartilhados

```json
// Root package.json
{
  "scripts": {
    "test": "npm run test --workspaces",
    "lint": "npm run lint --workspaces",
    "build": "npm run build --workspaces"
  }
}
```

### 5. Documentação por Package

```
packages/
├── payment-core/
│   ├── README.md        ← Documentação específica
│   └── src/
└── stone-sdk/
    ├── README.md        ← Documentação específica
    └── typescript/
```

---

## 📖 Referências e Estudos

### 📘 Artigos Fundamentais

1. **"Advantages of monorepos"** - Dan Luu
   - URL: https://danluu.com/monorepo/
   - 🌟 Artigo clássico sobre MonoRepo
   - Exemplos de Google, Facebook, Microsoft

2. **"Monorepo Explained"** - NX
   - URL: https://monorepo.tools/
   - 🎯 Comparação de ferramentas
   - Guias práticos

3. **"Why Google Stores Billions of Lines of Code in a Single Repository"**
   - URL: https://research.google/pubs/pub45424/
   - 📄 Paper acadêmico do Google
   - Arquitetura em escala

### 🛠️ Ferramentas MonoRepo

| Ferramenta | Linguagem | Usado por | URL |
|------------|-----------|-----------|-----|
| **NX** | TypeScript | React, Angular | https://nx.dev/ |
| **Turborepo** | Go/TS | Vercel | https://turbo.build/ |
| **Lerna** | JavaScript | Babel, Jest | https://lerna.js.org/ |
| **Bazel** | Python/Java | Google | https://bazel.build/ |
| **Rush** | TypeScript | Microsoft | https://rushjs.io/ |
| **Yarn Workspaces** | JavaScript | - | https://yarnpkg.com/features/workspaces |

### 📚 Livros Recomendados

1. **"Monorepo: What, Why and How"** - Nrwl (criadores do NX)
   - URL: https://go.nrwl.io/monorepo-ebook
   - 📖 eBook gratuito
   - Guia completo

2. **"Software Engineering at Google"** - Winters, Manshreck, Wright
   - Capítulo sobre MonoRepo
   - Práticas do Google
   - ISBN: 978-1492082798

### 🎥 Vídeos e Talks

1. **"Scaling Git (and some back-end problems too)"** - Junio Hamano
   - URL: https://www.youtube.com/watch?v=NXGbWK4M-Zo
   - Git criador fala sobre MonoRepo

2. **"Monorepos: Any Size Fits All"** - Google I/O
   - URL: https://www.youtube.com/watch?v=W71BTkUbdqE
   - Experiência do Google

3. **"Why Google Stores All Code in One Repository"** - Rachel Potvin
   - URL: https://www.youtube.com/watch?v=W71BTkUbdqE
   - Engineering Lead no Google

### 🔗 Documentações Oficiais

1. **NX MonoRepo Documentation**
   - https://nx.dev/concepts/more-concepts/why-monorepos
   - Conceitos e patterns

2. **Turborepo Handbook**
   - https://turbo.build/repo/docs/handbook
   - Guia prático

3. **Lerna Guide**
   - https://github.com/lerna/lerna
   - MonoRepo para npm packages

### 📊 Estudos de Caso

1. **Uber**: "Monorepo at Scale"
   - URL: https://eng.uber.com/go-monorepo-bazel/
   - 50+ serviços, 5000+ microservices

2. **Airbnb**: "Treehouse - Framework for Building Diverse Applications"
   - Migração para MonoRepo
   - React Native + Web

3. **Twitter**: "Monorepo with Pants Build System"
   - URL: https://www.pantsbuild.org/
   - Escala massiva

### 🆚 MonoRepo vs MultiRepo

**Comparação Detalhada:**
- https://github.com/joelparkerhenderson/monorepo-vs-polyrepo
- Prós e contras documentados
- Casos de uso

### 🎓 Cursos Online

1. **"Nx Workspaces" - Frontend Masters**
   - Instrutor: Juri Strumpflohner
   - Hands-on MonoRepo

2. **"Monorepo Course" - egghead.io**
   - URL: https://egghead.io/courses/scale-react-development-with-nx
   - React + NX

---

## 🎯 MonoRepo no PDV Piloto: Decisões de Design

### Por que NÃO usamos Nx/Turborepo?

**Motivo:** Simplicidade

```
PDV Piloto é:
- Projeto médio (5-10 packages)
- Equipe pequena
- React Native (não web multi-framework)
- Foco em devices físicos

Não precisamos:
- Build cache distribuído
- Deploy incremental
- Affected commands complexos
- Graph de dependências visual
```

**Abordagem:** MonoRepo "vanilla"
- ✅ Estrutura manual em `packages/`
- ✅ Imports relativos
- ✅ Scripts npm simples
- ✅ Fácil entender e manter

### Quando Migrar para Ferramenta?

Considere NX/Turborepo quando:
- ✓ 20+ packages
- ✓ Builds lentos (>5min)
- ✓ Equipe 10+ desenvolvedores
- ✓ CI/CD complexo
- ✓ Múltiplos apps (web + mobile + backend)

---

## 💡 Resumo Executivo

### O que é MonoRepo?

Um único repositório Git contendo múltiplos projetos/packages relacionados.

### Por que usamos no PDV Piloto?

1. **Múltiplas adquirentes** (Stone, Cielo, PagSeguro) compartilham código
2. **Refatoração atômica** - mudar interface e todos os SDKs de uma vez
3. **Onboarding rápido** - clone único, setup único
4. **Código compartilhado** - shared-utils, shared-ui
5. **Versionamento simples** - sempre sincronizado

### Quando NÃO usar MonoRepo?

- ❌ Projetos totalmente independentes
- ❌ Equipes isoladas sem comunicação
- ❌ Ciclos de release diferentes
- ❌ Repositórios de 100GB+ (lentidão extrema)

### Próximos Passos

1. 📖 Ler: https://monorepo.tools/
2. 🎥 Assistir: "Why Google Stores All Code in One Repository"
3. 🛠️ Experimentar: Criar package teste em `packages/`
4. 📚 Estudar: NX documentation para escalar no futuro

---

## 🤝 Contribuindo

Melhorias nesta documentação:
1. Adicione estudos de caso relevantes
2. Sugira ferramentas testadas
3. Compartilhe experiências
4. Proponha otimizações

---

**Última atualização:** Outubro 2025  
**Versão:** 1.0  
**Autor:** Equipe Nebula Sistemas

---

## 🔗 Navegação

- **[← README Principal](../README.md)** - Voltar ao início
- **[📚 Visão Geral](./visao-geral-projeto.md)** - Proposta do projeto
- **[🟢 Integração Stone](./integracao-stone.md)** - Implementação Stone
- **[🔌 Adicionar Adquirente](./adicionar-adquirente.md)** - Expandir sistema

---

**Desenvolvido com ❤️ pela equipe Nebula Sistemas**

