import { generateFormInputs, renderFormInputs } from "./generator/index";

(function(window){
	function demetria(init) {
		
		let formInputs = generateFormInputs(init.inputs);
		renderFormInputs(formInputs, "here");

		let outputObject = {};
		
		// Function to test with the library is loaded correctly.
		outputObject.showUp = function(message) {
			return message;
		};

		return outputObject;
	}
	
	if(typeof(window.demetria) === "undefined") {
		window.demetria = demetria;
	}

})(window);