# Descrição Completa das Funcionalidades - Gestão Escolar

Este documento detalha todas as funcionalidades, regras de negócio e interações do sistema de gestão de recursos escolares "SchoolZenith".

## 1. Conceito Geral e Arquitetura

O sistema é uma **Single-Page Application (SPA)** construída com Next.js e configurada para exportação estática (`output: 'export'`). Isso significa que a aplicação não possui um backend no sentido tradicional (Node.js, etc.). Toda a lógica dinâmica, interações com banco de dados e autenticação ocorrem diretamente no navegador do cliente, que se comunica com os serviços do **Firebase Realtime Database**.

- **Frontend:** Next.js, React, TypeScript, Tailwind CSS, ShadCN UI
- **Backend (Base de Dados):** Firebase Realtime Database
- **Hospedagem Alvo:** GitHub Pages

## 2. Papéis de Usuário

Existem dois níveis de permissão no sistema:

- **Usuário (`Usuário`):** Papel padrão. Pode ver recursos, criar e gerenciar suas próprias reservas.
- **Administrador (`Admin`):** Papel com privilégios elevados. Pode gerenciar usuários, recursos, configurações do sistema e todas as reservas.

## 3. Páginas Públicas (Autenticação)

Estas páginas estão acessíveis para qualquer visitante.

### 3.1. Página de Login (`/`)
- **Objetivo:** Permitir que usuários existentes acessem o sistema.
- **Campos:**
    - Email
    - Senha
- **Funcionalidades:**
    - Validação de campos (email válido e senha não vazia).
    - Ao submeter, o sistema consulta o Firebase Realtime Database para encontrar um usuário com o email correspondente.
    - Se o usuário for encontrado, compara a senha fornecida com a senha armazenada (em texto plano, para fins deste projeto).
    - Em caso de sucesso, armazena o ID do usuário no `localStorage` do navegador para manter a sessão e redireciona para `/dashboard`.
    - Em caso de falha (email não encontrado ou senha incorreta), exibe um toast de erro.
    - **Link "Esqueceu a senha?":** Redireciona para a página `/forgot-password`.
    - **Link "Cadastre-se":** Redireciona para a página `/register`.

### 3.2. Página de Cadastro (`/register`)
- **Objetivo:** Permitir que novos usuários criem uma conta.
- **Campos:**
    - Nome Completo
    - Email
    - Senha (mínimo de 8 caracteres)
    - Confirmar Senha
- **Funcionalidades:**
    - Validação de campos (nome, email válido, senhas coincidem, mínimo de 8 caracteres para a senha).
    - Ao submeter, verifica no Firebase se já existe um usuário com o mesmo email.
    - Se o email não existir, cria um novo registro de usuário no banco de dados com `role: 'Usuário'`.
    - Um avatar padrão é gerado usando o serviço `pravatar.cc` com base no email.
    - Exibe um toast de sucesso e redireciona para a página de login (`/`).
    - Exibe um toast de erro se o email já estiver em uso ou se ocorrer um erro no banco de dados.

### 3.3. Esqueceu a Senha (`/forgot-password`)
- **Objetivo:** Iniciar o processo de redefinição de senha.
- **Campos:**
    - Email
- **Funcionalidades:**
    - Simula o envio de um código de redefinição.
    - Verifica se o email inserido existe no banco de dados.
    - Se existir, redireciona o usuário para a página `/reset-password`, passando o email como parâmetro na URL.
    - Se não existir, exibe um toast de erro.

### 3.4. Redefinir Senha (`/reset-password`)
- **Objetivo:** Permitir que o usuário defina uma nova senha.
- **Campos:**
    - Código de Verificação (campo simulado, qualquer valor é aceito).
    - Nova Senha (mínimo de 8 caracteres).
    - Confirmar Nova Senha.
- **Funcionalidades:**
    - Validação para garantir que as senhas coincidem e têm o comprimento mínimo.
    - Ao submeter, atualiza a senha do usuário correspondente ao email (passado pela URL) no Firebase.
    - Exibe um toast de sucesso e redireciona para a página de login.

## 4. Área Protegida (`/dashboard`)

Acessível apenas para usuários autenticados. Consiste em um layout principal com uma barra lateral de navegação e um cabeçalho.

### 4.1. Layout Principal
- **Header:**
    - **Botão de Menu (Mobile):** Abre uma folha (sheet) com a navegação da barra lateral.
    - **Barra de Pesquisa:** Permite pesquisar por recursos. Ao submeter, redireciona para `/dashboard/search?q=...`.
    - **Toggle de Tema (Light/Dark):** Alterna entre os modos de cor da interface.
    - **Menu de Perfil:** Um dropdown que mostra o avatar e nome do usuário.
        - **Opções:** "Configurações" (leva para a página de configurações), "Suporte" (item estático), e "Sair".
        - **Sair:** Limpa o `localStorage` com o ID do usuário e redireciona para a página de login.
- **Sidebar (Barra Lateral):**
    - Navegação principal do sistema.
    - Os itens de menu são renderizados condicionalmente com base na `role` do usuário (`Admin` ou `Usuário`).
    - Colapsável em telas de desktop.

### 4.2. Painel (Dashboard) (`/dashboard`)
- **Objetivo:** Fornecer uma visão geral e rápida das atividades do sistema.
- **Componentes:**
    - **Cartões de Estatísticas:**
        - Total de Reservas
        - Total de Usuários
        - Total de Recursos
        - Próximas Reservas (nos próximos 7 dias)
    - **Gráfico de Tendências de Agendamento:** Gráfico de linha mostrando o número de reservas feitas em cada um dos últimos 7 dias.
    - **Gráfico de Tipos de Recurso:** Gráfico de pizza mostrando a distribuição de recursos por tipo (ex: Sala, Laboratório).
    - **Tabela de Atividade Recente:** Lista as 5 reservas mais recentes, mostrando o usuário, recurso, data e status.
    - **Gráfico de Utilização de Recursos:** Gráfico de barras mostrando quais recursos são mais reservados.

### 4.3. Reservas (`/dashboard/reservations`)
- **Objetivo:** Listar, visualizar e gerenciar todas as reservas.
- **Funcionalidades:**
    - **Abas de Filtragem:** "Todas", "Confirmadas", "Pendentes", "Canceladas".
    - **Menu "Filtrar":**
        - Permite filtrar por status (Confirmada, Pendente, Cancelada).
        - **Admin:** Pode alternar entre "Apenas minhas reservas" e ver as reservas de todos os usuários. Quando a opção "apenas minhas" está desmarcada, um filtro por usuário (checkbox list) se torna disponível.
        - **Usuário:** Pode marcar/desmarcar "Apenas minhas reservas".
    - **Tabela de Reservas:**
        - Colunas: Recurso, Usuário, Status, Início, Fim, Ações.
        - **Ações (Menu Dropdown por linha):**
            - **Editar:** Leva para a página de edição da reserva (`/dashboard/reservations/edit/[id]`). Disponível apenas para o dono da reserva ou um Admin.
            - **Cancelar:** Exibe um diálogo de confirmação. Se confirmado, atualiza o status da reserva para "Cancelada". Disponível apenas para o dono da reserva ou um Admin.
    - **Botão "Nova Reserva":** Leva para `/dashboard/reservations/new`.

### 4.4. Nova Reserva (`/dashboard/reservations/new`)
- **Objetivo:** Criar uma nova reserva.
- **Campos:**
    - Recurso (Dropdown populado com os recursos do DB).
    - Data (Seletor de calendário que desabilita dias passados e dias de não funcionamento definidos nas configurações).
    - Hora de Início e Fim (Dropdowns populados com os blocos de horário e intervalos definidos nas configurações).
    - Propósito / Descrição (Textarea).
- **Funcionalidades:**
    - O formulário usa `react-hook-form` e `zod` para validação.
    - Garante que a hora de fim seja posterior à de início.
    - Ao submeter, verifica se há conflitos de horário para o recurso selecionado.
    - Se não houver conflito, cria um novo registro de reserva no Firebase com status "Confirmada".
    - Exibe toasts de sucesso ou erro.

### 4.5. Editar Reserva (`/dashboard/reservations/edit/[id]`)
- **Objetivo:** Modificar uma reserva existente.
- **Funcionalidades:**
    - Similar à página de nova reserva, mas os campos são pré-preenchidos com os dados da reserva sendo editada.
    - Carrega os dados da reserva com base no ID da URL.
    - Verifica se o usuário logado tem permissão para editar (é o dono ou um Admin). Se não tiver, redireciona com um toast de erro.
    - Ao submeter, executa a mesma lógica de verificação de conflito e atualiza o registro no Firebase.

### 4.6. Recursos (`/dashboard/resources`) (Página de Catálogo)
- **Objetivo:** Mostrar todos os recursos disponíveis para reserva em um formato de catálogo visual.
- **Funcionalidades:**
    - Exibe os recursos como cartões, cada um com imagem, nome, tipo, localização, capacidade e equipamentos.
    - **Botão "Filtrar por Tags":** Dropdown que permite ao usuário selecionar uma ou mais tags (definidas nas configurações) para filtrar a lista de recursos.
    - Cada cartão tem um botão **"Reservar Agora"** que leva diretamente para a página de nova reserva com o recurso já selecionado (`/dashboard/reservations/new?resourceId=...`).

### 4.7. Pesquisa (`/dashboard/search`)
- **Objetivo:** Exibir os resultados da busca feita no cabeçalho.
- **Funcionalidades:**
    - Pega o termo de busca do parâmetro `q` na URL.
    - Filtra a lista completa de recursos, buscando correspondências no nome, tipo, localização, equipamentos e tags.
    - Exibe os resultados em um layout de cartões, similar à página de recursos.
    - Mostra uma mensagem de "Nenhum recurso encontrado" se a busca não retornar resultados.

### 4.8. Gerenciamento de Usuários (`/dashboard/users`) (Admin)
- **Objetivo:** Permitir que administradores gerenciem os usuários do sistema.
- **Funcionalidades:**
    - Acesso restrito a usuários com `role: 'Admin'`.
    - **Tabela de Usuários:**
        - Exibe todos os usuários com avatar, nome, email e papel.
        - **Seleção em Massa:** Checkboxes para selecionar múltiplos usuários.
        - **Botão "Excluir (n)":** Aparece quando um ou mais usuários são selecionados, permitindo a exclusão em massa.
        - **Ações por linha:**
            - **Editar:** Leva para `/dashboard/users/edit/[id]`.
            - **Excluir:** Abre um diálogo de confirmação para excluir um único usuário.
    - **Botão "Adicionar Usuário":** Leva para `/dashboard/users/new`.

### 4.9. Novo Usuário (`/dashboard/users/new`) (Admin)
- **Objetivo:** Permitir que um Admin crie um novo usuário.
- **Campos:** Nome, Email, Papel (Dropdown com 'Usuário' e 'Admin'), Senha, Confirmar Senha, URL do Avatar (opcional).
- **Funcionalidades:**
    - Validação completa via Zod.
    - Cria o novo usuário no Firebase.
    - Redireciona de volta para a lista de usuários com um toast de sucesso.

### 4.10. Editar Usuário (`/dashboard/users/edit/[id]`) (Admin)
- **Objetivo:** Permitir que Admins editem perfis e usuários alterem suas próprias senhas.
- **Funcionalidades:**
    - Carrega dados do usuário baseado no ID da URL.
    - **Seção de Perfil:**
        - Campos: Nome, Email, Papel, URL do Avatar.
        - **Regra:** Apenas um Admin pode editar esses campos. Para outros usuários, eles são desabilitados.
    - **Seção de Alterar Senha:**
        - Campos: Nova Senha, Confirmar Nova Senha.
        - **Regra:** Fica visível e habilitada se:
            1. O usuário logado é um Admin e o perfil sendo editado **não é** de outro Admin.
            2. O usuário logado está editando seu próprio perfil.
    - As duas seções têm botões de salvar independentes.

### 4.11. Configurações (`/dashboard/settings`) (Admin)
- **Objetivo:** Central para um Admin configurar o comportamento do sistema.
- **Funcionalidades:**
    - Acesso restrito a usuários com `role: 'Admin'`.
    - Link para "Gerenciar Recursos".
    - **Abas de Configurações Avançadas:**
        - **Geral:**
            - Início e Fim do Expediente.
            - Duração Padrão da Aula (em minutos).
            - Dias de Funcionamento (checkboxes para os dias da semana).
        - **Tags:** Permite adicionar e remover as "tags" que serão usadas para categorizar e filtrar recursos.
        - **Intervalos:** Permite definir blocos de tempo que são considerados intervalos (ex: almoço), onde não se pode iniciar ou terminar reservas.
        - **Aulas:**
            - **Botão "Gerar Grade":** Função mais complexa. Com base no expediente, duração da aula e intervalos, calcula e preenche automaticamente os blocos de horário de aula disponíveis.
            - Permite adicionar, editar ou remover blocos de aula manualmente.
            - Esses blocos (aulas e intervalos) são usados para popular os dropdowns de "Hora de Início/Fim" no formulário de reserva.
    - Um único botão **"Salvar Configurações"** salva todas as mudanças de todas as abas de uma vez no Firebase.

### 4.12. Gerenciar Recursos (`/dashboard/settings/resources`) (Admin)
- **Objetivo:** CRUD (Criar, Ler, Atualizar, Excluir) completo para os recursos.
- **Funcionalidades:**
    - Acesso restrito a usuários com `role: 'Admin'`.
    - **Tabela de Recursos:**
        - Lista todos os recursos com Nome, Tipo, Localização e Capacidade.
        - **Ações por linha:**
            - **Editar:** Leva para `/dashboard/resources/edit/[id]`.
            - **Excluir:** Abre um diálogo de confirmação. Ao excluir um recurso, também exclui todas as reservas associadas a ele.
    - **Botão "Adicionar Recurso":** Leva para `/dashboard/resources/new`.
- As páginas de **Novo Recurso** e **Editar Recurso** são formulários simples para gerenciar os dados de cada recurso, incluindo o campo de `tags`, que é um conjunto de checkboxes baseado nas tags definidas na página de configurações.
