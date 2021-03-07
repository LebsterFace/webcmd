import {chr, ord} from "../utils.js";
import {root} from "./filesys.js";

/**
 * Error in the filesystem
 */
export class FileError extends Error {
	constructor(message) {
		super(message);
		this.name = "FileError";
	}
}

/**
 * Directory which can contain multiple files/folders
 */
export class Folder {
	constructor(name, contents) {
		name = name.trim().replace(/ |\t|\n|\r/g, "_");
		validateFolderName(name);
		this.name = name;
		this.contents = contents;
		this.parent = null;
		this.isRoot = false;

		this.contents.forEach(o => (o.parent = this));
	}

	getParent() {
		if (this.isRoot) return this;
		return this.parent;
	}

	getIfExists(name) {
		if (name === "") {
			return this;
		} else if (/^\.+$/g.test(name)) {
			let result = this;
			for (let i = 0; i < name.length - 1; i++) result = result.getParent();
			return result;
		} else if (name === "~") {
			return root;
		}

		const result = this.contents.find(o => o.name === name);
		return result ? result : null;
	}

	get(name) {
		const result = this.getIfExists(name);
		if (result) return result;
		throw new FileError(`No such file/folder '${name}' in ${this.name}`);
	}

	getOrCreateFile(name) {
		let result = this.getIfExists(name);

		if (result === null) {
			result = new File(name, "");
			this.add(result);
		}

		return result;
	}

	getOrCreateFolder(name) {
		let result = this.getIfExists(name);

		if (result === null) {
			result = new Folder(name, []);
			this.add(result);
		}

		return result;
	}

	contains(name) {
		return this.contents.some(o => o.name === name);
	}

	add(obj) {
		if (this.contains(obj.name)) {
			throw new FileError(`Can't create '${obj.name}' in ${this.name}! A ${obj.constructor.name.toLowerCase()} with that name already exists.`);
		} else {
			obj.parent = this;
			this.contents.push(obj);
			return this;
		}
	}

	getSize() {
		return this.contents.reduce((totalSize, obj) => totalSize + obj.getSize(), 0);
	}

	getPath() {
		let pos = this,
			result = [this.name];

		while (pos.parent !== null) {
			pos = pos.parent;
			result.unshift(pos.name);
		}

		return result;
	}

	getPathString() {
		return this.getPath().join("/");
	}

	getAtPath(path = "") {
		if (path === "~") return root;
		let currentPos = this;
		for (const folderName of path.split("/")) currentPos = currentPos.get(folderName);
		return currentPos;
	}

	createFilePath(path) {
		if (path === "~") return root;
		const splitPath = path.split("/");
		let currentPos = this;

		for (let i = 0; i < splitPath.length - 1; i++) {
			currentPos = currentPos.getOrCreateFolder(splitPath[i]);
		}

		return currentPos.getOrCreateFile(splitPath[splitPath.length - 1]);
	}

	createFolderPath(path) {
		if (path === "~") return root;
		let currentPos = this;
		for (const folderName of path.split("/")) currentPos = currentPos.getOrCreateFolder(folderName);
		return currentPos;
	}
}

/**
 * File containing text
 */
export class File {
	constructor(name, content) {
		name = name.trim().replace(/ |\t|\n|\r/g, "_");
		validateFileName(name);
		this.name = name;
		this.parent = null;
		this.rawBytes = null;
		this.content = content;
	}

	set content(newContent) {
		this.isDynamic = false;
		this.isUnicode = false;

		if (typeof newContent === "function") {
			this.isDynamic = true;
			this.rawBytes = newContent;
		} else {
			const {unicode, value} = getAsUint8Array(newContent);
			this.isUnicode = unicode;
			this.rawBytes = value;
		}

		return newContent;
	}

	get content() {
		if (this.isDynamic) {
			return getAsUint8Array(this.rawBytes()).value;
		} else {
			return this.rawBytes;
		}
	}

	set contentString(v) {
		this.content = v;
	}

	get contentString() {
		const byteContent = this.content,
			dv = new DataView(byteContent.buffer);

		if (this.isUnicode) {
			return Array.from({length: Math.ceil(byteContent.length / 4)}, (_, i) => chr(dv.getUint32(i * 4))).join("");
		} else {
			return Array.from(byteContent).map(chr).join("");
		}
	}

	getSize() {
		return this.content.length;
	}

	getPath() {
		let pos = this,
			result = [this.name];

		while (pos.parent !== null) {
			pos = pos.parent;
			result.unshift(pos.name);
		}

		return result;
	}

	getPathString() {
		return this.getPath().join("/");
	}
}

function validateFileName(name) {
	if (name === "") throw new FileError("Name cannot be blank");
	if (/[`'"?!+\[\]{}:;~\/\\]/g.test(name)) throw new FileError("Name cannot contain special characters");
}

function validateFolderName(name) {
	validateFileName(name);
	if (/[\.]/g.test(name)) throw new FileError("Name cannot contain period");
}

function getAsUint8Array(toConvert) {
	// Can we just leave? Great!
	if (toConvert instanceof Uint8Array) return {value: toConvert, unicode: false};

	if (typeof toConvert === "number") toConvert = toConvert.toString();
	if (typeof toConvert === "string") {
		const split = toConvert.split("").map(ord),
			isUnicode = split.some(e => e > 255);

		const result = new Uint8Array(isUnicode ? toConvert.length * 4 : toConvert.length),
			dv = new DataView(result.buffer);

		if (isUnicode) {
			for (let i = 0; i < toConvert.length; i++) dv.setUint32(i * 4, split[i]);
		} else {
			for (let i = 0; i < toConvert.length; i++) dv.setUint8(i, split[i]);
		}

		return {value: result, unicode: isUnicode};
	}

	throw new Error(`Cannot convert type ${typeof toConvert} to Uint8Array!`);
}
