# Gerador de Stack WordPress (docker-compose)

1. Acesse este painel via navegador (ex: http://localhost/stackgen)
2. Faça login com o usuário e senha definidos em config.php
3. Preencha o formulário com os dados do novo site
4. A stack será criada em stackgen/stacks/NOME_DO_DOMINIO
5. Entre na pasta criada e rode: docker compose up -d

- A pasta http pode ser usada para subir temas/plugins via SSH ou Git.
- A pasta db é o volume do banco de dados.

Altere a senha padrão em config.php após o primeiro uso! 