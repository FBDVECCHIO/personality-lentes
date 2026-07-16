# Como Publicar na Vercel e Configurar o Banco de Dados Supabase

Este documento fornece as instruções passo a passo para hospedar o site da **PERSONALITY Lenses** na Vercel e conectar a sua conta do Supabase.

---

## 🛠️ Passo 1: Publicação Rápida na Vercel

O site é 100% estático (HTML/CSS/JS), o que permite a hospedagem **totalmente gratuita** na Vercel com carregamento instantâneo.

### Opção A: Pelo Terminal (Mais Rápido - 1 minuto)
Se você tem a ferramenta CLI da Vercel instalada no seu computador:
1. Abra o terminal (PowerShell ou Command Prompt) na pasta do projeto:
   ```bash
   cd C:\Users\fbdv1\.gemini\antigravity\scratch\personality-lentes
   ```
2. Digite o comando de deploy:
   ```bash
   vercel
   ```
3. Responda às perguntas no terminal (pressione Enter para aceitar os padrões).
4. O link do seu site estará disponível na tela! Se quiser subir para produção oficial:
   ```bash
   vercel --prod
   ```

### Opção B: Pelo GitHub (Mais Seguro e Automático)
1. Crie um repositório no seu GitHub chamado `personality-lentes`.
2. Envie os arquivos desta pasta para o seu repositório:
   ```bash
   git init
   git add .
   git commit -m "feat: site da personality lenses completo"
   git remote add origin https://github.com/SEU_USUARIO/personality-lentes.git
   git branch -M main
   git push -u origin main
   ```
3. Acesse a sua conta em [vercel.com](https://vercel.com).
4. Clique em **Add New > Project**.
5. Importe o repositório `personality-lentes`.
6. Clique em **Deploy**. Toda vez que você atualizar o código no GitHub, a Vercel atualiza o site na hora!

---

## 🌐 Passo 2: Configurando seu Domínio Personalizado

Depois de publicar o projeto na Vercel:
1. No painel do projeto na Vercel, acesse **Settings > Domains**.
2. Digite o seu domínio oficial (ex: `personalitylentes.com.br`) ou subdomínio (ex: `loja.personalitylentes.com.br`) e clique em **Add**.
3. A Vercel mostrará as regras de DNS. Acesse a sua conta de registro (como Registro.br ou Cloudflare) e crie os apontamentos:
   *   **Para Domínio Principal (sem www):** Adicione um registro tipo `A` apontando para o IP `76.76.21.21`.
   *   **Para Subdomínio (com www):** Adicione um registro tipo `CNAME` apontando para `cname.vercel-dns.com`.
4. Aguarde a propagação (normalmente de 5 a 15 minutos). O site estará ativo no seu endereço oficial com SSL (cadeado de segurança) gratuito gerado automaticamente!

---

## 🗄️ Passo 3: Configuração do Supabase (Banco de Dados)

O site envia os formulários de contato diretamente para o seu banco Supabase de forma segura e serverless (diretamente do navegador do usuário).

1. Acesse o seu painel do **Supabase** e clique em **SQL Editor**.
2. Cole e execute o código abaixo para criar a tabela que recebe os leads:
   ```sql
   create table leads_personality (
     id uuid default gen_random_uuid() primary key,
     name text not null,
     email text not null,
     whatsapp text not null,
     message text,
     created_at timestamp with time zone default timezone('utc'::text, now()) not null
   );
   ```
3. Acesse **Project Settings > API** no painel do Supabase. Copie os seguintes dados:
   *   `Project URL` (URL da API)
   *   `anon public` (Chave pública da API)
4. Acesse o **Painel Administrativo** do seu site recém-publicado (ex: `https://seu-site.com/admin.html` ou pelo link no rodapé).
5. Vá na seção **Banco Supabase**, preencha os dois campos copiados e o nome da tabela (`leads_personality`), e clique em **Salvar Configurações**.
6. O painel testará a conexão na hora. Se o status ficar verde: **Pronto! Seu site está 100% integrado com o banco de dados.**
