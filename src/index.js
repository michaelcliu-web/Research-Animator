import App from "./App"
import ReactDOM from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import { ClerkProvider } from "@clerk/clerk-react"
import { Toaster } from "react-hot-toast"
import * as Sentry from "@sentry/react"
import { BrowserTracing } from "@sentry/tracing"

if (process.env.REACT_APP_IS_PRODUCTION === "true" && process.env.REACT_APP_SENTRY_DSN) {
	Sentry.init({
		dsn: process.env.REACT_APP_SENTRY_DSN,
		integrations: [new BrowserTracing()],
		tracesSampleRate: 0.5,
	})
}

const clerkPubKey = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY

const root = ReactDOM.createRoot(document.getElementById("root"))
root.render(
	<BrowserRouter>
		<ClerkProvider publishableKey={clerkPubKey}>
			<App />
			<Toaster />
		</ClerkProvider>
	</BrowserRouter>
)
