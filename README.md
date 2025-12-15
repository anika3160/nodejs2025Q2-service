# Home Library Service

NestJS with Prisma ORM REST API for Users, Artists, Albums, Tracks and Favorites with PostgreSQL db in Docker.
Swagger spec is served at `/doc`.

## Authentication & Authorization

- Public routes: `/auth/signup`, `/auth/login`, `/auth/refresh`, `/doc`, `/`.
- Protected routes: all others require `Authorization: Bearer <accessToken>`.
- Tokens: Access/Refresh JWTs include `userId` and `login`; secrets and TTLs come from `.env` (`JWT_SECRET_KEY`, `JWT_SECRET_REFRESH_KEY`, `TOKEN_EXPIRE_TIME`, `TOKEN_REFRESH_EXPIRE_TIME`).
- Passwords are stored as bcrypt hashes; salt rounds are controlled via `CRYPT_SALT`.

### Manual check

1) Signup: `POST /auth/signup` `{ "login": "user1", "password": "pass1" }` → 201, no `password` in response.  
2) Login: `POST /auth/login` with same body → 200, returns `{ accessToken, refreshToken }`.  
3) Call protected route, e.g. `GET /user` with header `Authorization: Bearer <accessToken>` → 200; without header → 401.  
4) Refresh: `POST /auth/refresh` `{ "refreshToken": "<refreshToken>" }` → 200, new token pair; missing token → 401, invalid/expired → 403.

## Prerequisites

- Git - [Download & Install Git](https://git-scm.com/downloads).
- Node.js - [Download & Install Node.js](https://nodejs.org/en/download/) and the npm package manager.
- Docker - [Download & Install Docker](https://www.docker.com/get-started).

## Downloading

```bash
git clone https://github.com/anika3160/nodejs2025Q2-service.git
git checkout dev-docker
```

## Environment

Use `.env.example` as a template and change values if needed:

```bash
cp .env.example .env
```

## Run with Docker Compose

```bash
docker compose up
```

### Development mode with auto-restart on source changes

```bash
docker compose --profile dev up backend-dev postgres
```

### Use prebuilt image instead of building

In `docker-compose.yml` use image (`image: anika3160/home-library-nodejs:v1.0.0`) instead of build.
  
```bash
docker compose up
```

## Local development

```bash
npm install
npm run start:dev       
```

After starting the app on port (4000 as default) you can open
in your browser OpenAPI documentation by typing <http://localhost:4000/doc/>.
For more information about OpenAPI/Swagger please visit <https://swagger.io/>.

## Testing

After application running open new terminal and enter:

To run all tests without authorization

```bash
npm run test
```

To run only one of all test suites

```bash
npm run test -- <path to suite>
```

To run all test with authorization

```bash
npm run test:auth
```

To run only specific test suite with authorization

```bash
npm run test:auth -- <path to suite>
```

### Auto-fix and format

```bash
npm run lint
```

```bash
npm run format
```

### Debugging in VSCode

Press <kbd>F5</kbd> to debug.

For more information, visit: <https://code.visualstudio.com/docs/editor/debugging>

### Security scan

```bash
npm run security-check
```
