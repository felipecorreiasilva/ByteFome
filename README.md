# 🍔 ByteFome

O **ByteFome** é uma plataforma completa de **mini-food** concebida para otimizar o fluxo de pedidos, oferecendo um ecossistema multicanal robusto para clientes, balcão e gestão interna.

---

## 🚀 Sobre a Arquitetura do Projeto

O projeto adota uma arquitetura descentralizada e moderna, dividida em múltiplos módulos para abranger web, dispositivos móveis e aplicações de desktop:

- **Backend (`/server`):** API em Node.js com Express e PostgreSQL (SQL puro via `pg`), integrada ao Pix da Efí Bank para pagamentos automatizados.
- **Frontend Web (`/web`):** Aplicação em Next.js (App Router) voltada para o cardápio, checkout e painel administrativo web.
- **Aplicação Mobile (`/mobile`):** App mobile desenvolvido com **Expo** e **React Native** para pedidos rápidos na palma da mão.
- **Aplicação Desktop (`/desktop`):** Solução de desktop em **Electron.js** focada no atendimento de balcão e gestão local de pedidos.

---

## 🛠️ Tecnologias Utilizadas

### **Backend (`/server`)**
- Node.js, Express.js & TypeScript
- PostgreSQL (driver `pg` com queries SQL puras)
- SDK Oficial da Efí Bank (`sdk-node-apis-efi`) para Pix Dinâmico
- Multer (para gerenciamento de upload de imagens)

### **Frontend & Interfaces (`/web`, `/mobile`, `/desktop`)**
- **Web:** Next.js (App Router), Tailwind CSS, Axios, React Icons
- **Mobile:** React Native, Expo CLI
- **Desktop:** Electron.js

---

## 📁 Estrutura do Repositório

```text
ByteFome/
├── server/                 # API Backend (Node.js / Express / PostgreSQL)
│   ├── certs/              # Certificados digitais da API Pix (Efí Bank)
│   ├── database/           # Scripts SQL (schema.sql e seeds.sql)
│   ├── src/                # Código-fonte (config, controllers, models, routes, middlewares)
│   └── uploads/            # Armazenamento local de imagens do cardápio
├── web/                    # Aplicação Frontend Web (Next.js)
│   ├── public/             # Imagens estáticas e favicons
│   └── src/                # Código-fonte (app, components, context, services, types)
├── mobile/                 # Aplicação Mobile (Expo / React Native)
└── desktop/                # Aplicação Desktop (Electron.js)

⚙️ Como Executar o Projeto Localmente
Pré-requisitos:
- **Node.js** (v18 ou superior) 
- **PostgreSQL** rodando localmente ou via Docker
- **Expo Go** instalado no seu dispositivo móvel (opcional, para testes do app mobile)

1. Clonar o repositório

git clone [https://github.com/teu-utilizador/ByteFome.git](https://github.com/teu-utilizador/ByteFome.git)
cd ByteFome

2. Configurar e Iniciar o Backend (/server)
1.  Entre na pasta do servidor:
cd server
npm install
3. Crie o arquivo .env baseado nas suas credenciais (banco de dados, JWT e chaves da Efí Bank).
4. Execute o script de criação de tabelas e inserção de dados no PostgreSQL utilizando os arquivos da pasta database/ (schema.sql e seeds.sql).
5. Inicie o servidor em modo de desenvolvimento:
npm run dev

3. Configurar e Iniciar as Aplicações de Interface
🌐 Frontend Web (/web)
npm install
npm run dev
Acesse a aplicação no navegador através de http://localhost:3000

📱 Aplicação Mobile (/mobile)
npm install
npx expo start
Escaneie o QR Code exibido no terminal utilizando o app Expo Go no seu telemóvel.

🖥️ Aplicação Desktop (/desktop)
npm install
npm run start

💳 Funcionalidades Principais
- **Cardápio Digital Multicanal:** Sincronizado em tempo real entre Web, Mobile e Desktop.

- **Checkout com Pix Dinâmico:** Integração nativa com a API Pix da Efí Bank, gerando QR Code instantâneo (Base64) e código Copia e Cola com polling automatizado de status.

- **Gestão de Pedidos:** Acompanhamento do fluxo de mini-foods na cozinha e no balcão em tempo real.


