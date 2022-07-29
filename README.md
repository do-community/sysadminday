# SysAdmin Day

Microsite for [sysadminday.digitalocean.com](https://sysadminday.digitalocean.com])
(and [sysadmin.love](https://sysadmin.love)).

Brought to you by your friends at [DigitalOcean](https://www.digitalocean.com).


## Development

1. Install Node.js following the version defined in [`.nvmrc`](.nvmrc).

2. Install NPM dependencies following the lock file using `npm ci`.

3. Start the development server with file watching using `npm run dev`.


## Deployment

1. Install Node.js & NPM dependencies as with the development setup.

2. Build the production version of the app using `npm run build`.

3. Serve the built HTML from the `dist` directory.

(You could do this with [App Platform](https://www.digitalocean.com/products/app-platform) 😎).


## License

This project is licensed under the [Apache 2.0 license](LICENSE).
