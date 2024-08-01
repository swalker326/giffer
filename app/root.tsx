// import type { LinksFunction, MetaFunction } from "@remix-run/node";
// import {
// 	Links,
// 	LiveReload,
// 	Meta,
// 	Outlet,
// 	Scripts,
// 	ScrollRestoration,
// } from "@remix-run/react";

// import tailwindStylesheetUrl from "./styles/tailwind.css";
// import { withSentry } from "@sentry/remix";

// export const links: LinksFunction = () => {
// 	return [{ rel: "stylesheet", href: tailwindStylesheetUrl }];
// };

// export const meta: MetaFunction = () => ({
// 	charset: "utf-8",
// 	title: "Giffer",
// 	viewport: "width=device-width,initial-scale=1",
// });

// function App() {
// 	return (
// 		<html lang="en" className="h-full">
// 			<head>
// 				<Meta />
// 				<Links />
// 			</head>
// 			<body className="h-full">
// 				<Outlet />
// 				<ScrollRestoration />
// 				<Scripts />
// 				<LiveReload />
// 			</body>
// 		</html>
// 	);
// }
// export default withSentry(App);

import {
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
} from "@remix-run/react";
import "./styles/tailwind.css";

export function Layout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<Meta />
				<Links />
			</head>
			<body>
				{children}
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	);
}

export default function App() {
	return <Outlet />;
}
