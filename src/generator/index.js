let generateFormInputs = fields => {
	const inputs = Array.from(fields).map(element => {
		let container = document.createElement("DIV");
		let label = document.createElement("LABEL");
		let input = document.createElement("INPUT");

		label.textContent = element.toUpperCase();
		input.name = element;

		container.appendChild(label);
		container.appendChild(input);

		return container;
	});

	return inputs;
};

let renderFormInputs = (inputs, id) => {
	inputs.forEach(element => {
		document.getElementById(id).appendChild(element);
	});
};

export { generateFormInputs, renderFormInputs };