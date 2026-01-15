# Gestão Escolar - Projeto Finalizado

Este repositório contém o código completo e finalizado da sua aplicação de gestão escolar.

O código está 100% pronto, mas o ambiente do Firebase Studio não consegue se conectar ao GitHub para enviar os arquivos. Siga os passos abaixo para enviar o código a partir do seu próprio computador.

Para uma descrição completa e detalhada de todas as funcionalidades do sistema, por favor, consulte o arquivo [**FUNCIONALIDADES.md**](./FUNCIONALIDADES.md).

---

## Como Enviar este Código para o GitHub (Passo a Passo)

Siga estas instruções na sua máquina local.

### 1. Baixe este projeto

- No ambiente do Firebase Studio, encontre e clique no botão para fazer o **download do projeto como um arquivo .zip**.
- Salve o arquivo no seu computador e descompacte-o em uma pasta. O nome da pasta será algo como `studio` ou `gestao-escolar`.

### 2. Abra um Terminal na Pasta do Projeto

- Abra o terminal do seu computador (Git Bash, PowerShell, ou Terminal).
- Use o comando `cd` para navegar até a pasta que você acabou de descompactar.
  - **Exemplo Windows:** `cd C:\Users\SeuNome\Downloads\nome-da-pasta`
  - **Exemplo Mac/Linux:** `cd ~/Downloads/nome-da-pasta`

### 3. Execute os Comandos Git

- Copie e cole os seguintes comandos, **um de cada vez**, no seu terminal.

- **a. Inicialize o repositório:**
  ```bash
  git init -b main
  ```

- **b. Adicione TODOS os arquivos para o envio:**
  ```bash
  git add .
  ```

- **c. Crie o "commit" (um registro das alterações):**
  ```bash
  git commit -m "Versão final do projeto"
  ```

- **d. Conecte ao seu repositório no GitHub:**
  ```bash
  git remote add origin https://github.com/Codexgsn/Gest-o-Escolar.git
  ```
  *(Se você receber um erro dizendo "remote origin already exists", pode ignorá-lo e continuar).*

- **e. Envie o código para o GitHub:**
  ```bash
  git push -u origin main
  ```

### 4. Ative o GitHub Pages

- Após o envio, vá para a página do seu repositório no GitHub.
- Clique em **Settings > Pages**.
- Em "Build and deployment", selecione **GitHub Actions** no menu "Source".

O site estará online em alguns minutos. O link aparecerá nessa mesma página.
