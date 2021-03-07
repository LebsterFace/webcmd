/**
 * Creates a blank ParsedCommand
 * @returns Newly created ParsedCommand
 */
function blankCommand() {
	return {args: [""], flags: {}, canTakeFlags: true};
}

export function parseCommand(string) {
	let inString = null,
		cmd = blankCommand(),
		inFlag = false;

	const commands = [cmd];

	function handleFlag() {
		if (!inFlag) return;
		inFlag = false;

		// The flag is the last argument in the array
		const flag = cmd.args[cmd.args.length - 1];
		if (flag === "-") {
			// -- flag will prevent more flags from being parsed
			cmd.canTakeFlags = false;
		} else if (flag.includes("=")) {
			// If a value is specified, update the property in the flags object
			const split = flag.split("=");
			cmd.flags[split[0]] = split[1];
		} else {
			// Otherwise the flag should just be set to true to indicate it was set
			cmd.flags[flag] = true;
		}

		// Remove the flag from the arguments array
		cmd.args.splice(cmd.args.length - 1, 1);
	}

	for (let i = 0; i < string.length; i++) {
		const char = string[i];

		// Escaped characters
		if (char === "\\") {
			if (i + 1 === string.length) {
				// Quad backslash for JS
				// TODO: Some pointer '^' for where the error occoured in the string
				throw new Error("No character to escape! Did you mean '\\\\'?");
			}

			const nextChar = string[++i];
			// Some escaped characters have special cases
			if (nextChar === "n") {
				// Newline
				cmd.args[cmd.args.length - 1] += "\n";
			} else if (nextChar === "t") {
				// Tab
				cmd.args[cmd.args.length - 1] += "\t";
			} else {
				// Otherwise just append the escaped character to the last argument
				cmd.args[cmd.args.length - 1] += nextChar;
			}
		}

		// If this isn't the first command, this isn't the last character, and the next two characters are $$
		else if (commands.length > 1 && i + 1 !== string.length && char === "$" && string[i + 1] === "$") {
			// Then append stdout to the last argument
			// '\r[code]\r' will be evaluated and replaced with the result of the evaluation by run()
			cmd.args[cmd.args.length - 1] += "\rstdout\r";
			i++;
		}
		
		// Ending a string
		else if (char === inString) {
			inString = null;
		}
		
		// Start a new string on " or '
		else if (char === "'" || char === '"' && inString === null) {
			inString = char;
		}
		
		// Piping commands
		else if (char === "|" && inString === null) {
			cmd = blankCommand();
			commands.push(cmd);
		}
		
		// Whitespace following a non-empty argument indicates the start of a new argument
		else if ((char === " " || char === "\t") && cmd.args[cmd.args.length - 1] !== "" && inString === null) {
			handleFlag();
			cmd.args.push("");
		}
		
		// Argument starting with a dash character means we're in a flag
		else if (char === "-" && !inFlag && cmd.canTakeFlags && cmd.args[cmd.args.length - 1] === "" && inString === null) {
			inFlag = true;
		}
		
		// Otherwise just append
		else cmd.args[cmd.args.length - 1] += char;
	}

	handleFlag();

	if (inString !== null) {
		throw new Error("Non-terminating string in command");
	}

	for (const C of commands) C.command = C.args.shift().trim();
	return commands;
}
