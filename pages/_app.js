import { CssBaseline } from "@mui/material";
import { ThemeProvider } from "@mui/system";
import theme from "../components/theme";
import "../styles/globals.css";
import "../public/css/progress.css";
import "nprogress/nprogress.css";
import Router from "next/router";
import NProgress from "nprogress";
import axios from "axios";
import { SWRConfig } from "swr";
import nookies from "nookies";
import { config } from '@fortawesome/fontawesome-svg-core'
import '@fortawesome/fontawesome-svg-core/styles.css'
config.autoAddCss = false

NProgress.configure({ showSpinner: false });
Router.onRouteChangeStart = (url) => {
	NProgress.start();
};
Router.onRouteChangeComplete = () => NProgress.done();
Router.onRouteChangeError = () => NProgress.done();

axios.interceptors.request.use(async (config) => {
	if (process.browser) {
		var running = false;
		if (
			!nookies.get(null).access_token &&
			nookies.get(null).refresh_token &&
			!running
		) {
			running = true;
			await fetch("/api/v1/client/auth/refresh_access_token", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					refresh_token: nookies.get(null).refresh_token,
				}),
			})
				.then((res) => res.json())
				.then((data) => {
					nookies.set(null, "access_token", data.data.access_token, {
						expires: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
						path: "/",
					});
					running = false;
				})
				.catch((err) => {
					console.log(err);
				});
		}
		config.headers.authorization = `Bearer ${nookies.get(null).access_token}`;
	}
	return config;
});
function localStorageProvider() {
	if (typeof window !== "undefined") {
		var localStorage = window.localStorage;
		// When initializing, we restore the data from `localStorage` into a map.
		const map = new Map(JSON.parse(localStorage.getItem("app-cache") || "[]"));

		// Before unloading the app, we write back all the data into `localStorage`.
		window.addEventListener("beforeunload", () => {
			const appCache = JSON.stringify(Array.from(map.entries()));
			localStorage.setItem("app-cache", appCache);
		});

		// We still use the map for write & read for performance.
		return map;
	} else return new Map();
}
function MyApp({ Component, pageProps }) {
	return (
		<SWRConfig value={{ provider: localStorageProvider }}>
			<ThemeProvider theme={theme}>
				<CssBaseline />
				<Component {...pageProps} />
			</ThemeProvider>
		</SWRConfig>
	);
}

export default MyApp;
