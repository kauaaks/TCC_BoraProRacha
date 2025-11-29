caso não possua o node no pc, instale pelo site oficial: https://nodejs.org/pt

instalar o node na pasta:
git bash na pasta do projeto, logo após:
npm i -D npm-run-all concurrently wait-on rimraf (isso instala as dependências de desenvolvedor)
da primeira vez que rodar o projeto:
npm run start:all 
npm run start:all vai instalar todos os node_modules, tanto de front com backend.
caso você vá reiniciar o projeto, pode roda-lo com:
npm run dev

OBS: Lembrar de configurar o .env, caso contrario, n vai rodar


