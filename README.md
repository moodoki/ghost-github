# ghost-github

Storage on GitHub for Ghost. Good for blogs hosted on platforms without a persistent filesystem (e.g. [Heroku](https://heroku.com)).

## Installation

```
cd /path/to/your/ghost/installation
npm install ghost-github
mkdir content/storage
cp -r node_modules/ghost-github content/storage/ghost-github
```

## Usage

Add the following to your (heroku) environment variables

```bash
#Read by Ghost itself (can be in config.json)
heroku config:set \
    config__storage__active=ghost-github

#Read by this adapter
heroku config:set \
    GHOST_GH_TYPE=token \
    GHOST_GH_REPO=... \
    GHOST_GH_REPO_OWNER=... \
    GHOST_GH_TOKEN=... \
    GHOST_GH_DESTINATION=... \
    GHOST_GH_BRANCH=...
```

## Questions

### How do I get a personal access token?

1. Create a new personal token [here](https://github.com/settings/tokens/new).
2. Select 'repo' (which will select everything under `repo`), as **ghost-github** will need access to your repository.
3. Copy the token that shows up upon successful creation, and paste that into the `token` field of **ghost-github**'s configuration.

### I'm getting a "Bad credentials" error. What should I do?

Your token or password might be incorrect. You should double-check your configuration.

### I'm getting a "Not found" error. What should I do?

Make sure the repository you specified exists. Also, check to make sure the branch (if specified) exists in the repo.

## Contributors

Without these awesome people, I might've never been able to finish this.
- [@acburdine](https://github.com/acburdine)
- [@shmishtopher](https://github.com/shmishtopher)

## License

[MIT](LICENSE.txt)
