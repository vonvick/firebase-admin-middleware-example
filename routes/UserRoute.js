import UserController from '../controllers/api/UserController';
import {
  decodeFirebaseIdToken,
  isAuthorized,
  hasAdminRole,
} from '../controllers/middleware/auth.middleware';
import { hasUserAccessControl } from '../controllers/middleware/user.middleware';

const UserRoute = (router) => {
  // Get user route
  router.route('/user/:id')
    .get(
      decodeFirebaseIdToken,
      isAuthorized,
      UserController.getUser
    )
    .put(
      decodeFirebaseIdToken,
      isAuthorized,
      hasUserAccessControl,
      UserController.updateUser
    )
    .delete(
      decodeFirebaseIdToken,
      isAuthorized,
      hasAdminRole,
      UserController.archiveUser
    );
}

export default UserRoute;
