import { db, schema } from "@giffer/db";
import type { SelectConnection } from "@giffer/db/models/connection";
import type { SelectUser } from "@giffer/db/models/user";
import { redirect } from "@remix-run/node";
import { Authenticator } from "remix-auth";
import { authSessionStorage } from "~/services/authSession.server";
import { downloadFile } from "~/utils/misc";
import { googleStrategy } from "./providers/google";

export type ProviderUser = {
	id: string;
	email: string;
	username?: string;
	name?: string;
	imageUrl?: string;
};

export const SESSION_EXPIRATION_TIME = 1000 * 60 * 60 * 24 * 30; // 30 days
export const getSessionExpirationDate = () =>
	new Date(Date.now() + SESSION_EXPIRATION_TIME);

export const authenticator = new Authenticator<ProviderUser>(
	authSessionStorage,
);

authenticator.use(googleStrategy);

export const sessionKey = "sessislaonId";
export async function getUserId(request: Request) {
	const authSession = await authSessionStorage.getSession(
		request.headers.get("cookie"),
	);
	const sessionId = authSession.get(sessionKey);
	if (!sessionId) return null;
	const session = await db.query.session.findFirst({
		with: { user: true },
		columns: { id: true, expirationDate: true },
		where: (session, { eq, and, gt }) =>
			and(eq(session.id, sessionId), gt(session.expirationDate, new Date())),
	});

	if (!session?.user) {
		throw redirect("/", {
			headers: {
				"set-cookie": await authSessionStorage.destroySession(authSession),
			},
		});
	}
	return session.user.id;
}
export async function requireAnonymous(request: Request) {
	const userId = await getUserId(request);
	if (userId) {
		throw redirect("/");
	}
}
export async function requireUserId(
	request: Request,
	{ redirectTo }: { redirectTo?: string | null } = {},
) {
	const userId = await getUserId(request);
	if (!userId) {
		const requestUrl = new URL(request.url);
		redirectTo =
			redirectTo === null
				? null
				: redirectTo ?? `${requestUrl.pathname}${requestUrl.search}`;
		const loginParams = redirectTo ? new URLSearchParams({ redirectTo }) : null;
		const loginRedirect = ["/login", loginParams?.toString()]
			.filter(Boolean)
			.join("?");
		throw redirect(loginRedirect);
	}
	return userId;
}

export async function signupWithConnection({
	email,
	providerId,
	providerName,
	imageUrl: rawImageUrl,
}: {
	email: SelectUser["email"];
	providerId: SelectConnection["providerId"];
	providerName: SelectConnection["providerName"];
	imageUrl?: string;
}) {
	const role = await db.query.role.findFirst({
		where: (role, { eq }) => eq(role.name, "user"),
	});
	if (!role) {
		throw new Error("User role not found");
	}
	const user = await db
		.insert(schema.user)
		.values({
			email: email.toLowerCase(),
		})
		.returning({ id: schema.user.id });
	await db.insert(schema.connection).values({
		providerId,
		providerName,
		userId: user[0].id,
	});

	const newSession = await db
		.insert(schema.session)
		.values({
			expirationDate: getSessionExpirationDate(),
			userId: user[0].id,
		})
		.returning();
	const imageBlob = rawImageUrl ? await downloadFile(rawImageUrl) : null;
	if (imageBlob !== null) {
		await db.insert(schema.userImage).values({
			...imageBlob,
			userId: user[0].id,
		});
	}
	const session = await db.query.session.findFirst({
		where: (session, { eq }) => eq(session.id, newSession[0].id),
		columns: { id: true, expirationDate: true },
	});
	return session;
}
