import {Folder} from "../files/files.js";
import {getCurrentFolder} from "../files/filesys.js";

export const STDIN = {
	SEPERATE: 1,
	BEFORE_ARGS: 2,
	AFTER_ARGS: 3,
	OR_ARGS_STR: 4,
	OR_ARGS: 5
};

export const TYPE = {
	NEW_FILE: 1,
	NEW_FOLDER: 2,
	OPERATE_ON_FILE: 3,
	OPERATE_ON_FOLDER: 4,
	OPERERATE_ON_FS: 5
};

export const INPUT_TYPE = {
	ARRAY: 1,
	STRING: 2
};

const DEFAULT_OPTIONS = {
	code: () => {
		throw new Error("No function specified.");
	},
	shouldPrint: false,
	stdin: STDIN.OR_ARGS_STR,
	input: [INPUT_TYPE.STRING],
	aliases: [],
	flags: {},
	trimArgs: true,
	type: []
};

export class CommandError extends Error {
	constructor(msg) {
		super(msg);
		this.name = "CommandError";
	}
}

export class ExecutionError extends Error {
	constructor(msg) {
		super(msg);
		this.name = "ExecutionError";
	}
}

export class Command {
	constructor(name, options) {
		this.name = name;
		Object.assign(this, DEFAULT_OPTIONS, options);
		if (!Array.isArray(this.input) || this.input.length === 0) {
			throw new Error(`No input typed specified for ${name}`);
		}
	}

	getFlag(name) {
		for (const flag in this.flags) {
			if (flag === name || this.flags[flag].includes(name)) {
				return flag;
			}
		}

		return null;
	}

	normalizeFlags(flags) {
		const result = {};
		for (const flag in this.flags) result[flag] = null;

		for (const userFlag in flags) {
			const flag = this.getFlag(userFlag.toLowerCase());
			if (flag === null) {
				throw new CommandError(`No such flag '${userFlag}' for ${this.name}`);
			} else {
				result[flag] = flags[userFlag];
			}
		}

		return result;
	}

	run(stdin, args, flags) {
		if (this.trimArgs) {
			args = args.filter(a => !/^[ \t]*$/.test(a));
		}

		if (this.input.includes(INPUT_TYPE.ARRAY)) {
			if (!Array.isArray(stdin) && !this.input.includes(INPUT_TYPE.STRING)) {
				throw new CommandError(`${this.name} can only be passed an array`);
			}
		} else if (Array.isArray(stdin)) {
			stdin = stdin.join(" ");
		}

		const opts = {flags: this.normalizeFlags(flags)};

		if (stdin === "") {
			if (this.stdin === STDIN.OR_ARGS_STR) {
				if (stdin === "") stdin = args.join(" ");
			} else if (this.stdin === STDIN.OR_ARGS) {
				if (stdin === "") stdin = args;
			}
		}
		
		if (this.stdin === STDIN.BEFORE_ARGS) {
			args.unshift(stdin);
		} else if (this.stdin === STDIN.AFTER_ARGS) {
			args.push(stdin);
		}

		if (this.type.includes(TYPE.NEW_FILE)) {
			opts.fsObj = getCurrentFolder().createFilePath(args[0]);
		} else if (this.type.includes(TYPE.NEW_FOLDER)) {
			opts.fsObj = getCurrentFolder().createFolderPath(args[0]);
		} else if (this.type.includes(TYPE.OPERATE_ON_FILE)) {
			const file = getCurrentFolder().getAtPath(args[0]);
			if (file instanceof Folder) {
				throw new CommandError(`${this.name} can only be called on a file`);
			}
			opts.fsObj = file;
		} else if (this.type.includes(TYPE.OPERATE_ON_FOLDER)) {
			const folder = getCurrentFolder().getAtPath(args[0]);
			if (folder instanceof Folder) {
				opts.fsObj = folder;
			} else {
				throw new CommandError(`${this.name} can only be called on a folder`);
			}
		} else if (this.type.includes(TYPE.OPERERATE_ON_FS)) {
			const folder = getCurrentFolder().getAtPath(args[0]);
			opts.fsObj = folder;
		}

		return this.code(stdin, args, opts);
	}
}
