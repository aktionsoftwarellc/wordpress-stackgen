const bcrypt = require("bcrypt");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Esconde a senha digitada
function questionHidden(query) {
  return new Promise((resolve) => {
    const stdin = process.openStdin();
    process.stdin.on("data", (char) => {
      char = char + "";
      switch (char) {
        case "\n":
        case "\r":
        case "\u0004":
          stdin.pause();
          break;
        default:
          process.stdout.clearLine();
          process.stdout.cursorTo(0);
          process.stdout.write(query + Array(rl.line.length + 1).join("*"));
          break;
      }
    });
    rl.question(query, (value) => {
      rl.history = rl.history.slice(1);
      resolve(value);
    });
  });
}

(async () => {
  const password = await questionHidden("Digite a senha: ");
  const hash = await bcrypt.hash(password, 10);
  console.log("\nHash gerado:\n", hash);
  rl.close();
})();
