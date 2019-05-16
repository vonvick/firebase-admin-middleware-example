import RoleController from '../controllers/api/RoleController';
import {
  hasSuperAdminRole,
  decodeFirebaseIdToken,
  isAuthorized
} from '../controllers/middleware/auth.middleware';

const RoleRoute = (router) => {
  // Create a role
  router.route('/role')
    .post(
      decodeFirebaseIdToken,
      isAuthorized,
      hasSuperAdminRole,
      RoleController.createRole
    );

  router.route('/roles')
    .get(
      RoleController.getRoles
    );

  router.route('/role/:id')
    .get(
      RoleController.getRole
    )
    .delete(
      decodeFirebaseIdToken,
      isAuthorized,
      hasSuperAdminRole,
      RoleController.archiveRole
    )
    .put(
      decodeFirebaseIdToken,
      isAuthorized,
      hasSuperAdminRole,
      RoleController.updateRole
    );

  // Delete a role
  router.route('/delete_role/:id')
    .delete(
      decodeFirebaseIdToken,
      isAuthorized,
      hasSuperAdminRole,
      RoleController.deleteRole
    );
}

export default RoleRoute;