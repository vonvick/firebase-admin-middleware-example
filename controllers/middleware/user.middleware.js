import {
  forbiddenResponse
} from '../helpers/common_response';
import database from '../../models';

/**
 * hasAccessControl checks if the user has the right admin right
 *
 * @param {Object} req the request object
 * @param {Object} res the response object
 * @param {Function} next the callback function
 *
 * @returns {Object} validity response
 */
export const hasUserAccessControl = async (req, res, next) => {
  const user = await database.User.findOne({ where: { id: req.user.userId} });
  const adminRole = await database.Role.findAll({ where: { rank: { lte: 2 } } });
  const roleIds = adminRole.map((role) => role.id);
  let requestParam = req.params.id;
  // In case user is requesting with uid
  if (!parseInt(requestParam, 10)) {
    const authRecord = await database.AuthId.find({ where: { uid: requestParam } });
    requestParam = authRecord.userId;
  }

  if (roleIds.includes(req.user.roleId) || parseInt(user.id, 10) === parseInt(requestParam, 10)) {
    next();
  } else {
    return forbiddenResponse(res, { data: 'You are not allowed to perform this action'})
  }
};
