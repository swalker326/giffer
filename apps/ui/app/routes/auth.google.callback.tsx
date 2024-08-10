import { destroyRedirectToHeader } from "~/utils/redirect-cookie.server";
import type { LoaderFunctionArgs } from "@remix-run/node";
import {
	authenticator,
	getSessionExpirationDate,
	getUserId,
	sessionKey,
	signupWithConnection,
} from "~/services/auth.server";
import { createToastHeaders, redirectWithToast } from "~/utils/toast.server";
import { db } from "@giffer/db";
import { connection as connectionTable } from "@giffer/db/models/connection";
import { session as sessionTable } from "@giffer/db/models/session";
import { combineHeaders } from "~/utils/misc";
import { handleNewSession } from "./login/utils";
import { safeRedirect } from "remix-utils/safe-redirect";
import { authSessionStorage } from "~/services/authSession.server";

const destroyRedirectTo = { "set-cookie": destroyRedirectToHeader };

export const loader = async ({ request }: LoaderFunctionArgs) => {
	console.log(request);
	const authResult = await authenticator
		.authenticate("google", request, {
			throwOnError: true,
		})
		.then(
			(data) => ({ success: true, data }) as const,
			(error) => ({ success: false, error }) as const,
		);
	if (!authResult.success) {
		console.error(authResult.error);
		throw await redirectWithToast(
			"/login",
			{
				title: "Auth Failed",
				description: "There was an error authenticating with google.",
				type: "error",
			},
			{ headers: destroyRedirectTo },
		);
	}
	const { data: profile } = authResult;
	const existingConnection = await db.query.connection.findFirst({
		columns: { userId: true },
		where: (provider, { eq, and }) =>
			and(
				eq(provider.providerName, "google"),
				eq(provider.providerId, profile.id),
			),
	});
	const userId = await getUserId(request);
	if (existingConnection && userId) {
		if (existingConnection.userId === userId) {
			return redirectWithToast(
				"/settings/profile/connections",
				{
					title: "Already Connected",
					description: `Your "${profile.username}" google account is already connected.`,
				},
				{ headers: destroyRedirectTo },
			);
		}
		return redirectWithToast(
			"/settings/profile/connections",
			{
				title: "Already Connected",
				description: `The "${profile.username}" google account is already connected to another account.`,
			},
			{ headers: destroyRedirectTo },
		);
	}
	if (userId) {
		// If we're already logged in, then link the account
		db.insert(connectionTable).values({
			providerName: "google",
			providerId: profile.id,
			userId,
		});
		return redirectWithToast(
			"/settings/profile/connections",
			{
				title: "Connected",
				type: "success",
				description: `Your "${profile.username}" google account has been connected.`,
			},
			{ headers: destroyRedirectTo },
		);
	}
	if (existingConnection) {
		// Connection exists already? Make a new session
		return makeSession({ request, userId: existingConnection.userId });
	}
	// if the email matches a user in the db, then link the account and
	// make a new session
	const user = await db.query.user.findFirst({
		columns: { id: true },
		where: (user, { eq }) => eq(user.email, profile.email.toLowerCase()),
	});

	if (user) {
		await db.insert(connectionTable).values({
			providerName: "google",
			providerId: profile.id,
			userId: user.id,
		});
		return makeSession(
			{ request, userId: user.id },
			{
				headers: await createToastHeaders({
					title: "Connected",
					description: `Your "${profile.username}" google account has been connected.`,
				}),
			},
		);
	}
	const authSession = await authSessionStorage.getSession(
		request.headers.get("cookie"),
	);
	const session = await signupWithConnection({
		email: profile.email,
		providerId: profile.id,
		providerName: "google",
	});
	if (!session) {
		throw new Error("Failed to create session");
	}
	authSession.set(sessionKey, session.id);
	const headers = new Headers();
	headers.append(
		"set-cookie",
		await authSessionStorage.commitSession(authSession, {
			expires: session.expirationDate,
		}),
	);
	return redirectWithToast(
		safeRedirect("/optimize"),
		{ title: "Welcome", description: "Thanks for signing up!" },
		{ headers },
	);
};

async function makeSession(
	{
		request,
		userId,
		redirectTo,
	}: { request: Request; userId: string; redirectTo?: string | null },
	responseInit?: ResponseInit,
) {
	redirectTo ??= "/";
	const session = await db
		.insert(sessionTable)
		.values({
			// select: { id: true, expirationDate: true, userId: true },
			// data: {
			expirationDate: getSessionExpirationDate(),
			userId,
			// },
		})
		.returning({
			id: sessionTable.id,
			expirationDate: sessionTable.expirationDate,
			userId: sessionTable.userId,
		});
	return handleNewSession(
		{ request, session: session[0], redirectTo, remember: true },
		{ headers: combineHeaders(responseInit?.headers, destroyRedirectTo) },
	);
}
