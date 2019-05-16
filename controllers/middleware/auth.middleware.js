import firebaseAdmin from '../../firebase';
import database from '../../models';
import {
  forbiddenResponse,
  unAuthorizedRequest,
  badRequest,
  serverErrorResponse
} from '../helpers/common_response';

const roleRanks = {
  superAdmin: 1,
  admin: 2,
  user: 3
};


export const decodeFirebaseIdToken = async (req, res, next) => {
  if (!req.headers.id_token) {
    return badRequest(res, { message: 'You did not specify any idToken for this request'})
  }

  try {
    const userPayload = await firebaseAdmin.auth().verifyIdToken(req.headers.id_token);

    req.user = userPayload;

    next();
  } catch (error) {
    /** 
     * Specifically re-authenticate a user if the id token expired, this is to fix a few bugs on the front-end
     */
    const errorCode = error.errorInfo.code;
    const errorMessage = error.errorInfo.message;
    if(errorCode === 'auth/argument-error' &&
      errorMessage === 'Firebase ID token has expired. Get a fresh token from your client app and try again (auth/id-token-expired). See https://firebase.google.com/docs/auth/admin/verify-id-tokens for details on how to retrieve an ID token.' &&
      req.headers.header_token
    ) {
      try {
        const userPayload = await firebaseAdmin.auth().verifyIdToken(req.headers.header_token);

        req.user = userPayload;
    
        next();
      } catch(error) {
        return serverErrorResponse(res, error);
      }
    } else {
      return serverErrorResponse(res, error);
    }
  } finally {
    // Return final error
  }
};

/**
 * hasAdminPermission checks if the user has the right admin right
 *
 * @param {Object} req the request object
 * @param {Object} res the response object
 * @param {Function} next the callback function
 *
 * @returns {Object} validity response
 */
export const isAuthorized = async (req, res, next) => {
  if (req.user) {
    next();
  } else {
    return unAuthorizedRequest(res, { data: 'You are not authorized to perform this action. SignUp/Login to continue' });
  }
};

/**
 * hasAdminPermission checks if the user has the right admin right
 *
 * @param {Object} req the request object
 * @param {Object} res the response object
 * @param {Function} next the callback function
 *
 * @returns {Object} validity response
 */
export const hasAdminRole = async (req, res, next) => {
  const role = await database.Role.findOne({ where: { id:  req.user.roleId } });

  if (role.rank <= roleRanks.admin) {
    next();
  } else {
    return forbiddenResponse(res, { data: 'You are not allowed access to this route' });
  }
};

/**
 * hasSuperPermission checks if the user has the right super admin right
 *
 * @param {Object} req the request object
 * @param {Object} res the response object
 * @param {Function} next the callback function
 *
 * @returns {Object} validity response
 */
export const hasSuperAdminRole = async (req, res, next) => {
  const role = await database.Role.findOne({ where: { id:  req.user.roleId } });

  if (role.rank === roleRanks.superAdmin) {
    next();
  } else {
    return forbiddenResponse(res, { data: 'You are not allowed access to this route' });
  }
};
