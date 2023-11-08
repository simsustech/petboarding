VITE_DATABASE_URL=postgres://user:ufgouifdgjdfg@localhost:5432/modularapi pnpm exec knex seed:run --esm --knexfile knexfile.js

pnpm exec knex migrate:latest --esm --connection=postgres://user:ufgouifdgjdfg@localhost:5432/modularapi --migrations-directory=./lib/migrations
