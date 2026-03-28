import { TailSpin } from "react-loading-icons"
import "./spinner.css"

const Spinner = () => {
	return (
		<div className='spinner'>
			<TailSpin stroke='black' />
		</div>
	)
}

export default Spinner
