import { stateEventInjector } from "../state/index";

let generateInputContainer = containerProperty => {
	if(containerProperty.active) {
		let container = document.createElement("DIV");
		containerProperty.className ? container.classList.add(containerProperty.className) : null;
		return container;
	}
};

let generateInputLabel = (id, text) => {
	let label = document.createElement("LABEL");
	label.textContent = text;
	label.setAttribute("for", id);

	return label;
};

let generateInput = (id, name, type) => {
	let input = document.createElement("INPUT");
	input.id = id;
	input.name = name;
	input.type = type;

	return input;
};

let generateFormInputs = (id, fields, containerProperty) => {
	if(containerProperty.active) {
		Array.from(fields).forEach(element => {
			let container = generateInputContainer(containerProperty);
			let label = generateInputLabel(element, element);
			let input = generateInput(element, element, "text");
	
			stateEventInjector(input);
			container.appendChild(label);
			container.appendChild(input);
	
			document.getElementById(id).appendChild(container);
		});

	} else {
		Array.from(fields).forEach(element => {
			let label = generateInputLabel(element, element);
			let input = generateInput(element, element, "text");
	
			stateEventInjector(input);
			document.getElementById(id).appendChild(label);
			document.getElementById(id).appendChild(input);
		});
	}
};

export { generateFormInputs };