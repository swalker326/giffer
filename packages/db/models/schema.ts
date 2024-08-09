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

export const schema = {
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
