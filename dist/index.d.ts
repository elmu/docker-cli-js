export declare class Docker {
    private options;
    constructor(options?: IOptions);
    command(command: string, callback?: (err: any, data: any) => void): Promise<any>;
}
export interface IOptions {
    machineName?: string;
    currentWorkingDirectory?: string;
}
export declare class Options implements IOptions {
    machineName: string;
    currentWorkingDirectory: string;
    constructor(machineName?: string, currentWorkingDirectory?: string);
}
