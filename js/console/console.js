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
	console.time("Parsing");
	const pipeChain = parseCommand(string.trim());
	console.timeEnd("Parsing");

	let stdout = "",
		handler;

	const replacePlaceholders = arg => arg.replace(/\r(.+?)\r/g, (_, name) => eval(name));

	console.time("Entire command");
	for (const {command, args, flags} of pipeChain) {
		handler = getHandler(command);
		console.log(`\nExecuting single command %c${command}`, "color:#0F0;background:#000");
		console.time("Single");

		// Handle bad commands
		if (handler === null) {
			console.timeEnd("Single");
			printError(`Unknown command '${command}'`);
			console.timeEnd("Entire command");
			return;
		}

		// In every argument, '\r[code]\r' will be evaluated and replaced with the result of the evaluation
		stdout = handler.run(stdout, args.map(replacePlaceholders), flags);
		console.timeEnd("Single");
	}

	console.log("");
	console.timeEnd("Entire command");

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

export function printError(text) {
	return printJSON([{text, color: "red"}]);
}

export function print(text) {
	return printJSON([{text}]);
}

export function parseFormattedString(text) {
	const parsed = [];
	let escaped = false,
		last = "";

	for (let i = 0; i < text.length; i++) {
		const char = text.charAt(i);
		if (escaped) {
			last += char;
		} else if (char === "\\") {
			escaped = true;
		} else if (char === "§") {
			const match = text.slice(i).match(/^§(.+?)\[(.*?)\]/s);
			if (match === null) last += char;
			parsed.push(last);
			last = "";
			parsed.push({type: match[1], content: match[2]});
			i += match[0].length - 1;
		} else {
			last += char;
		}
	}

	parsed.push(last);
	return parsed.filter(n => typeof n === "object" || n.length > 0);
}

export function printFormatted(text) {
	const parsed = parseFormattedString(text),
		state = {},
		result = [];

	const getResultElement = element => {
		return {...state, text: element};
	};

	for (const element of parsed) {
		if (typeof element === "string") {
			result.push(getResultElement(element));
		} else {
			state[element.type] = element.content;
		}
	}

	printJSON(result);
}

export function printJSON(objects, flush = true) {
	const container = document.createElement("span");
	if (flush) container.classList.add("line");

	for (const obj of objects) {
		const spanElement = document.createElement("span"),
			textElement = document.createTextNode(obj.text);

		spanElement.appendChild(textElement);

		if (typeof obj.color === "string") {
			spanElement.style.color = obj.color;
		}

		if (typeof obj.background === "string") {
			spanElement.style.backgroundColor = obj.background;
		}

		container.appendChild(spanElement);
	}

	history.appendChild(container);
	scrollToBottom();
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
