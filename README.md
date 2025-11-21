# README

```
rails new -j esbuild real-og
cd real-og
bundle
yarn add react react-dom
rails s
yarn watch
```

# TODO

- Data model x
- Create + List x
- Async fetch/cache x
- Socket/polling x
- make it usable/pretty/bulletproof x
- containerize X

Running:
```
docker-compose up --build
```

Defaults:
```
REACT_APP_API_HOST=localhost
REACT_APP_API_PORT=3000
REACT_APP_API_PROTOCOL=http
REDIS_URL=redis://localhost:6379/1
POSTGRES_HOST=localhost
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=real_og_development
POSTGRES_QUEUE_DB=real_og_development_queue
```
