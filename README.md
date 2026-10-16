# OxeConnect — Plataforma de Recrutamento & Seleção Tech (ATS)

Aplicação full-stack de Recrutamento e Seleção para vagas de tecnologia, composta por um frontend moderno em **Angular 22** (Signals, Angular Material e View Transitions) e um backend em **Spring Boot 3.4 (Java 21)** com persistência em **PostgreSQL 16** via Docker.

---

## Sumário

- [Arquitetura e Tecnologias](#arquitetura-e-tecnologias)
- [Pré-requisitos](#pré-requisitos)
- [Como Rodar o Projeto](#como-rodar-o-projeto)
  - [1. Banco de Dados (PostgreSQL via Docker)](#1-banco-de-dados-postgresql-via-docker)
  - [2. Backend (Spring Boot)](#2-backend-spring-boot)
  - [3. Frontend (Angular)](#3-frontend-angular)
- [Links e Acessos Locais](#links-e-acessos-locais)
- [Principais Endpoints da API REST](#principais-endpoints-da-api-rest)
- [Executando os Testes](#executando-os-testes)
- [Estrutura de Pastas](#estrutura-de-pastas)

---

## Arquitetura e Tecnologias

- **Frontend (`/frontend`):**
  - Angular 22 (`@angular/core`, `@angular/router` com `withViewTransitions`, `@angular/material`, `@angular/cdk`)
  - Gerenciamento de estado reativo com Angular **Signals** + `HttpClient`
- **Backend (`/backend`):**
  - Java 21 LTS + Spring Boot 3.4.3
  - Spring Data JPA / Hibernate 6
  - Jakarta Bean Validation
  - Springdoc OpenAPI (Swagger UI)
  - Carga automática de dados iniciais (`DataSeeder`) com 10 vagas, 100 candidatos, avaliações de skills e histórico de entrevistas com IA
- **Banco de Dados (`/backend/docker-compose.yml`):**
  - PostgreSQL 16 (`postgres:16-alpine`) exposto na porta **`5433`** do host (`localhost:5433/oxeconnect`)

---

## Pré-requisitos

Certifique-se de ter instalado na máquina:

1. **Docker** e **Docker Compose** (para subir o banco PostgreSQL)
2. **Java 21 LTS** (JDK 21 — o projeto já inclui o Maven Wrapper `mvnw` / `mvnw.cmd`, não sendo necessário instalar o Maven globalmente)
3. **Node.js 20+** e **npm** (para rodar o frontend Angular)

---

## Como Rodar o Projeto

### 1. Banco de Dados (PostgreSQL via Docker)

Entre na pasta `backend` e suba o container do PostgreSQL em segundo plano:

```bash
cd backend
docker compose up -d
```

> **Configurações padrão do banco (definidas em `backend/docker-compose.yml` e `backend/src/main/resources/application.yml`):**
> - **Host / Porta:** `localhost:5433`
> - **Database:** `oxeconnect`
> - **Usuário:** `oxeconnect`
> - **Senha:** `oxeconnect123`

---

### 2. Backend (Spring Boot)

Ainda dentro da pasta `backend`, inicie o servidor Spring Boot usando o Maven Wrapper:

**No Windows (PowerShell / CMD):**
```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

**No Linux / macOS:**
```bash
cd backend
./mvnw spring-boot:run
```

Na primeira execução, o `DataSeeder` populará automaticamente o banco PostgreSQL com **10 vagas** e **100 candidatos** (incluindo notas por skill e transcrições de entrevistas com a IA). O servidor ficará disponível em `http://localhost:8080`.

---

### 3. Frontend (Angular)

Em um novo terminal, entre na pasta `frontend`, instale as dependências e inicie o servidor de desenvolvimento:

```bash
cd frontend
npm install
npm start
```

O frontend ficará disponível em `http://localhost:4200/` com reload automático.

---

## Links e Acessos Locais

Com o backend (`:8080`) e o frontend (`:4200`) em execução:

| Página / Recurso | URL Local |
| :--- | :--- |
| **Dashboard Principal (Todas as Vagas)** | http://localhost:4200/ |
| **Detalhes da Vaga e Funil Seletivo (ex.: Vaga #1)** | http://localhost:4200/vagas/1 |
| **Página Pública da Vaga / Portal de Carreiras** | http://localhost:4200/carreiras/vagas/1 |
| **Banco de Talentos Global** | http://localhost:4200/candidatos/talentos |
| **Candidatos Favoritos** | http://localhost:4200/candidatos/favoritos |
| **Pipeline Seletivo (Quadro Kanban)** | http://localhost:4200/processo/pipeline |
| **Relatórios (Funil / Tempo / Origem)** | http://localhost:4200/relatorios/funil |
| **Configurações (Recrutadores / Etapas / Skills / Integrações)** | http://localhost:4200/configuracoes/recrutadores |
| **Swagger UI (Documentação interativa da API)** | http://localhost:8080/swagger-ui.html |
| **OpenAPI Spec (JSON)** | http://localhost:8080/api-docs |

---

## Principais Endpoints da API REST

| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| `GET` | `/api/jobs` | Lista vagas com suporte a filtros opcionais (`search`, `status`, `seniority`, `model`). |
| `GET` | `/api/jobs/stats` | Retorna os indicadores do Dashboard (`activeJobs`, `totalCandidates`, `totalInterviews`, `closedJobs`). |
| `GET` | `/api/jobs/candidates` | Lista todos os candidatos de todas as vagas (Banco de Talentos e Kanban). |
| `GET` | `/api/jobs/{id}` | Busca os detalhes de uma vaga pelo ID. |
| `POST` | `/api/jobs` | Cria uma nova vaga de emprego. |
| `PUT` | `/api/jobs/{id}` | Atualiza os dados cadastrais de uma vaga. |
| `PATCH` | `/api/jobs/{id}/status` | Altera a situação da vaga (`Aberta`, `Em entrevistas`, `Pausada`, `Encerrada`). |
| `DELETE` | `/api/jobs/{id}` | Remove uma vaga. |
| `GET` | `/api/jobs/{id}/candidates` | Lista os candidatos inscritos na vaga ordenados por `score` decrescente. |
| `POST` | `/api/jobs/{id}/candidates` | Registra um novo candidato na vaga e gera seu perfil de avaliação IA. |
| `GET` | `/api/jobs/{jobId}/candidates/{candidateId}/profile` | Retorna as skills avaliadas e o histórico da entrevista com a IA do candidato. |
| `PATCH` | `/api/jobs/{jobId}/candidates/{candidateId}/stage` | Avança (`direction: 1`) ou retrocede (`direction: -1`) o candidato nas etapas do funil. |
| `PATCH` | `/api/jobs/{jobId}/candidates/{candidateId}/favorite` | Alterna a marcação de favorito do candidato. |

---

## Executando os Testes

**Testes de integração do Backend (Spring Boot):**
```powershell
cd backend
.\mvnw.cmd test
```

**Testes unitários do Frontend (Angular / Vitest):**
```bash
cd frontend
npm test
```

---

## Estrutura de Pastas

```text
OxeConnectSandbox/
├── backend/                            # Projeto Backend Spring Boot 3.4 (Java 21)
│   ├── docker-compose.yml              # Container PostgreSQL 16 (porta 5433)
│   ├── mvnw / mvnw.cmd                 # Maven Wrapper
│   ├── pom.xml                         # Dependências Maven
│   └── src/
│       ├── main/
│       │   ├── java/com/oxeconnect/backend/
│       │   │   ├── config/             # CORS e DataSeeder (carga inicial)
│       │   │   ├── common/             # Tratamento global de erros (ProblemDetail)
│       │   │   └── jobs/               # Controller, Service, Repositories, Entities e DTOs
│       │   └── resources/
│       │       └── application.yml     # Configurações de banco e servidor
│       └── test/                       # Testes de integração (MockMvc)
└── frontend/                           # Projeto Frontend Angular 22
    ├── src/
    │   └── app/
    │       ├── careers/                # Página pública da vaga (/carreiras/vagas/:id)
    │       ├── dashboard/              # Listagem principal de vagas, estatísticas e filtros
    │       ├── jobs/                   # Serviço Jobs, detalhe da vaga, modal nova vaga e perfil IA
    │       ├── sections/               # Abas de seções (Banco de Talentos, Kanban, Relatórios, Configs)
    │       └── sidebar/                # Menu de navegação lateral
    ├── angular.json
    └── package.json
```
