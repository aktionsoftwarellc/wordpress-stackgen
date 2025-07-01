const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

const config = require("./config.json");

const app = express();
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  session({
    secret: "stackgen-secret",
    resave: false,
    saveUninitialized: false,
  })
);

// Middleware de autenticação
function requireLogin(req, res, next) {
  if (!req.session.logado) {
    return res.redirect("/login");
  }
  next();
}

app.get("/login", (req, res) => {
  res.render("login", { erro: null });
});

app.post("/login", async (req, res) => {
  const { usuario, senha } = req.body;
  if (
    usuario === config.usuario &&
    (await bcrypt.compare(senha, config.senhaHash))
  ) {
    req.session.logado = true;
    return res.redirect("/");
  }
  res.render("login", { erro: "Usuário ou senha inválidos!" });
});

app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});

app.get("/", requireLogin, (req, res) => {
  res.render("form", { msg: null });
});

app.post("/criar", requireLogin, (req, res) => {
  const { nome_stack, dominios, db_user, db_pass, db_name, db_prefix, email } =
    req.body;
  const safeNomeStack = String(nome_stack).replace(/[^a-zA-Z0-9.-]/g, "");
  const safeDominios = String(dominios).replace(/[^a-zA-Z0-9.,-]/g, "");
  const safeUser = String(db_user).replace(/[^a-zA-Z0-9_]/g, "");
  const safeDb = String(db_name).replace(/[^a-zA-Z0-9_]/g, "");
  const safePrefix = db_prefix
    ? String(db_prefix).replace(/[^a-zA-Z0-9_]/g, "")
    : "wp_";
  const safeEmail = String(email).replace(/[^a-zA-Z0-9@._+-]/g, "");

  // Gera salts aleatórios
  function gerarSalt() {
    return require("crypto").randomBytes(32).toString("base64");
  }
  const salts = {};
  [
    "AUTH_KEY",
    "SECURE_AUTH_KEY",
    "LOGGED_IN_KEY",
    "NONCE_KEY",
    "AUTH_SALT",
    "SECURE_AUTH_SALT",
    "LOGGED_IN_SALT",
    "NONCE_SALT",
  ].forEach((k) => (salts[k] = gerarSalt()));

  const stackDir = path.join(__dirname, "stacks", safeNomeStack);
  if (!fs.existsSync(stackDir)) {
    fs.mkdirSync(stackDir, { recursive: true });
    fs.mkdirSync(path.join(stackDir, "db"), { recursive: true });
    fs.mkdirSync(path.join(stackDir, "http"), { recursive: true });
  }

  // .env
  let env = `VIRTUAL_HOST=${safeDominios}\nLETSENCRYPT_HOST=${safeDominios}\nLETSENCRYPT_EMAIL=${safeEmail}\n`;
  env += `DB_USER=${safeUser}\nDB_PASS=${db_pass}\nDB_NAME=${safeDb}\nDB_PREFIX=${safePrefix}\n`;
  Object.entries(salts).forEach(([k, v]) => (env += `${k}=${v}\n`));
  fs.writeFileSync(path.join(stackDir, ".env"), env);

  // docker-compose.yml
  const compose = `version: '3.1'

services:
  wordpress:
    image: wordpress
    restart: always
    environment:
      VIRTUAL_HOST: \${VIRTUAL_HOST}
      LETSENCRYPT_HOST: \${LETSENCRYPT_HOST}
      LETSENCRYPT_EMAIL: \${LETSENCRYPT_EMAIL}
      WORDPRESS_DB_HOST: db
      WORDPRESS_DB_USER: \${DB_USER}
      WORDPRESS_DB_PASSWORD: \${DB_PASS}
      WORDPRESS_DB_NAME: \${DB_NAME}
      WORDPRESS_TABLE_PREFIX: \${DB_PREFIX}
      WORDPRESS_AUTH_KEY: \${AUTH_KEY}
      WORDPRESS_SECURE_AUTH_KEY: \${SECURE_AUTH_KEY}
      WORDPRESS_LOGGED_IN_KEY: \${LOGGED_IN_KEY}
      WORDPRESS_NONCE_KEY: \${NONCE_KEY}
      WORDPRESS_AUTH_SALT: \${AUTH_SALT}
      WORDPRESS_SECURE_AUTH_SALT: \${SECURE_AUTH_SALT}
      WORDPRESS_LOGGED_IN_SALT: \${LOGGED_IN_SALT}
      WORDPRESS_NONCE_SALT: \${NONCE_SALT}
    volumes:
      - ./http:/var/www/html/wp-content
    depends_on:
      - db
  db:
    image: mysql:8.0
    restart: always
    command: --default-authentication-plugin=mysql_native_password
    environment:
      MYSQL_DATABASE: \${DB_NAME}
      MYSQL_USER: \${DB_USER}
      MYSQL_PASSWORD: \${DB_PASS}
      MYSQL_RANDOM_ROOT_PASSWORD: '1'
    volumes:
      - ./db:/var/lib/mysql
`;
  fs.writeFileSync(path.join(stackDir, "docker-compose.yml"), compose);

  // LEIA-ME.txt
  fs.writeFileSync(
    path.join(stackDir, "http", "LEIA-ME.txt"),
    "Coloque seus temas/plugins aqui.\nVocê pode usar SSH ou Git para enviar arquivos nesta pasta.\nExemplo: git clone <repo> .\n"
  );

  res.render("success", {
    pasta: `stacks/${safeNomeStack}`,
    comando: "docker compose up -d",
  });
});

app.post("/deploy", requireLogin, (req, res) => {
  const pasta = req.body.pasta;
  const pastaPath = path.join(__dirname, pasta);
  if (!fs.existsSync(pastaPath)) {
    return res.status(404).send("Pasta não encontrada.");
  }
  exec("docker-compose up -d", { cwd: pastaPath }, (error, stdout, stderr) => {
    let msg;
    if (error) {
      msg = `<div class='alert alert-danger'>Erro ao executar deploy:<br><pre>${stderr}</pre></div>`;
    } else {
      msg = `<div class='alert alert-success'>Deploy executado com sucesso!<br><pre>${stdout}</pre></div>`;
    }
    res.render("success", {
      pasta,
      comando: "docker-compose up -d",
      msg,
    });
  });
});

const PORT = process.env.PORT || 3000;
const HOST_IP = process.env.HOST_IP || "0.0.0.0";

app.listen(PORT, HOST_IP, () => {
  console.log(`Stackgen rodando em http://${HOST_IP}:${PORT}`);
});
