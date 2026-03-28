import axios from "axios"
import Cookies from "universal-cookie"
import toast from "react-hot-toast"

const cookies = new Cookies()

class NonInternalRequest {
	constructor(endpoint, parameters = {}, url) {
		let options = {
			method: "GET",
			// if there is no url object, then do the root url + endpoint, else use the url
			url: endpoint,
			headers: {
				"Content-Type": "application/json",
			},
		}

		// add POST data
		options["data"] = parameters["data"]
		// add GET data
		options["params"] = parameters["params"]

		// if method != GET (implied above), then change it
		if (parameters["method"] !== undefined) {
			options["method"] = parameters["method"]
		}

		axios(options)
			.then((res) => {
				if (typeof this.then !== "undefined") {
					this.then(res)
				}
			})
			.catch((err) => {
				if (typeof this.catch !== "undefined") {
					this.catch(err)
					toast.error("Something went wrong. Please try again.")
				}
			})
	}
	catch(callback) {
		this.catch = callback
		return this
	}

	then(callback) {
		this.then = callback
		return this
	}
}

export default NonInternalRequest
