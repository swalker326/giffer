import * as video from "./video";
import * as user from "./user";
import * as userImage from "./user-image";
import * as session from "./session";
import * as permission from "./permission";
import * as role from "./role";
import * as connection from "./connection";
import * as roleToUser from "./role-to-user";
import * as permissionToRole from "./permission-to-role";
import * as seeded from "./seed";
import * as message from "./message";
import * as conversation from "./conversation";

export const schema = {
	...conversation,
	...message,
	...seeded,
	...video,
	...user,
	...userImage,
	...session,
	...permission,
	...role,
	...connection,
	...roleToUser,
	...permissionToRole,
};
