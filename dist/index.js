"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const child_process = require("child_process");
const nodeify_ts_1 = require("nodeify-ts");
const cli_table_2_json_1 = require("cli-table-2-json");
const dockermachine_cli_js_1 = require("dockermachine-cli-js");
const exec = child_process.exec;
const splitLines = function (input) {
    return input.replace(/\r/g, '').split('\n');
};
const array2Oject = function (lines) {
    return lines.reduce(function (object, linep) {
        const line = linep.trim();
        if (line.length === 0) {
            return object;
        }
        const parts = line.split(':');
        let key = parts[0];
        let value = parts.slice(1).join(':');
        key = _.snakeCase(key);
        object[key] = value.trim();
        return object;
    }, {});
};
const extractResult = function (result) {
    const extracterArray = [
        {
            re: / build /,
            run: function (resultp) {
                const lines = splitLines(resultp.raw);
                lines.forEach(function (line) {
                    const re = /Successfully built (.*)$/;
                    const str = line;
                    let m;
                    if ((m = re.exec(str)) !== null) {
                        if (m.index === re.lastIndex) {
                            re.lastIndex++;
                        }
                        // View your result using the m-variable.
                        // eg m[0] etc.
                        resultp.success = true;
                        resultp.imageId = m[1];
                    }
                });
                resultp.response = lines;
                return resultp;
            },
        },
        {
            re: / run /,
            run: function (resultp) {
                resultp.containerId = resultp.raw.trim();
                return resultp;
            },
        },
        {
            re: / ps /,
            run: function (resultp) {
                const lines = splitLines(resultp.raw);
                resultp.containerList = cli_table_2_json_1.cliTable2Json(lines);
                return resultp;
            },
        },
        {
            re: / images /,
            run: function (resultp) {
                const lines = splitLines(resultp.raw);
                //const debug = require('debug')('docker-cli-js:lib/index.js extractResult images');
                //debug(lines);
                resultp.images = cli_table_2_json_1.cliTable2Json(lines);
                return resultp;
            },
        },
        {
            re: / network ls /,
            run: function (resultp) {
                const lines = splitLines(resultp.raw);
                //const debug = require('debug')('docker-cli-js:lib/index.js extractResult images');
                //debug(lines);
                resultp.network = cli_table_2_json_1.cliTable2Json(lines);
                return resultp;
            },
        },
        {
            re: / inspect /,
            run: function (resultp) {
                const object = JSON.parse(resultp.raw);
                resultp.object = object;
                return resultp;
            },
        },
        {
            re: / info /,
            run: function (resultp) {
                const lines = splitLines(resultp.raw);
                resultp.object = array2Oject(lines);
                return resultp;
            },
        },
    ];
    extracterArray.forEach(function (extracter) {
        const re = extracter.re;
        const str = result.command;
        let m;
        if ((m = re.exec(str)) !== null) {
            if (m.index === re.lastIndex) {
                re.lastIndex++;
            }
            // View your result using the m-constiable.
            // eg m[0] etc.
            return extracter.run(result);
        }
    });
    return result;
};
class Docker {
    constructor(options = {
            currentWorkingDirectory: undefined,
            machineName: undefined,
        }) {
        this.options = options;
    }
    command(command, callback) {
        let docker = this;
        let execCommand = 'docker ';
        let machineconfig = '';
        const promise = Promise.resolve().then(function () {
            if (docker.options.machineName) {
                const dockerMachine = new dockermachine_cli_js_1.DockerMachine();
                return dockerMachine.command('config ' + docker.options.machineName).then(function (data) {
                    //console.log('data = ', data);
                    machineconfig = data.machine.config;
                });
            }
        }).then(function () {
            execCommand += ' ' + machineconfig + ' ' + command + ' ';
            let execOptions = {
                cwd: docker.options.currentWorkingDirectory,
                env: {
                    DEBUG: '',
                    HOME: process.env.HOME,
                    PATH: process.env.PATH,
                },
                maxBuffer: 200 * 1024 * 1024,
            };
            return new Promise(function (resolve, reject) {
                //console.log('execCommand =', execCommand);
                //console.log('exec options =', execOptions);
                exec(execCommand, execOptions, function (error, stdout, stderr) {
                    if (error) {
                        const message = `error: '${error}' stdout = '${stdout}' stderr = '${stderr}'`;
                        reject(message);
                    }
                    //need to wrap stdout in object
                    //doesn't work otherwise for 'build - t nginximg1 .'
                    resolve({ result: stdout });
                });
            });
        }).then(function (data) {
            //console.log('data:', data);
            let result = {
                command: execCommand,
                raw: data.result,
            };
            return extractResult(result);
        });
        return nodeify_ts_1.default(promise, callback);
    }
}
exports.Docker = Docker;
class Options {
    constructor(machineName, currentWorkingDirectory) {
        this.machineName = machineName;
        this.currentWorkingDirectory = currentWorkingDirectory;
    }
}
exports.Options = Options;
