import { db } from "@giffer/db";
import { user as userTable } from "@giffer/db/models/user";
import { GoogleStrategy } from "remix-auth-google";

const clientID = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
if (!clientID) {
	throw new Error("Missing GOOGLE_CLIENT_ID env var");
}
if (!clientSecret) {
	throw new Error("Missing GOOGLE_CLIENT_SECRET env var");
}

export const googleStrategy = new GoogleStrategy(
	{
		clientID,
		clientSecret,
		callbackURL: "/auth/google/callback",
	},
	async ({ accessToken, refreshToken, extraParams, profile }) => {
		// Get the user data from your DB or API using the tokens and profile
		const user = await db.query.user.findFirst({
			where: (user, { eq }) => eq(user.email, profile.emails[0].value),
		});
		if (user) {
			return user;
		}
		const [newUser] = await db
			.insert(userTable)
			.values({
				email: profile.emails[0].value,
			})
			.returning();
		return newUser;
	},
);
