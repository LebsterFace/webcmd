import {updatePrompt} from "../console/console.js";
import {randomInt} from "../utils.js";
import {File, FileError, Folder, fromJSON} from "./files.js";

const defaultRoot = new Folder("root", [
	// Dev directory contains developer files
	new Folder("dev", [
		// Kibibyte of random ASCII characters
		new File("asciikb", () => Array.from({length: 1024}, x => String.fromCharCode(randomInt(32, 126))).join("")),
		// Kibibyte of random bytes
		new File("randomkb", () => Uint8Array.from({length: 1024}, x => randomInt(0, 255))),
		// Random integer from 0 - 1000000
		new File("integer", () => Math.round(Math.random() * 1000000).toString())
	]),
	// User directory contains user-level files
	new Folder("user", [
		// Lorem ipsum file
		new File("lorem.txt", "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.")
	])
]);

export const root = localStorage.getItem("root") ? fromJSON(JSON.parse(localStorage.getItem("root"))) : defaultRoot;
root.isRoot = true;
root.name = "";

// Array of folder names representing the current terminal path
let currentPath = [];

export function getCurrentFolder() {
	return currentPath.reduce((acc, cv) => acc.get(cv), root);
}

/**
 * Save the root directory to localStorage
 */
export function saveRoot() {
	localStorage.setItem("root", JSON.stringify(root));
}

/**
 * Navigate to a specified path
 * @param {string} path Path to navigate to
 * @returns New current path
 */
export function navigateTo(path) {
	const fsObj = getCurrentFolder().getAtPath(path);
	if (fsObj instanceof Folder) {
		// Slice to remove leading "" (for root folder)
		// FIXME: Should getPath() include the root?
		currentPath = fsObj.getPath().slice(1);
		updatePrompt();
		return fsObj.getPathString();
	} else {
		throw new FileError("Attempting to navigate into a non-folder!");
	}
}

/**
 * Formats a size in bytes with KiB, MiB, GiB and TiB labels
 * @param {number} size Size in bytes
 * @returns Nicely formatted string
 */
export function formatSize(size) {
	const units = ["B", "KiB", "MiB", "GiB", "TiB"]; // I seriously doubt anyone has more than a TiB of RAM, but it's only seven extra characters...
	let unit = 0;

	// -ibi- reigns supreme!
	while (size >= 1024) {
		size /= 1024;
		unit++;
	}

	return size.toLocaleString("en-GB", {maximumSignificantDigits: 2}) + units[unit];
}

/**
 * Lists the contents of a Folder recursively
 * @param {Folder} obj Folder to list contents of
 * @param {number} depth Recursive depth parameter
 * @returns {string} Recursive listing of obj
 */
export function listRecursive(obj, depth = 0) {
	if (obj instanceof Folder && obj.contents.length > 0) {
		return "  ".repeat(depth) + obj.name + "/\n" + obj.contents.map(o => listRecursive(o, depth + 1)).join("\n");
	}

	return "  ".repeat(depth) + obj.name;
}
