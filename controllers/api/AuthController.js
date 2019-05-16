import database from '../../models';
import {
  createNewRecordFromFirebase,
  findUser
} from '../helpers/user';
import firebase from '../../firebase';
import {
  serverErrorResponse,
  successResponse,
  unAuthorizedRequest,
  notFoundError
} from '../helpers/common_response';

const firebaseAuth = async (req, res) => {
  try {
    const user = await firebase.auth().getUser(req.body.user.uid);
    let authRecord, userInstance;

    if (user) {
      authRecord = await database.AuthId.find({ where: { uid: user.uid } });
    }

    if (authRecord) {
      userInstance = await findUser({
        database: database.User,
        userId: authRecord.userId,
        accountType: database.AccountType,
        role: database.Role,
        accounTypeId: req.body.accountTypeId,
        userAccountTypes: database.UserAccountType
      });
    } else {
      userInstance = await createNewRecordFromFirebase({
        userPayload: req.body.user,
        provider: req.body.additionalUserInfo.providerId,
        userModel: database.User,
        roleModel: database.Role,
        authIdModel: database.AuthId,
        accountTypeModel: database.AccountType,
        accountTypeId: req.body.accountTypeId,
        userAccountTypes: database.UserAccountType
      });
    }

    const tokenClaims = {
      roleId: userInstance.dataValues.roleId,
      accountTypeIds: userInstance.dataValues.AccountTypes.map((accountTypes) => accountTypes.id),
      userId: userInstance.dataValues.id
    }

    await firebase.auth().setCustomUserClaims(user.uid, tokenClaims);

    return successResponse(res, { data: { userId: tokenClaims.userId, uid: user.uid, isActive: userInstance.dataValues.isActive } });
  } catch (error) {
    return serverErrorResponse(res, {
      status: 'could not complete auth request',
      error
    })
  }
}

/**
 * Admin login method
 * 
 */
const firebaseAdminAuth = async (req, res) => {
    const user = await firebase.auth().getUser(req.body.user.uid);
    let authRecord, userInstance;

    if (user) {
      authRecord = await database.AuthId.find({ where: { uid: user.uid } });
    } else {
      return notFoundError(res, {
        status: 'User record not found'
      })
    }

    if (authRecord) {
      userInstance = await findUser({
        database: database.User,
        userId: authRecord.userId,
        accountType: database.AccountType,
        role: database.Role,
        accounTypeId: req.body.accountTypeId,
        userAccountTypes: database.UserAccountType
      });
    } else {
      return notFoundError(res, {
        status: 'User record not found'
      })
    }

    // Ensure user is an admin
    if(parseInt(userInstance.dataValues.roleId, 10) !== 1 && parseInt(userInstance.dataValues.roleId, 10) !== 2) {
      return unAuthorizedRequest(res, {
        error: 'Access denied, user is not an admin!'
      })
    } else {
      const tokenClaims = {
        roleId: userInstance.dataValues.roleId,
        accountTypeIds: userInstance.dataValues.AccountTypes.map((accountTypes) => accountTypes.id),
        userId: userInstance.dataValues.id
      }
  
      await firebase.auth().setCustomUserClaims(user.uid, tokenClaims);
  
      return successResponse(res, { data: { userId: tokenClaims.userId, uid: user.uid, isActive: userInstance.dataValues.isActive } });
    }
}

export default {
  firebaseAuth,
  firebaseAdminAuth
}
