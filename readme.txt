caso não possua o node no pc, instale pelo site oficial: https://nodejs.org/pt

 ----instalar o docker em:https://www.docker.com/----

instalar o node na pasta:
git bash na pasta do projeto, logo após:
 1--docker compose run --rm app sh -c "npm install && npm run bootstrap"
 (só na primeira vez que rodar o projeto)
 
 dps da instalação:
 2--docker compose up

OBS: Lembrar de configurar o .env, caso contrario, n vai rodar

