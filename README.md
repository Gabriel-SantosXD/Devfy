# Devfy

Devfy é um projeto desenvolvido durante a Imersão Front-End da Alura. O objetivo inicial era criar um site em HTML inspirado no Spotify. No entanto, com a empolgação, decidi expandi-lo para incluir funcionalidades adicionais, como a integração com a API do YouTube, permitindo a criação e o gerenciamento de playlists de músicas

## Funcionalidades

- Busca de músicas utilizando a API do YouTube.
- Criação e gerenciamento de playlists.
- Reprodução de áudio do YouTube diretamente no aplicativo.
- Controle de volume e reprodução (play, pause, próximo, anterior).
- Suporte a emojis nos nomes das playlists.
- Interface responsiva para dispositivos móveis.

## Tecnologias Utilizadas

- React
- Bootstrap
- YouTube Data API v3
- Emoji Picker
- ChatGPT, DeepSeek e Copilot IA para auxílio no desenvolvimento

## Como Executar o Projeto

### Pré-requisitos

- Node.js (versão 16.x ou superior)
- npm (gerenciador de pacotes do Node.js)

### Passos para Executar

1. Clone o repositório:

   ```bash
   git clone https://github.com/Gabriel-SantosXD/devfy.git
   cd devfy
   ```

2. Instale as dependências:

   ```bash
   npm install
   ```

3. Crie um arquivo `api-key.js` na pasta `src` com a sua chave de API do YouTube:

   ```javascript
   // filepath: /src/api-key.js
   export const API_KEY = "Sua chave de API";
   // vá no google cloud console e crie uma chave de API para o youtube data api v3
   ```

4. Inicie o servidor de desenvolvimento:

   ```bash
   npm start
   ```

5. Abra o navegador e acesse `http://localhost:3000`.

### Build para Produção

Para criar uma versão otimizada, execute:

```bash
npm run build
```

Os arquivos de build serão gerados na pasta `build`.

## Estrutura do Projeto

- `src/Home.js`: Componente principal que contém a lógica de busca, reprodução e gerenciamento de playlists.
- `src/api-key.js`: Arquivo para armazenar a chave de API do YouTube.
- `src/serviceWorkerRegistration.js`: Arquivo para registrar o service worker.
- `public/manifest.json`: Arquivo de configuração do PWA.
- `public/index.html`: Arquivo HTML principal.

## Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues e pull requests.

## Licença

Este projeto está licenciado sob a licença CC BY-NC 4.0 license. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## Contato

- GitHub: [Gabriel-SantosXD](https://github.com/Gabriel-SantosXD)
