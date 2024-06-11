# dexie Governance API

A Cloudflare Worker that provides the API for dexies snapshot governance app. Data is stored in Cloudflares D1 SQLite database.

## How to run

Install wrangler and dependencies

`npm install`

Rename the `wrangler.toml.example` to `wrangler.toml` and fill in the necessary values.

`mv wrangler.toml.example wrangler.toml`

Create Database

`wrangler d1 execute dexie-testnet --file schemas/schema.sql -e testnet`

Run the API locally

`wrangler dev -e testnet`

Deploy the API

`wrangler deploy -e testnet`
