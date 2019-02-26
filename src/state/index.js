let stateEventInjector = input => {
	input.addEventListener("change", () => {
		history.replaceState(Object.defineProperty(history.state, input.name, {
			enumerable: true,
			writable: true,
			value: input.value
		}), "formstep1", location.hash);
	});
};

export { stateEventInjector	 };