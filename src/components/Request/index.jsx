import axios from "axios"
import Cookies from "universal-cookie"
import toast from "react-hot-toast"

const cookies = new Cookies()

class Request {
	constructor(endpoint, parameters = {}, url) {
		let options = {
			method: "GET",
			// if there is no url object, then do the root url + endpoint, else use the url
			url: process.env.REACT_APP_API_URL + endpoint,
			headers: {
				"Content-Type": "application/json",
				Authorization: "Bearer " + cookies.get("token"),
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

export default Request
