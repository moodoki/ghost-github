"use strict";

const Promise = require("bluebird");
const BaseStorage = require("ghost-storage-base");
const GitHub = require("github");
const fs = require("fs");
const path = require("path");

const buildUrl = require("build-url");
const isUrl = require("is-url");
const readFile = Promise.promisify(fs.readFile);
const removeLeadingSlash = require("remove-leading-slash");
const request = Promise.promisify(require("request"));


class GitHubStorage extends BaseStorage {
    constructor() {
        super();
	var config = {branch : "master",
		      destination : "",
		      owner: process.env.GHOST_GH_REPO_OWNER,
		      repo : process.env.GHOST_GH_REPO,
		     }
		      
	
	console.log('GHStorage config:')
	console.log(config);

        this.client = new GitHub();
        this.config = config;
        config.branch = process.env.GHOST_GH_BRANCH || config.branch || "master";
        config.destination = process.env.GHOST_GH_DESTINATION || config.destination || "";

	console.log('GHStorage config:')
	console.log(config);

        this.client.authenticate({
            type: process.env.GHOST_GH_TYPE,
            username: process.env.GHOST_GH_USER,
            password: process.env.GHOST_GH_PASSWORD,
            token: process.env.GHOST_GH_TOKEN,
        });
    }

    delete() {
        // TODO: Find a way to get the blob SHA of the target file
        return Promise.reject("Not implemented");
    }

    exists(filename, targetDir) {
        const filepath = path.join(targetDir || this.getTargetDir(), filename);

        return request(this.getUrl(filepath))
            .then(res => res.statusCode === 200)
            .catch(() => false);
    }

    read(options) {
        // Not needed because absolute URLS are already used to link to the images
    }

    save(file, targetDir) {
        const {branch, repo, user} = this.config;
        const dir = targetDir || this.getTargetDir();

        return Promise.join(this.getUniqueFileName(file, dir), readFile(file.path, "base64"), (filename, data) => {
            return this.client.repos.createFile({
                owner: user,
                repo: repo,
                branch: branch,
                message: "Add new image",
                path: this.getFilepath(filename),
                content: data
            });
        })
            .then(res => res.data.content.download_url)
            .catch(Promise.reject);
    }

    serve() {
        return (req, res, next) => {
            next();
        };
    }

    getUrl(filename) {
        const {baseUrl, branch, repo, user} = this.config;
        let url = isUrl(baseUrl) ? baseUrl : `https://raw.githubusercontent.com/${user}/${repo}/${branch}`;
        url = buildUrl(url, {path: this.getFilepath(filename)});

        return url;
    }

    getFilepath(filename) {
        return removeLeadingSlash(path.join(this.config.destination, filename));
    }
}

module.exports = GitHubStorage;
