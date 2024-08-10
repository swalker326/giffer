import { GoogleStrategy } from "remix-auth-google";
import { Authenticator } from "remix-auth";
import { authSessionStorage } from "~/services/authSession.server";
import { user as userTable, type InsertUser } from "@giffer/db/models/user";
import { db } from "@giffer/db";

// Create an instance of the authenticator, pass a generic with what
// strategies will return and will store in the session
export const authenticator = new Authenticator<InsertUser>(authSessionStorage);

const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
if (!clientId) {
	throw new Error("Missing GOOGLE_CLIENT_ID env var");
}
if (!clientSecret) {
	throw new Error("Missing GOOGLE_CLIENT_SECRET env var");
}

const googleStrategy = new GoogleStrategy(
	{
		clientID: "GOOGLE_CLIENT_ID",
		clientSecret: "GOOGLE_CLIENT_SECRET",
		callbackURL: "/auth/google/callback",
	},
	async ({ accessToken, refreshToken, extraParams, profile }) => {
		// Get the user data from your DB or API using the tokens and profile
		// return User.findOrCreate({ email: profile.emails[0].value });
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

authenticator.use(googleStrategy);
