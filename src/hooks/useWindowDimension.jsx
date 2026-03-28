import { useState, useEffect } from "react"

export function useWindowDimension() {
	const [dimension, setDimension] = useState([
		window.innerWidth,
		window.innerHeight,
	])
	useEffect(() => {
		const debouncedResizeHandler = debounce(() => {
			setDimension([window.innerWidth, window.innerHeight])
		}, 100) // 100ms
		window.addEventListener("resize", debouncedResizeHandler)
		return () => window.removeEventListener("resize", debouncedResizeHandler)
	}, []) // Note this empty array. this effect should run only on mount and unmount
	return dimension
}

function debounce(fn, ms) {
	let timer
	return (_) => {
		clearTimeout(timer)
		timer = setTimeout((_) => {
			timer = null
			fn.apply(this, arguments)
		}, ms)
	}
}
