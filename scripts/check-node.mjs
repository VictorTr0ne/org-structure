// Vite's toolchain uses node:util's `styleText`, added in Node 20.12 / 22.12 — on an older
// Node it fails deep inside rolldown with a cryptic SyntaxError. This turns that into a clear message.
const [major, minor] = process.versions.node.split(".").map(Number);
const supported = major > 22 || (major === 22 && minor >= 12) || (major === 20 && minor >= 19);

if (!supported) {
  console.error(
    `\nТребуется Node.js >=20.19 или >=22.12, сейчас используется ${process.version}.\n` +
      `Если установлен nvm: nvm install 22 && nvm use 22 (в репозитории есть .nvmrc).\n`,
  );
  process.exit(1);
}
