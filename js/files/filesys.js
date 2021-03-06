import {updatePrompt} from "../console/console.js";
import {randomInt} from "../utils.js";
import {File, Folder, DynamicFile} from "./files.js";

export const root = new Folder("root", [
	new Folder("dev", [
		new DynamicFile("asciikb", () => Array.from({length: 1024}, x => String.fromCharCode(randomInt(32, 126))).join("")),
		new DynamicFile("integer", () => Math.round(Math.random() * 1000000).toString())
	]),
	new Folder("user", [
		new File("lorem.txt", "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.")
	])
]);

root.isRoot = true;
root.name = "";

let currentPath = [];

export function getCurrentFolder() {
	return currentPath.reduce((acc, cv) => acc.get(cv), root);
}

export function navigateTo(path) {
	currentPath = getCurrentFolder().getAtPath(path).getPath().slice(1);
	updatePrompt();
	return path;
}

export function formatSize(size) {
	const units = ["B", "KiB", "MiB", "GiB", "TiB"];
	let unit = 0;

	while (size >= 1024) {
		size /= 1024;
		unit++;
	}

	return size.toLocaleString("en-GB", {maximumSignificantDigits: 2}) + units[unit];
}

export function listRecursive(obj, depth = 0) {
	if (obj instanceof Folder && obj.contents.length > 0) {
		return "  ".repeat(depth) + obj.name + "/\n" + obj.contents.map(o => listRecursive(o, depth + 1)).join("\n");
	}

	return "  ".repeat(depth) + obj.name;
}
