# 📋 Sistema de Versionamento Centralizado

## 📖 Visão Geral

Este projeto utiliza um sistema de versionamento centralizado através do arquivo `version.properties`, localizado em `android/version.properties`. Este arquivo centraliza a configuração de versão do aplicativo Android, facilitando a manutenção e garantindo consistência entre diferentes builds.

## 📁 Arquivos Envolvidos

### Arquivos Criados/Modificados

1. **`android/version.properties`** (novo)
   - Arquivo principal que contém a versão do aplicativo
   - Deve ser commitado no git (não contém informações sensíveis)

2. **`android/version.properties.example`** (novo)
   - Template de exemplo para referência
   - Pode ser usado como base para novos desenvolvedores

3. **`android/build.gradle`** (modificado)
   - Carrega o arquivo `version.properties` e disponibiliza as variáveis globalmente
   - Segue o mesmo padrão usado para `local.properties`

4. **`android/app/build.gradle`** (modificado)
   - Usa as variáveis centralizadas do `rootProject.ext` em vez de valores hardcoded

## 🔧 Como Funciona

### 1. Estrutura do `version.properties`

```properties
# Versão do aplicativo Android
VERSION_CODE=1
VERSION_NAME=2.0.0

# Versão com sufixo de release (opcional)
# VERSION_NAME_SUFFIX=Release 3
```

### 2. Carregamento no `build.gradle` Raiz

O arquivo `android/build.gradle` carrega o `version.properties` e disponibiliza as variáveis:

```gradle
versionProp = new Properties()
versionFileName = 'version.properties'
if (project.rootProject.file(versionFileName).exists()) {
    versionProp.load(new FileInputStream(rootProject.file(versionFileName)))
    appVersionCode = versionProp.getProperty('VERSION_CODE', '1').toInteger()
    appVersionName = versionProp.getProperty('VERSION_NAME', '1.0.0')
    appVersionNameSuffix = versionProp.getProperty('VERSION_NAME_SUFFIX', '')
}
```

### 3. Uso no `build.gradle` do App

O arquivo `android/app/build.gradle` usa as variáveis centralizadas:

```gradle
defaultConfig {
    versionCode rootProject.ext.appVersionCode
    versionName rootProject.ext.appVersionName + (rootProject.ext.appVersionNameSuffix ? " ${rootProject.ext.appVersionNameSuffix}" : "")
}
```

## 📝 Como Atualizar a Versão

### Atualização Simples

1. Abra o arquivo `android/version.properties`
2. Atualize os valores:
   ```properties
   VERSION_CODE=2          # Incremente este número a cada release
   VERSION_NAME=2.0.1      # Versão semântica (MAJOR.MINOR.PATCH)
   ```
3. Salve o arquivo
4. Rebuild o projeto

### Atualização com Sufixo de Release

Para builds internos ou releases especiais:

```properties
VERSION_CODE=2
VERSION_NAME=2.0.1
VERSION_NAME_SUFFIX=Release 3
```

Isso resultará em: `versionName = "2.0.1 Release 3"`

## 🎯 Vantagens

1. **Centralização**: Uma única fonte de verdade para a versão
2. **Manutenibilidade**: Fácil de atualizar sem editar arquivos Gradle complexos
3. **Consistência**: Garante que todos os builds usem a mesma versão
4. **Flexibilidade**: Suporta sufixos opcionais para releases especiais
5. **Padrão Consistente**: Segue o mesmo padrão do `local.properties`

## ⚠️ Observações Importantes

### Version Code vs Version Name

- **`VERSION_CODE`**: Número inteiro que deve ser incrementado a cada release publicada no Google Play Store. Este é o identificador interno usado pelo Android.
- **`VERSION_NAME`**: String legível exibida aos usuários. Pode seguir versionamento semântico (ex: "2.0.1") ou incluir sufixos.

### Valores Padrão

Se o arquivo `version.properties` não existir, o sistema usará valores padrão:
- `VERSION_CODE = 1`
- `VERSION_NAME = "1.0.0"`
- `VERSION_NAME_SUFFIX = ""`

Um aviso será exibido no console durante o build.

### Sincronização com package.json

Atualmente, o `package.json` tem sua própria versão (`"2.0.0 Release 3"`), que é usada pelo componente `AboutScreen.tsx`. Para manter consistência:

1. **Opção 1**: Manter sincronização manual entre `version.properties` e `package.json`
2. **Opção 2**: Criar um script que sincronize automaticamente (futuro)

## 🔄 Migração de Versões Antigas

Se você tinha versões hardcoded no `build.gradle`, elas foram substituídas pelas variáveis centralizadas. O arquivo `version.properties` foi criado com os valores atuais do projeto.

## 📚 Referências

- [Android Versioning Guide](https://developer.android.com/studio/publish/versioning)
- [Semantic Versioning](https://semver.org/)

---

**Última atualização**: Janeiro 2025

