# wikilab
wip collaborative documentation solution
documentation coming soon

## Directroy Breakdown
```
├── public ── Holds assets
├── src ── Main source code
│   ├── db ── Database models
│   └── modules ── Application modules
└── views ── Holds view templates
```

## Development
Run `sh setup.sh` to create a default .env file.

Wikilab uses a mongo database, you can use a local instance or a remote one, remote preferred for production.

Run `npm run start` to start the server

Run `npm run dev` to start the server with hot reload (Useful in production if not using systemd service).

### Conventions
Despite it being TS, please use snake_case.

Try to keep the project modular, don't let files get too long.