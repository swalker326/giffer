import { redirect } from "@remix-run/node";
import { safeRedirect } from "remix-utils/safe-redirect";
import { sessionKey } from "~/services/auth.server";
import { authSessionStorage } from "~/services/authSession.server";
import { combineResponseInits } from "~/utils/misc";

const unverifiedSessionIdKey = "unverified-session-id";
const rememberKey = "remember";

export async function handleNewSession(
	{
		request,
		session,
		redirectTo,
		remember,
	}: {
		request: Request;
		session: { userId: string; id: string; expirationDate: Date };
		redirectTo?: string;
		remember: boolean;
	},
	responseInit?: ResponseInit,
) {
	const authSession = await authSessionStorage.getSession(
		request.headers.get("cookie"),
	);
	authSession.set(sessionKey, session.id);

	return redirect(
		safeRedirect(redirectTo),
		combineResponseInits(
			{
				headers: {
					"set-cookie": await authSessionStorage.commitSession(authSession, {
						expires: remember ? session.expirationDate : undefined,
					}),
				},
			},
			responseInit,
		),
	);
}
