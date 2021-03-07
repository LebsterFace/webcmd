import {getCurrentFolder} from "../files/filesys.js";
import {setTheme, THEMES} from "./theme.js";
import {parseCommand} from "./parseCommand.js";
import {scrollToBottom} from "../index.js";
import {COMMANDS} from "../commands/commands.js";

const history = document.getElementById("history"),
	prefix = document.getElementById("prefix");

export function run(string) {
	printWithPrefix(string); // Print the command out to the history
	if (/^[ \t\n]*$/.test(string)) return; // Blank lines do nothing
	
	// Parsing beforehand allows catching silly errors like non-terminating quotes
	const pipeChain = parseCommand(string.trim());

	let stdout = "",
		handler;

	const replacePlaceholders = arg => arg.replace(/\r(.+?)\r/g, (_, name) => eval(name));

	for (const {command, args, flags} of pipeChain) {
		handler = getHandler(command);

		// Handle bad commands
		if (handler === null) {
			printError(`Unknown command '${command}'`);
			return;
		}

		// In every argument, '\r[code]\r' will be evaluated and replaced with the result of the evaluation
		stdout = handler.run(stdout, args.map(replacePlaceholders), flags);
	}

	if (handler.shouldPrint) {
		if (Array.isArray(stdout)) stdout = stdout.join(" ");
		print(stdout);
	}
}

/**
 * Get the command handler based on a command name
 * @param {string} name Name of the command
 * @returns The handler for name. If it does not exist returns null
 */
export function getHandler(name) {
	name = name.toLowerCase();
	if (name in COMMANDS) return COMMANDS[name];
	for (const current in COMMANDS) if (COMMANDS[current].aliases.includes(name)) return COMMANDS[current];
	return null;
}

function padToPrefix(str) {
	const padding = " ".repeat(prefix.innerText.length);
	return str.replace(/\n/g, "\n" + padding);
}

function printWithPrefix(command) {
	print(prefix.innerText + padToPrefix(command));
}

export function clear() {
	history.innerHTML = "";
	return "";
}

export function printError(message) {
	printJSON({
		text: message,
		color: "red"
	});
	return message;
}

export function print(text) {
	return printJSON({text});
}

export function printJSON(obj) {
	const spanElement = document.createElement("span"),
		textElement = document.createTextNode(obj.text);

	spanElement.appendChild(textElement);

	if (typeof obj.color === "string") {
		spanElement.style.color = obj.color;
	}

	if (typeof obj.background === "string") {
		spanElement.style.backgroundColor = obj.background;
	}

	if (typeof obj.noflush !== "boolean" || !obj.noflush) {
		spanElement.classList.add("line");
	}

	history.appendChild(spanElement);
	scrollToBottom();
	return obj.text;
}

export function updatePrompt() {
	prefix.innerText = getCurrentFolder().getPathString() + "$ ";
}

export function init() {
	clear();
	updatePrompt();
	print("WebCMD v2.62");
}

init();
setTheme(THEMES.default);
