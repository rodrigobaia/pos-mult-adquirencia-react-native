# Credenciais Cielo LIO - PDV Piloto

Este documento contém as credenciais de exemplo para integração com a Cielo LIO.

## 🔑 Credenciais de Exemplo

### Client ID
```
hs7gR0uI2GbSynitwdGvfcjqAhVGajX9xmEVh4n8CJfQUjkUSN
```

### Access Token
```
3b26iD3oEn3EDrqKjLAkc8UF6aTD9awBMHFTDa99NPbu539fh4
```

## 💻 Como Usar

### 1. Em Código Kotlin

```kotlin
val CLIENT_ID = "hs7gR0uI2GbSynitwdGvfcjqAhVGajX9xmEVh4n8CJfQUjkUSN"
val ACCESS_TOKEN = "3b26iD3oEn3EDrqKjLAkc8UF6aTD9awBMHFTDa99NPbu539fh4"
```

### 2. Em build.gradle

```gradle
android {
    defaultConfig {
        buildConfigField("String", "CREDENTIALS_CLIENT_ID", "\"hs7gR0uI2GbSynitwdGvfcjqAhVGajX9xmEVh4n8CJfQUjkUSN\"")
        buildConfigField("String", "CREDENTIALS_ACCESS_TOKEN", "\"3b26iD3oEn3EDrqKjLAkc8UF6aTD9awBMHFTDa99NPbu539fh4\"")
    }
}
```

### 3. Em JSON (Deep Link)

```json
{
  "accessToken": "3b26iD3oEn3EDrqKjLAkc8UF6aTD9awBMHFTDa99NPbu539fh4",
  "clientID": "hs7gR0uI2GbSynitwdGvfcjqAhVGajX9xmEVh4n8CJfQUjkUSN"
}
```

## ⚠️ Importante

- Estas são credenciais de **exemplo** para desenvolvimento e testes
- Para produção, use suas próprias credenciais obtidas no Portal de Desenvolvedores da Cielo
- Mantenha as credenciais seguras e não as exponha em repositórios públicos
- As credenciais devem ser configuradas de acordo com o ambiente (desenvolvimento/produção)

## 🔗 Links Úteis

- [Portal de Desenvolvedores da Cielo](https://desenvolvedores.cielo.com.br/api-portal/myapps)
- [Documentação Oficial](https://developercielo.github.io/manual/cielo-lio)
- [Suporte Cielo Smart](mailto:atendimentosmart@cielo.com.br)

---

**Última atualização**: Janeiro 2025  
**Versão**: 1.0.0  
**Compatibilidade**: Cielo LIO v1.10.2+, Cielo Smart
