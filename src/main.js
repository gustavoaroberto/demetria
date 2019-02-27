import { generateFormInputs } from "./generator/index";

(function(window){
	function demetria(init) {

		history.pushState({}, "formstep1", "#1");

		generateFormInputs("here", init.form["1"].inputs, init.inputContainer);
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