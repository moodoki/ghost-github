"use strict";

const BaseStorage = require("ghost-storage-base");
const fs = require("fs");
const GitHub = require("github");
const path = require("path");
const Promise = require("bluebird");
const removeLeadingSlash = require("remove-leading-slash");
const request = Promise.promisify(require("request"));

class GitHubStorage extends BaseStorage{
    constructor(config){
        super();
        this.client = new GitHub();

        config.branch = process.env.GHOST_GH_BRANCH || config.branch || "master";
        config.destination = process.env.GHOST_GH_DESTINATION || config.destination || "";
        config.user = process.env.GHOST_GH_REPO_OWNER;
        config.password = process.env.GHOST_GH_PASSWORD;
        config.token = process.env.GHOST_GH_TOKEN;
        config.type = process.env.GHOST_GH_TYPE;
        config.repo = process.env.GHOST_GH_REPO;
        config.username = process.env.GHOST_GH_USER;

        this.config = config;

    }
    
    delete(){
        // TODO: Find a way to get the blob SHA of the target file
        return Promise.reject("Not implemented");
    }
    
    exists(filename, targetDir){
        const filepath = path.join(targetDir || this.getTargetDir(), filename);
        return request(this.getUrl(filepath))
            .then(res => (res.statusCode === 200))
            .catch(() => false);
    }
    
    read(options){
    }
    
    save(file, targetDir){
        const config = this.config;
        const dir = targetDir || this.getTargetDir();
        return Promise.join(this.getUniqueFileName(file, dir), Promise.promisify(fs.readFile)(file.path, "base64"), (filename, data) => {
            // Authenticate for the next request
            this.client.authenticate({
                type: config.type,
                username: config.user,
                password: config.password,
                token: config.token,
            });
            return this.client.repos.createFile({
                owner: config.user,
                repo: config.repo,
                message: "Add new image",
                path: removeLeadingSlash(filename),
                content: data
            });
        })
            .then(res => res.data.content.download_url)
            .catch(Promise.reject);
    }
    
    serve(){
        return (req, res, next) => {
            next();
        };
    }
    
    getUrl(filename){
        const config = this.config;
        return `https://raw.githubusercontent.com/${config.user}/${config.repo}/${config.branch || "master"}/${removeLeadingSlash(this.config.destination, filename)}`;
    }
}

module.exports = GitHubStorage;
