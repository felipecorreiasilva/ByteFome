# 🍔 ByteFome

O **ByteFome** é uma plataforma completa de **mini-food** concebida para otimizar o fluxo de pedidos, oferecendo uma ecossistema multicanal robusto para clientes, balcão e gestão interna.

---

## 🚀 Sobre o Arquitetura do Projeto

O projeto adota uma arquitetura descentralizada e moderna, dividida em múltiplos módulos para abranger web, dispositivos móveis e aplicações de desktop:

* **Backend (`/server`):** API em Node.js com Express e PostgreSQL, integrada ao Pix da Efí Bank para pagamentos automatizados.
* **Frontend Web (`/web`):** Aplicação em Next.js (App Router) voltada para o cardápio, checkout e painel administrativo web.
* **Aplicação Mobile (`/mobile`):** App mobile desenvolvido com **Expo** e **React Native** para pedidos rápidos na palma da mão.
* **Aplicação Desktop (`/desktop`):** Solução de desktop em **Electron.js** focada no atendimento de balcão e gestão local de pedidos.

---

## 🛠️ Tecnologias Utilizadas

### **Backend (`/server`)**
* Node.js, Express.js & TypeScript
* PostgreSQL & Prisma/TypeORM
* SDK Oficial da Efí Bank (`sdk-node-apis-efi`) para Pix Dinâmico

### **Frontend & Interfaces (`/web`, `/mobile`, `/desktop`)**
* **Web:** Next.js, Tailwind CSS
* **Mobile:** React Native, Expo CLI
* **Desktop:** Electron.js

---

## 📁 Estrutura do Repositório

```text
ByteFome/
├── server/                 # API Backend (Node.js / Express / PostgreSQL)
│   ├── certs/              # Certificados digitais da API Pix (Efí)
│   ├── database/           # Scripts SQL (schema e seeds)
│   └── src/                # Código-fonte (controllers, models, routes)
├── web/                    # Aplicação Frontend Web (Next.js)
├── mobile/                 # Aplicação Mobile (Expo / React Native)
└── desktop/                # Aplicação Desktop (Electron.js)