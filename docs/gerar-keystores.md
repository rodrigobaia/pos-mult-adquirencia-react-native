# 🔐 Como Gerar Keystores para Produção

**[← Voltar ao README Principal](../README.md)** | **[📚 Visão Geral do Projeto](./visao-geral-projeto.md)** | **[🔧 Scripts de Build](./scripts-build.md)**

> Guia completo para criar keystores e assinar APKs de produção

---

## 📋 Índice

1. [O que é Keystore](#o-que-é-keystore)
2. [Por que Precisamos de Keystores](#por-que-precisamos-de-keystores)
3. [Passo a Passo: Gerar Keystore](#passo-a-passo-gerar-keystore)
4. [Configurar Propriedades](#configurar-propriedades)
5. [Keystores por Fabricante](#keystores-por-fabricante)
6. [Segurança e Backup](#segurança-e-backup)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 O que é Keystore

### Definição

**Keystore** é um arquivo que contém **chaves criptográficas** usadas para **assinar digitalmente** aplicativos Android. É como uma "assinatura digital" que:

- ✅ Prova que você é o desenvolvedor do app
- ✅ Garante que o APK não foi modificado por terceiros
- ✅ Permite atualizações (Google Play só aceita updates com mesma assinatura)
- ✅ Protege contra malware e apps falsos

### Formato

- **Extensão**: `.jks` (Java KeyStore) - padrão recomendado
- **Conteúdo**: Par de chaves (pública e privada)
- **Proteção**: Senha de store + senha de key
- **Validade**: 10.000 dias (~27 anos)

---

## 💡 Por que Precisamos de Keystores

### Builds Debug vs Release

| Característica | Debug | Release |
|----------------|-------|---------|
| **Keystore** | `debug.keystore` (automático) | **Seu keystore personalizado** |
| **Senha** | Padrão conhecida | **Sua senha privada** |
| **Uso** | Desenvolvimento local | **Produção, Google Play** |
| **Segurança** | Baixa | **Alta** |
| **Atualizações** | Não importa | **Mesma assinatura obrigatória** |

### Por Fabricante?

No PDV Piloto, cada fabricante tem seu próprio keystore para:

1. **Isolamento**: Problema em um não afeta outros
2. **Distribuição**: Enviar keystore específico para parceiros
3. **Controle**: Quem tem acesso a qual fabricante
4. **Certificação**: Alguns fabricantes exigem certificados específicos

---

## 🔧 Passo a Passo: Gerar Keystore

### 1. Instalar Keytool

O `keytool` vem com o JDK (Java Development Kit).

**Verificar instalação:**
```bash
keytool -version

# Output esperado:
# keytool version "17.0.X"
```

**Se não tiver:**
- Windows: Instalar JDK 17 de https://adoptium.net/
- Linux: `sudo apt install openjdk-17-jdk`
- Mac: `brew install openjdk@17`

### 2. Criar Keystore para um Fabricante

**Exemplo: Positivo**

```bash
# Navegar até o diretório do fabricante
cd pdv-piloto-app/android/manufacturers/stone/positivo

# Gerar keystore
keytool -genkey -v \
  -keystore positivo-keystore.jks \
  -alias positivo_key \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000

# Preencha as informações solicitadas:
```

### 3. Informações a Preencher

Durante a criação, o keytool pedirá:

```
Digite a senha do armazenamento de chaves:
[Digite uma senha FORTE - ex: MyStr0ng#P@ssw0rd2024!]

Redigite a nova senha:
[Repita a mesma senha]

Qual é o seu nome e sobrenome?
[Digite: Nebula Sistemas]

Qual é o nome da sua unidade organizacional?
[Digite: Desenvolvimento]

Qual é o nome da sua empresa?
[Digite: Nebula Sistemas Ltda]

Qual é o nome da sua cidade ou Localidade?
[Digite: Betim]

Qual é o nome do seu Estado ou Município?
[Digite: MG]

Qual é o código do país de duas letras desta unidade?
[Digite: BR]

CN=Nebula Sistemas, OU=Desenvolvimento, O=Nebula Sistemas Ltda, L=Betim, ST=MG, C=BR Está correto?
[Digite: sim]

Digitando a senha da chave para <positivo_key>
(RETURN se for igual à senha do armazenamento de chaves):
[Pressione ENTER ou digite senha diferente]
```

### 4. Resultado

Você terá criado:
```
android/manufacturers/stone/positivo/
└── positivo-keystore.jks    ← Arquivo gerado (PROTEGER!)
```

⚠️ **IMPORTANTE:** Este arquivo é **SENSÍVEL** e está no `.gitignore`. NÃO versionar no Git!

---

## ⚙️ Configurar Propriedades

### 1. Criar Arquivo de Propriedades

Após gerar o keystore, crie o arquivo de configuração:

**Arquivo:** `android/manufacturers/stone/positivo/positivo-keystore.properties`

```properties
# Positivo Keystore Configuration
storeFile=positivo-keystore.jks
storePassword=MyStr0ng#P@ssw0rd2024!
keyAlias=positivo_key
keyPassword=MyStr0ng#P@ssw0rd2024!
```

⚠️ **ATENÇÃO:** 
- Este arquivo contém **senhas** e está no `.gitignore`
- NÃO commitar no Git!
- Guardar em cofre seguro (1Password, Azure Key Vault, etc)

### 2. Verificar Configuração

```bash
# Listar conteúdo do keystore
keytool -list -v -keystore positivo-keystore.jks

# Digite a senha quando solicitado

# Output esperado:
# Alias name: positivo_key
# Creation date: ...
# Entry type: PrivateKeyEntry
# Certificate chain length: 1
# Certificate[1]:
# Owner: CN=Nebula Sistemas, OU=Desenvolvimento, O=Nebula Sistemas Ltda, ...
# Valid from: ... until: ... (válido por ~27 anos)
```

---

## 🏭 Keystores por Fabricante

### Gerar para Todos os Fabricantes Stone

Execute estes comandos para criar keystores de todos os fabricantes:

#### Gertec

```bash
cd pdv-piloto-app/android/manufacturers/stone/gertec

keytool -genkey -v \
  -keystore gertec-keystore.jks \
  -alias gertec_key \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000

# Criar gertec-keystore.properties
cat > gertec-keystore.properties << EOF
storeFile=gertec-keystore.jks
storePassword=SUA_SENHA_GERTEC
keyAlias=gertec_key
keyPassword=SUA_SENHA_GERTEC
EOF
```

#### Ingenico

```bash
cd pdv-piloto-app/android/manufacturers/stone/ingenico

keytool -genkey -v \
  -keystore ingenico-keystore.jks \
  -alias ingenico_key \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000

# Criar ingenico-keystore.properties
cat > ingenico-keystore.properties << EOF
storeFile=ingenico-keystore.jks
storePassword=SUA_SENHA_INGENICO
keyAlias=ingenico_key
keyPassword=SUA_SENHA_INGENICO
EOF
```

#### Positivo

```bash
cd pdv-piloto-app/android/manufacturers/stone/positivo

keytool -genkey -v \
  -keystore positivo-keystore.jks \
  -alias positivo_key \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000

# Criar positivo-keystore.properties
cat > positivo-keystore.properties << EOF
storeFile=positivo-keystore.jks
storePassword=SUA_SENHA_POSITIVO
keyAlias=positivo_key
keyPassword=SUA_SENHA_POSITIVO
EOF
```

#### Sunmi

```bash
cd pdv-piloto-app/android/manufacturers/stone/sunmi

keytool -genkey -v \
  -keystore sunmi-keystore.jks \
  -alias sunmi_key \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000

# Criar sunmi-keystore.properties
cat > sunmi-keystore.properties << EOF
storeFile=sunmi-keystore.jks
storePassword=SUA_SENHA_SUNMI
keyAlias=sunmi_key
keyPassword=SUA_SENHA_SUNMI
EOF
```

#### Tectoy

```bash
cd pdv-piloto-app/android/manufacturers/stone/tectoy

keytool -genkey -v \
  -keystore tectoy-keystore.jks \
  -alias tectoy_key \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000

# Criar tectoy-keystore.properties
cat > tectoy-keystore.properties << EOF
storeFile=tectoy-keystore.jks
storePassword=SUA_SENHA_TECTOY
keyAlias=tectoy_key
keyPassword=SUA_SENHA_TECTOY
EOF
```

### Estrutura Final

```
android/manufacturers/stone/
├── gertec/
│   ├── gertec-keystore.jks               ← Gerado
│   ├── gertec-keystore.properties        ← Criado
│   └── gertec-signing-config.gradle      (já existe)
│
├── ingenico/
│   ├── ingenico-keystore.jks             ← Gerado
│   ├── ingenico-keystore.properties      ← Criado
│   └── ingenico-signing-config.gradle
│
├── positivo/
│   ├── positivo-keystore.jks             ← Gerado
│   ├── positivo-keystore.properties      ← Criado
│   └── positivo-signing-config.gradle
│
├── sunmi/
│   ├── sunmi-keystore.jks                ← Gerado
│   ├── sunmi-keystore.properties         ← Criado
│   └── sunmi-signing-config.gradle
│
└── tectoy/
    ├── tectoy-keystore.jks               ← Gerado
    ├── tectoy-keystore.properties        ← Criado
    └── tectoy-signing-config.gradle
```

---

## 🔒 Segurança e Backup

### ⚠️ Regras de Ouro

1. **NUNCA commite keystores no Git**
   - ✅ Estão no `.gitignore`
   - ❌ Se commitarem, TODO o histórico Git fica comprometido

2. **NUNCA compartilhe keystores publicamente**
   - ❌ Email
   - ❌ WhatsApp
   - ❌ Slack
   - ✅ Apenas cofres seguros

3. **SEMPRE faça backup**
   - Perder keystore = **impossível atualizar app no Google Play**
   - Terá que criar novo app com novo package name

### 🔐 Onde Guardar Keystores

**Opções Seguras:**

#### 1. Password Manager

```bash
# 1Password, LastPass, Bitwarden
- Upload do arquivo .keystore
- Armazenar senhas
- Compartilhar com equipe autorizada
```

#### 2. Cloud Vault Corporativo

```bash
# Azure Key Vault
az keyvault secret set --vault-name pdv-piloto-vault \
  --name positivo-keystore \
  --file positivo-release.keystore

# AWS Secrets Manager
aws secretsmanager create-secret \
  --name pdv-piloto/positivo-keystore \
  --secret-binary fileb://positivo-release.keystore
```

#### 3. Servidor Seguro Interno

```bash
# Servidor com acesso restrito
scp positivo-release.keystore admin@vault-server:/secure/keystores/
chmod 400 /secure/keystores/positivo-release.keystore
```

### 📋 Template de Backup

Crie um documento seguro com:

```markdown
# PDV Piloto - Keystores Backup

## Positivo
- **Arquivo**: positivo-keystore.jks
- **Localização**: 1Password/Keystores PDV
- **Store Password**: [SENHA]
- **Key Alias**: positivo_key
- **Key Password**: [SENHA]
- **Data Criação**: 12/10/2025
- **Válido até**: 12/10/2052
- **Criado por**: Rodrigo Baia
- **SHA256**: [fingerprint do certificado]

## Gertec
[... repetir para cada fabricante ...]
```

### 🔑 Recuperar Fingerprint SHA256

```bash
keytool -list -v -keystore positivo-keystore.jks | grep SHA256

# Guarde este hash para verificação futura
```

---

## 🚀 Usar Keystores para Build Release

### 1. Verificar Keystores

Antes de buildar, verifique se tudo está configurado:

```bash
# Verificar se keystores existem
ls -la pdv-piloto-app/android/manufacturers/stone/*/*.jks

# Deve mostrar:
# positivo-keystore.jks
# gertec-keystore.jks
# ingenico-keystore.jks
# sunmi-keystore.jks
# tectoy-keystore.jks
```

### 2. Executar Build Release

```bash
# Build um fabricante específico
./scripts/build-stone-release.sh positivo

# Build todos os fabricantes
./scripts/build-stone-release.sh all
```

### 3. Output Esperado

```
════════════════════════════════════════════════════════════════
  PDV Piloto - Build RELEASE (Assinado)
  Adquirente: STONE
  Versão: v1 - 1.0.0
════════════════════════════════════════════════════════════════

ℹ Limpando builds anteriores...
✓ Build limpo
ℹ Preparando diretório de output...

ℹ Building TODOS os fabricantes stone...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Fabricante: POSITIVO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ℹ Verificando keystore para positivo...
✓ Keystore encontrado
ℹ Building positivoRelease...
✓ Build positivo release concluído
✓ APK assinado: pdv-piloto-stone-v1-1.0.0-positivo.apk (45M)
ℹ Verificando assinatura...
✓ Assinatura válida ✓

[... cada fabricante ...]

═══════════════════════════════════════════════════════════════
  APKs Release Assinados
═══════════════════════════════════════════════════════════════

  ▸ pdv-piloto-stone-v1-1.0.0-positivo.apk (45M)

Localização: /path/apks/release
Pronto para produção! ✓
```

### 4. Verificar Assinatura

```bash
# Verificar se APK está assinado corretamente
apksigner verify --verbose apks/release/pdv-piloto-stone-v1-1.0.0-positivo.apk

# Output esperado:
# Verifies
# Verified using v1 scheme (JAR signing): true
# Verified using v2 scheme (APK Signature Scheme v2): true
```

---

## 🔐 Exemplo Completo: Positivo

### Passo 1: Gerar Keystore

```bash
cd /e/09-git-hub-rodrigobaia/pos-mult-adquirencia-react-native/pdv-piloto-app/android/manufacturers/stone/positivo

keytool -genkey -v \
  -keystore positivo-keystore.jks \
  -alias positivo_key \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

**Preencher:**
```
Senha do armazenamento de chaves: P0s1t1v0#2024!PDV
Redigite: P0s1t1v0#2024!PDV

Nome e sobrenome: Nebula Sistemas
Unidade organizacional: Mobile Development
Empresa: Nebula Sistemas Ltda
Cidade: Betim
Estado: MG
País: BR

Confirmar: sim

Senha da chave: [ENTER para usar mesma senha]
```

### Passo 2: Criar Propriedades

```bash
cat > positivo-keystore.properties << 'EOF'
storeFile=positivo-keystore.jks
storePassword=P0s1t1v0#2024!PDV
keyAlias=positivo_key
keyPassword=P0s1t1v0#2024!PDV
EOF
```

### Passo 3: Proteger Arquivo

```bash
# Linux/Mac - apenas owner pode ler
chmod 600 positivo-keystore.properties
chmod 600 positivo-keystore.jks

# Windows - via propriedades do arquivo
# Botão direito → Propriedades → Segurança → Avançado
# Remover "Usuários" e manter apenas você
```

### Passo 4: Fazer Backup

```bash
# Opção 1: Criptografar e guardar
gpg -c positivo-keystore.jks
# Gera: positivo-keystore.jks.gpg (criptografado)
# Guardar em: 1Password, Google Drive criptografado, etc

# Opção 2: Upload para vault
# Azure/AWS/Google Cloud KMS
```

### Passo 5: Build

```bash
cd /e/09-git-hub-rodrigobaia/pos-mult-adquirencia-react-native

./scripts/build-stone-release.sh positivo

# APK assinado gerado em:
# apks/release/pdv-piloto-stone-v1-1.0.0-positivo.apk
```

### Passo 6: Verificar

```bash
# Verificar assinatura
apksigner verify apks/release/pdv-piloto-stone-v1-1.0.0-positivo.apk

# Ver informações do certificado
keytool -printcert -jarfile apks/release/pdv-piloto-stone-v1-1.0.0-positivo.apk

# Ver keystore original
keytool -list -v -keystore positivo-keystore.jks
```

---

## 🛡️ Boas Práticas de Segurança

### ✅ O que FAZER

1. **Senhas fortes**
   ```
   ✅ BOM: MyStr0ng#P@ssw0rd2024!PDV
   ❌ RUIM: 123456, senha123
   ```

2. **Backup em múltiplos locais**
   - 1Password/LastPass
   - Azure Key Vault
   - Servidor seguro interno

3. **Documentar**
   - Guardar informações (alias, senhas, datas)
   - Anotar SHA256 fingerprint
   - Registrar quem criou e quando

4. **Controle de acesso**
   - Apenas pessoas autorizadas
   - Logs de quem acessou
   - Rotação periódica de senhas

### ❌ O que NÃO FAZER

1. **NUNCA versionar no Git**
   ```bash
   ❌ git add positivo-release.keystore
   ❌ git commit -m "Add keystore"
   ```

2. **NUNCA compartilhar por canais inseguros**
   ```bash
   ❌ Email sem criptografia
   ❌ WhatsApp / Telegram
   ❌ Slack / Teams (sem criptografia)
   ❌ Google Drive / Dropbox público
   ```

3. **NUNCA reutilizar senhas**
   ```bash
   ❌ Mesma senha para todos os fabricantes
   ✅ Senha única por fabricante
   ```

4. **NUNCA perder sem backup**
   - Se perder keystore = impossível atualizar app
   - Precisará criar novo app com novo package

---

## 🐛 Troubleshooting

### Erro: "keytool: command not found"

**Causa:** JDK não instalado ou não no PATH

**Solução Windows:**
```bash
# 1. Instalar JDK 17 de https://adoptium.net/
# 2. Adicionar ao PATH:
set PATH=%PATH%;C:\Program Files\Eclipse Adoptium\jdk-17.0.X\bin

# 3. Verificar
keytool -version
```

**Solução Linux:**
```bash
sudo apt install openjdk-17-jdk
keytool -version
```

### Erro: "Keystore was tampered with, or password was incorrect"

**Causa:** Senha incorreta no `*-keystore.properties`

**Solução:**
1. Verificar senha em `positivo-keystore.properties`
2. Testar senha manualmente:
   ```bash
   keytool -list -keystore positivo-release.keystore
   # Digite a senha
   ```

### Erro: "Failed to read key from keystore"

**Causa:** Alias incorreto ou senha da key diferente

**Solução:**
```bash
# Listar aliases no keystore
keytool -list -keystore positivo-release.keystore

# Verificar alias correto
# Deve ser: positivo_key
```

### Esqueci a Senha do Keystore

**Problema:** Não há como recuperar senha de keystore

**Soluções:**

**Se tiver backup:**
```bash
# Restaurar do backup e usar senha documentada
```

**Se NÃO tiver backup:**
```bash
# ❌ Keystore perdido permanentemente
# ⚠️ Precisará:
# 1. Criar novo keystore
# 2. Não poderá atualizar apps existentes no Google Play
# 3. Precisará fazer novo upload como novo app
```

**Por isso: SEMPRE DOCUMENTE E FAÇA BACKUP!**

---

## 📚 Comandos Úteis

### Ver Informações do Keystore

```bash
# Listar aliases
keytool -list -keystore positivo-keystore.jks

# Ver detalhes completos
keytool -list -v -keystore positivo-keystore.jks

# Exportar certificado público
keytool -export -alias positivo_key \
  -keystore positivo-keystore.jks \
  -file positivo.crt

# Ver SHA256 fingerprint
keytool -list -v -keystore positivo-keystore.jks | grep SHA256
```

### Verificar APK Assinado

```bash
# Verificar se está assinado
apksigner verify apks/release/pdv-piloto-stone-v1-1.0.0-positivo.apk

# Ver certificado do APK
keytool -printcert -jarfile apks/release/pdv-piloto-stone-v1-1.0.0-positivo.apk

# Comparar SHA256 do APK com keystore
# (devem ser iguais)
```

### Alterar Senha do Keystore

```bash
# Alterar senha do store
keytool -storepasswd -keystore positivo-keystore.jks

# Alterar senha da key
keytool -keypasswd \
  -alias positivo_key \
  -keystore positivo-keystore.jks
```

---

## ✅ Checklist de Produção

Antes de enviar para produção, verifique:

### Keystores
- [ ] Todos os keystores criados (`*.keystore`)
- [ ] Todas as propriedades configuradas (`*-keystore.properties`)
- [ ] Senhas fortes e únicas
- [ ] Backup feito em local seguro
- [ ] SHA256 fingerprint documentado

### Build
- [ ] Build release executado sem erros
- [ ] APKs gerados em `apks/release/`
- [ ] Nomenclatura correta (com versão)
- [ ] Tamanho adequado (~40-50MB release)

### Assinatura
- [ ] `apksigner verify` passa
- [ ] Certificado válido (não expirado)
- [ ] SHA256 match com keystore
- [ ] Válido por 10.000 dias

### Segurança
- [ ] Keystores NÃO estão no Git
- [ ] Propriedades NÃO estão no Git
- [ ] Backup feito e testado
- [ ] Acesso restrito apenas autorizado

---

## 🎯 Resumo

### Comandos Principais

```bash
# 1. Gerar keystore
keytool -genkey -v \
  -keystore fabricante-keystore.jks \
  -alias fabricante_key \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000

# 2. Criar propriedades
# Editar: fabricante-keystore.properties
# storeFile=fabricante-keystore.jks

# 3. Build release
./scripts/build-stone-release.sh fabricante

# 4. Verificar
apksigner verify apks/release/pdv-piloto-stone-v1-1.0.0-fabricante.apk

# 5. Fazer backup do keystore
# Guardar em local SEGURO
```

### Arquivos Gerados

```
✓ fabricante-keystore.jks            (privado, fazer backup)
✓ fabricante-keystore.properties     (privado, não versionar)
✓ apks/release/pdv-piloto-*.apk      (pronto para produção)
```

---

## 🔗 Navegação

- **[← README Principal](../README.md)** - Voltar ao início
- **[🔧 Scripts de Build](./scripts-build.md)** - Como usar os scripts
- **[🟢 Integração Stone](./integracao-stone.md)** - Integração técnica
- **[📚 Visão Geral](./visao-geral-projeto.md)** - Proposta do projeto

---

## 📞 Suporte

Dúvidas sobre keystores:
- Consulte documentação Android: https://developer.android.com/studio/publish/app-signing
- Leia sobre assinatura de apps: https://source.android.com/docs/security/features/apksigning

---

**Última atualização:** Outubro 2025  
**Versão:** 1.0  

---

**Desenvolvido com ❤️ pela equipe Nebula Sistemas**

