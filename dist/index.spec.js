"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* tslint:disable:no-shadowed-variable */
/* tslint:disable:no-unused-variable */
const test = require("blue-tape");
const path = require("path");
const index_1 = require("./index");
test('docker-cli-js', t => {
    t.test('info', t => {
        let docker = new index_1.Docker();
        return docker.command('info').then(function (data) {
            console.log(data);
            t.ok(data);
            t.ok(data.object.server_version);
        });
    });
    t.test('build', t => {
        const options = new index_1.Options(
        /* machineName */ undefined, 
        /* currentWorkingDirectory */ path.join(__dirname, '..', 'test', 'nginx'));
        let docker = new index_1.Docker(options);
        return docker.command('build -t nginximg .').then(function (data) {
            console.log('data = ', data);
            t.ok(data);
            t.ok(data.success);
        });
    });
    t.test('run', t => {
        let docker = new index_1.Docker();
        return docker.command('run --name nginxcont -d -p 80:80 nginximg').then(function (data) {
            console.log('data = ', data);
            t.ok(data.containerId);
        });
    });
    t.test('ps', t => {
        let docker = new index_1.Docker();
        return docker.command('ps').then(function (data) {
            console.log('data = ', data);
            t.ok(data.containerList);
        });
    });
    t.test('images', t => {
        let docker = new index_1.Docker();
        return docker.command('images').then(function (data) {
            console.log('data = ', data);
            t.ok(data.images);
        });
    });
    t.test('network ls', t => {
        let docker = new index_1.Docker();
        return docker.command('network ls').then(function (data) {
            console.log('data = ', data);
            t.ok(data.network);
        });
    });
    t.test('inspect', t => {
        let docker = new index_1.Docker();
        return docker.command('inspect nginxcont').then(function (data) {
            console.log('data = ', data);
            t.ok(data.object);
        });
    });
});
