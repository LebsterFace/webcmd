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

		const arg = cmd.args[cmd.args.length - 1];
		if (arg === "-") {
			cmd.canTakeFlags = false;
		} else if (arg.includes("=")) {
			const split = arg.split("=");
			cmd.flags[split[0]] = split[1];
		} else {
			cmd.flags[arg] = true;
		}

		cmd.args.splice(cmd.args.length - 1, 1);
	}

	for (let i = 0; i < string.length; i++) {
		const char = string[i];

		if (char === "\\") {
			const nextChar = string[++i];
			if (nextChar === "n") {
				cmd.args[cmd.args.length - 1] += "\n";
			} else if (nextChar === "t") {
				cmd.args[cmd.args.length - 1] += "\t";
			} else {
				cmd.args[cmd.args.length - 1] += nextChar;
			}
		} else if (commands.length > 1 && i + 1 !== string.length && char === "$" && string[i + 1] === "$") {
			cmd.args[cmd.args.length - 1] += "\rstdout\r";
			i++;
		} else if (char === inString) {
			inString = null;
		} else if (inString === null) {
			if (char === "'" || char === '"') {
				inString = char;
			} else if (char === "|") {
				cmd = blankCommand();
				commands.push(cmd);
			} else if (char === " " && cmd.args[cmd.args.length - 1] !== "") {
				handleFlag();
				cmd.args.push("");
			} else if (!inFlag && cmd.canTakeFlags && char === "-" && cmd.args[cmd.args.length - 1] === "") {
				inFlag = true;
			} else {
				cmd.args[cmd.args.length - 1] += char;
			}
		} else {
			cmd.args[cmd.args.length - 1] += char;
		}
	}

	handleFlag();

	return commands.map(c => {
		const args = c.args.filter(a => !/^[ \t]*$/.test(a)),
			flags = c.flags,
			command = args.shift().trim();

		return {command, args, flags};
	});
}
