# Universities Back-end

<hr>

<span style="color:yellow"><b>Atenção!</b>

<ul>
    <li>
    <div style="background-color: lightyellow; color: black; border-radius: 5px; padding: 5px;">
Durante o desenvolvimento desse projeto, houveram dependências incompatíveis, portanto, foi utilizado a flag <b>---legacy-peer-deps</b> do npm. Caso haja algum problema relacionado a <b>"ES Module"</b> ou <b>"Pattern..."</b>, tente excluir a pasta <b>node_modules</b>, a pasta <b>dist</b> e o arquivo <b>.lock</b>
</div>
</ul>

## Instalando as dependências

- `$ npm install --legacy-peer-deps` ou `$ yarn`

#### Para desenvolvimento

- `$ npm run start:dev` ou `$ yarn start:dev`

#### Para produção

- `$ npm run build && npm run start:prod` ou `$ yarn build && yarn start:prod`
  - O comando `start:prod`, utiliza o <b>PM2</b>

<hr>

## Rodando através do Docker Compose

Há um arquivo `docker-compose.yml`, que contém os serviços utilizados, dentre eles, MongoDB, Redis e a própria API.

#### Para rodar no desenvolvimento

- `$ docker compose up -d mongodb redis`
  - O comando acima roda o MongoDB e o Redis

#### Para rodar em produção

- `$ docker compose up -d`
  - O comando acima roda os 3 serviços

<hr>

## Variáveis de ambiente

Há um arquivo no projeto chamado ```.env.example```, ele é um modelo do arquivo ```.env``` que deve ser criado.

```
# Application
NODE_ENV=dev
PORT=3000
FORGOT_PASSWORD_TOKEN_EXP_SECS=3600
FORGOT_PASSWORD_RESEND_TOKEN_EXP_SECS=300

# DB
DB_URL=mongodb://localhost:27017
DB_HOST=localhost
DB_PORT=27017
DB_USER=admin
DB_PASS=admin
DB_NAME=universities
DB_SYNC=1
DB_LOG=0

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=123456
CACHE_TTL=3600
CACHE_MAX=10

# Cron Jobs
CRON_TZ=America/Sao_Paulo

# Rate limiting
THROTTLER_TTL=60
THROTTLER_LIMIT=10

# JWT
JWT_EXP=24h
JWT_SECRET=secret

# SendGrid
SENDGRID_KEY=secret
SENDGRID_FROM=email
```

<hr>

## Documentação da API

Para acessá-la, utilize o endpoint ```/api/docs```.

Caso esteja rodando localmente, execute o projeto e acesse http://localhost:3000/api/docs

## Versão do Node.js

Caso esteja utilizando o [NVM](https://github.com/nvm-sh/nvm), há um arquivo ```.nvmrc```, que contém a versão utilizada para o desenvolvimento do projeto

## Suíte de testes

Para rodá-la, utilize o comando:

```$ yarn test``` ou ```$ npm test```

## Actions

O repositório está configurado para realizar o build e rodar os testes do projeto ao fazer um commit na branch master. Todo o fluxo pode ser visualizado no arquivo ```ci.yml``` na pasta ```.github```.

