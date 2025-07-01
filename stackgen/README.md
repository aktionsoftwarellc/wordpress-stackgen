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

### 4. Inicie o painel

No terminal, execute:
```bash
npm start
```
Acesse o painel via navegador em [http://localhost:3000](http://localhost:3000).

---

## Como usar

1. Acesse o painel via navegador (ex: http://localhost:3000)
2. Faça login com o usuário e senha definidos em `config.json`
3. Preencha o formulário com os dados do novo site (domínio, banco, e-mail para SSL, etc)
4. A stack será criada em `stackgen/stacks/NOME_DO_DOMINIO`
5. Você pode:
   - Entrar na pasta criada e rodar manualmente: `docker-compose up -d`
   - Ou clicar no botão **Deploy** na tela de sucesso para executar o deploy direto pelo painel

## Recursos
- Geração automática de `docker-compose.yml` e `.env` com variáveis para nginx-proxy e Let's Encrypt
- Volumes separados para banco (`db/`) e temas/plugins (`http/`)
- Upload de temas/plugins via SSH ou Git na pasta `http/`
- Interface web responsiva (Bootstrap)
- Deploy direto pelo painel (executa `docker-compose up -d` na pasta da stack)

## Observações
- O acesso ao WordPress será feito pelo domínio informado, via proxy reverso do nginx (não há portas públicas expostas)
- Altere a senha padrão em `config.json` após o primeiro uso!
- O painel exige Node.js e Docker instalados no servidor

---

> Projeto desenvolvido para facilitar o deploy de múltiplos sites WordPress em ambientes LAMP/LEMP com proxy reverso automatizado. 