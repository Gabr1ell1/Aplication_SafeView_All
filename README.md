# SafeView 

📌 React / React Native

- react — 19.1.0
- react-native — 0.81.5

📌 Principais libs do Expo (Verifique se há e se estão corretas)

- expo — ~54.0.23
- expo-dev-client — ~6.0.17
- expo-font — ~14.0.9
- expo-linear-gradient — ~15.0.7
- expo-screen-orientation — ~9.0.7
- expo-secure-store — ~15.0.7
- expo-status-bar — ~3.0.8

📌 React Navigation

- @react-navigation/native — ^7.1.20
- @react-navigation/stack — ^7.6.4


📌 Utilitários React Native

- react-native-gesture-handler — ~2.28.0
- react-native-keyboard-aware-scroll-view — ^0.9.5
- react-native-reanimated — ~4.1.1
- react-native-safe-area-context — ~5.6.0
- react-native-screens — ~4.16.0
- react-native-worklets — 0.5.1

# Development Build

- Utiliaando EAS (Develpment Build).
- É preciso estar logado mo expo.dev!!!
- How to configure a development build | EAS Tutorial - Link: https://youtu.be/uQCE9zl3dXU
- Para construir o app:
eas build --profile development --platform android
- How to create and run a cloud build for Android | EAS Tutorial - Link: https://youtu.be/D612BUtvvl8
- Para rodar o app:
npx expo start

# 1. O que é o Expo.dev?

É o site oficial do Expo, onde você:

- cria uma conta

- envia seu projeto

- gera builds (APK) para instalar no Android

- vê histórico das versões criadas

- Site: expo.dev

# 2. O que é o EAS Build?

EAS (Expo Application Services) é o sistema do Expo que cria o APK.

Funciona assim:

- Você manda o projeto pro EAS

- Ele faz todo o processo de criar o app

- Ele te dá um link pronto pra baixar o APK

Ou seja:

👉 EAS Build = máquina que gera o app pronto para instalar.

# 3. Timeout no EAS Build

- O build demorou demais → pode ser:
- internet lenta no servidor
- passo travado (gradle, pods, metro etc.)
- loop interno
- cache quebrado
- conflitos de dependências (bem comum)

Se o Metro ou o Gradle encontram uma versão inconsistente, eles travam e o EAS mata por timeout.

# Primeira vez usando o EAS?

Eles precisam:

- 1. Fazer login:
expo login

- 2. Inicializar o EAS:
eas build:configure


- E depois rodar:

eas build -p android

# 5. Como instalar o APK no celular

- O Expo entrega um link do tipo:

https://expo.dev/artifacts/xxxxx.apk


É só baixar e instalar.
