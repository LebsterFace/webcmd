export const

// Random integer in range
randomInt = (min, max) => Math.floor(Math.random() * (max - min) + min),

// Get number from a string
getNum = (str, options) => {
	const result = (options.whole ? parseInt : parseFloat)(str);
	if (isNaN(result)) throw new Error(`'${str}' is not a number`);
	if (options.positive && result < 0) throw new Error("Number cannot be negative");

	return result;
};