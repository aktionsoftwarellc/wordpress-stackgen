# Gerador de Stack WordPress (docker-compose)

Este painel web permite criar rapidamente stacks WordPress com docker-compose, integração automática com nginx-proxy/letsencrypt, e deploy direto pelo navegador.

## Instalação e configuração inicial

Antes de acessar o painel, siga estes passos obrigatórios:

### 1. Instale as dependências

No terminal, dentro da pasta `stackgen`, execute:
```bash
npm install
```

### 2. Configure o arquivo `config.json`

O painel exige um arquivo `config.json` com o usuário e o hash da senha de acesso.  
Use o arquivo de exemplo `config.sample.json` como base:

```bash
cp config.sample.json config.json
```

Edite o `config.json` e defina o usuário desejado.  
Para a senha, você deve gerar um hash seguro usando o script incluso.

### 3. Gere o hash da senha

Execute o script para gerar o hash da senha desejada:
```bash
node gerar-hash.js
```
Digite a senha quando solicitado (ela ficará oculta).  
O script exibirá o hash gerado.  
Copie o hash e cole no campo `"senhaHash"` do seu `config.json`.

Exemplo de `config.json` preenchido:
```json
{
    "usuario": "seu-usuario",
    "senhaHash": "$2b$10$ExemploDeHashGeradoPeloScript..."
}
```

### 4. Configure o IP e porta de acesso (opcional)

Para limitar o acesso a um IP específico (ex: VPN) ou alterar a porta, copie o arquivo de exemplo:
```bash
cp env.example .env
```

Edite o `.env` e configure conforme necessário:
```bash
HOST_IP=172.99.10.1  # IP da VPN
PORT=3000            # Porta do servidor
# ou HOST_IP=0.0.0.0 para permitir qualquer IP
```

### 5. Inicie o painel

**Modo desenvolvimento:**
```bash
npm start
```

**Modo produção (daemon/serviço):**
```bash
# Instale PM2 globalmente (se não tiver)
npm install -g pm2

# Inicie como serviço
npm run daemon

# Outros comandos úteis:
npm run stop      # Para o serviço
npm run restart   # Reinicia o serviço
npm run logs      # Visualiza os logs
```

Acesse o painel via navegador:
- IP específico: [http://172.99.10.1:3000](http://172.99.10.1:3000)
- Localhost: [http://localhost:3000](http://localhost:3000)

---

## Como usar

1. Acesse o painel via navegador
2. Faça login com o usuário e senha definidos em `config.json`
3. Preencha o formulário:
   - **Nome da Stack**: Nome da pasta que será criada (ex: "meusite")
   - **Domínios**: Lista separada por vírgula (ex: "meusite.com,www.meusite.com")
   - **Dados do banco**: usuário, senha, nome do banco
   - **E-mail**: para certificados SSL automáticos
4. A stack será criada em `stackgen/stacks/NOME_DA_STACK`
5. Você pode:
   - Entrar na pasta criada e rodar manualmente: `docker-compose up -d`
   - Ou clicar no botão **Deploy** na tela de sucesso para executar o deploy direto pelo painel

## Recursos
- Geração automática de `docker-compose.yml` e `.env` com variáveis para nginx-proxy e Let's Encrypt
- Suporte a múltiplos domínios por stack (com e sem www)
- Nome da stack independente dos domínios
- Volumes separados para banco (`db/`) e temas/plugins (`http/`)
- Upload de temas/plugins via SSH ou Git na pasta `http/`
- Interface web responsiva (Bootstrap)
- Deploy direto pelo painel (executa `docker-compose up -d` na pasta da stack)
- Execução como daemon/serviço com PM2
- Controle de acesso por IP específico

## Observações
- O acesso ao WordPress será feito pelos domínios informados, via proxy reverso do nginx (não há portas públicas expostas)
- MySQL configurado com `mysql_native_password` para compatibilidade com PHP mais antigo
- Altere a senha padrão em `config.json` após o primeiro uso!
- O painel exige Node.js, Docker e PM2 (para modo daemon) instalados no servidor

---

> Projeto desenvolvido para facilitar o deploy de múltiplos sites WordPress em ambientes LAMP/LEMP com proxy reverso automatizado. 