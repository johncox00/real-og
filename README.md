# Real OG

This is a Rails application with React frontend that will asynchronously fetch an Open Graph image from a website if it exists. 

## Quick Start

```
mv ./.env.example ./.env
docker-compose up --build
```

Visit [localhost:3000](http://localhost:3000). Enter a URL in the text box and watch it work.

## Details

There are several environment variables that can be overriden in the `.env` file. The defauls are as follows:

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

Some of these defaults are overriden in `docker-compose.yml` for running in that environment.

If you are running locally (i.e. _not_ with docker-compose) there are a few more steps:
1. Install Postgres locally or run it in a container.
2. Create the Postgres user/password that you want to use in the app.
3. Install and run Redis locally or in a container and update any pertinent environment variables.
4. `bundle install`
5. In separate terminals: `rails s` and `bin/jobs start`

NOTE: The original `config/master.key` file was purposefully committed to this repo to make the demo easier. 

## Reflection

First, I feel the need to say this: This is not production-ready code. It is functional code that was put together rather quickly and is being demonstrated in a `development` environment. There are no tests. There is no authentication. There is just a basic app.

The approach to implementation went as follows:
- Data model
- API: Create + List
- Async fetch job
- Real-time UI feedback
- Styling/UX
- Containerize
- Externalize config

The data model is a simple, single table called `url_requests` with the following fields:
```
id: uuid
url: string
status: integer (enum: [submitted, processing, success, error])
result: string
created_at: datetime
updated_at: datetime
```

The idea is that the `result` field would serve to store either the URL of the `og:image` tag on `success` or whatever error message is available on `error`. I created a new record per site submitted rather than looking up previous results for the same URL. This does take up more storage and compute time, however it does account for `og:image` tags being updated over time. It's a purposefully simple solution for demonstration.

One thing worth noting is that I started with the primary key as a UUID in SQLite, which led me to the `before_create` hook in the `UrlRequest` model. When I moved things to Postgres I did not refactor to use Postres' UUID capabilities. In the real world I would have definitely done that.

I set up the frontend to be served by Rails to keep the demo simple. Normally I would maintain and deploy a React frontend separate from the API server and lean on simpler infrastructure for static file serving.

### AI Usage

I coded almost all of this by hand. It's been a few major Rails versions since my last production deployment, so there were a few things I needed to pick up like Active Job and Action Cable. Going without AI assistance for that exercise was valuable for learning. Where I did lean into LLM-generated code was in the UI styling as well as some of the containerization. 
