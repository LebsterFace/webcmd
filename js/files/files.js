import {root} from "./filesys.js";

// Oh nooo I have to comment this!!!

export class FileError extends Error {
	constructor(message) {
		super(message);
		this.name = "FileError";
	}
}

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

export class File {
	constructor(name, content) {
		name = name.trim().replace(/ |\t|\n|\r/g, "_");
		validateFileName(name);
		this.name = name;
		this.content = content;
		this.parent = null;
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

export class DynamicFile extends File {
	constructor(name, contentFunction) {
		super(name, "");
		this.contentFunction = contentFunction;
	}

	get content() {
		return this.contentFunction();
	}

	set content(v) {}
}

function validateFileName(name) {
	if (name === "") throw new FileError("Name cannot be blank!");
	if (/[`'"?!+\[\]{}:;~\/\\]/g.test(name)) throw new FileError("Name cannot contain special characters!");
}

function validateFolderName(name) {
	validateFileName(name);
	if (/[\.]/g.test(name)) throw new FileError("Name cannot contain period!");
}
