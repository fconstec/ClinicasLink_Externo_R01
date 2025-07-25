# CONTEXT.md – ClínicasLink

Este projeto é uma aplicação chamada **ClínicasLink**, desenvolvida com **React + TypeScript** no frontend e **Node.js (Express) + TypeScript** no backend. A proposta é oferecer uma plataforma para gerenciamento de clínicas, com funcionalidades como agendamento, cadastro de pacientes, prontuário médico, administração de serviços, profissionais, avaliações, notificações e estoque.

---

## 📁 Estrutura de Pastas

### Frontend (`/frontend/src`)

- Arquivos principais:
  - `App.tsx`, `index.tsx`, `App.css`, `index.css`

- Pastas e funções:
  - `@types/`: Tipagens adicionais (ex: `html2pdf.js`)
  - `api/`: Comunicação com backend (`clinicApi.ts`)
  - `components/`: Componentes funcionais da interface:
    - Páginas: `HomePage`, `LoginPage`, `RegisterPage`, `ClinicRegisterPage`
    - Navegação e interface: `Header`, `ScrollToTop`, `NotificationSystem`
    - Clínicas: `ClinicDetails`, `ClinicAdminPanel`, `ReviewSystem`, `GalleryModal`
    - Agendamentos: `AppointmentBooking`, `ScheduleForm`, `SuperCalendar`, `WeeklyClinicCalendar`
    - Pacientes: `MedicalHistory`, `PatientDetails`, `UserProfile`
    - Modais: `AppointmentsFormModal`, `ProfessionalFormModal`, `ServiceFormModal`, `ScheduleFormModal_old`
    - Gerenciadores administrativos (`ClinicAdminPanel_Managers/`):
      - `AppointmentsManager`, `PatientsManager`, `ProfessionalsManager`, `ServicesManager`, `StockManager`, `Dashboard`, `SettingsManager`
      - Subpasta `PatientForm/`: `PatientMainDataForm`, `PatientEvolutionForm`, `PatientProceduresForm`, `PatientFullView`
    - Autenticação: `LoginClinica`, `LoginPaciente`, `LoginTypeSelection`, `AreaUsuario`
    - Outros: `PaymentSystem`, `ChatSystem`, `ModalPortal`, `CustomToolbar`
    - `ui/`: Componentes reutilizáveis (`button.tsx`, `card.tsx`, `input.tsx`, `table.tsx`)
  - `lib/`: Utilitários auxiliares (`utils.ts`)
  - `pages/`: Página de calendário (`CalendarPage.tsx`)
  - `styles/`: Estilos globais (`calendar.css`)

---

### Backend (`/backend/src`)

- Arquivos principais:
  - `index.ts`: Inicialização do servidor Express
  - `db.ts`: Conexão com banco de dados (ex: Knex ou Supabase)

- Pastas:
  - `controllers/`: Lógica de negócios (ex: `clinicSettingsController.ts`)
  - `routes/`: Endpoints da API:
    - `appointments.ts`, `patients.ts`, `professionals.ts`, `services.ts`, `stock.ts`, `clinicSettings.ts`
  - `middleware/`: Middlewares personalizados (ex: `uploadMiddleware.ts`)

---

### Migrations (`/backend/migrations/`)

Scripts para criação de tabelas com Knex:

- `001_create_professionals.js`
- `002_create_patients.js`
- `003_create_services.js`
- `004_create_appointments.js`
- `005_create_stock.js`
- `006_create_clinicSettings.js`
- `20250609231904_add_timestamps_to_patients.js`

---

## 🔧 Regras de Funcionamento

- Visitantes podem navegar pelas clínicas sem login.
- Login é obrigatório para agendar, avaliar, visualizar histórico.
- Clínicas autenticadas podem:
  - Gerenciar profissionais, serviços, pacientes, estoque e agendamentos.
- Pacientes podem acessar seus dados, prontuário, evolução e procedimentos.
- O botão de **“Avaliar”** é exibido somente quando o agendamento tiver status **"concluído"**.

---

## 💡 Como usar com IA (Copilot / ChatGPT)

Este arquivo fornece contexto global do projeto para ferramentas como **Copilot Chat** e **ChatGPT** entenderem a estrutura e lógica da aplicação.

> **Recomendações:**
> - Mantenha este arquivo aberto no VS Code ao usar o Copilot Chat.
> - Use este conteúdo como referência ao pedir sugestões/refatorações no ChatGPT.
> - Serve como guia para ajudar em correções, testes, arquitetura e novos módulos.

---

## ✅ Pronto para escalar

O ClínicasLink está preparado para expansão com:
- Integração de pagamento (ex: Stripe, Pix, etc.)
- Geração de relatórios (PDF via `html2pdf.js`)
- Notificações (e-mail, push)
- Dashboard analítico
- Histórico médico completo

---

