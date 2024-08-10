import { Form } from "@remix-run/react";

// app/routes/login.tsx
export default function Login() {
	return (
		<Form action="/auth/google" method="post">
			<button type="submit">Login with Google</button>
		</Form>
	);
}
