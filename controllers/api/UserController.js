// Add user methods
import bcrypt from 'bcrypt-nodejs';
import _ from 'lodash';
import db from '../../models';
import moment from 'moment';
import DataValidationService from '../../services/DataValidationService';
import {
  successResponse,
  notFoundError,
  badRequest,
  createdResponse,
  serverErrorResponse
} from '../helpers/common_response';

import { userAttributes } from '../helpers/user_helper';

const User = db.User;
const Role = db.Role;
const AuthId = db.AuthId;
const UserAccountType = db.UserAccountType;
const AccountType = db.AccountType;
const Truck = db.Truck;
const Trip = db.Trip;

// Format user object for sending to database
const formatUserObject = (userData) => {
  let passwordHashSaltRounds = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(userData.password, passwordHashSaltRounds);
  const formattedUserObject = {
    firstname: userData.firstname,
    lastname: userData.lastname,
    username: userData.username,
    email: userData.email,
    password: hashedPassword,
    address: userData.address,
    town: userData.town,
    city: userData.city,
    state: userData.state,
    phone: userData.phone,
    imageUrl: "",
    roleId: userData.roleId || 3 // Defaulting roleId to 1
  }

  return formattedUserObject;
}

// Format user update object for sending to database
const formatUserUpdateObject = (userData) => {
  let formatUserObject = userData;
  if (userData.new_password) {
    let passwordHashSaltRounds = bcrypt.genSaltSync(10);
    formatUserObject.password = bcrypt.hashSync(userData.new_password, passwordHashSaltRounds);
  }

  return formatUserObject;
}

/**
 * Get a user data based on username, email or id specified
 * @param {object} req
 * @param {function} res // Object
 * @returns {object} specified user.
 */
const getUser = async (req, res) => {
  //Default search parameter to id
  let searchParam = req.params.id;
  if (!searchParam) {
    return badRequest(res, {message: 'Specify user id' });
  }

  let user;
  // Search for user bu uid if the id is not an integer
  if(!parseInt(searchParam, 10)) {
    user = await searchUser(searchParam, 'uid');
  } else {
    user = await searchUser(searchParam);
  }

  if (user) {
    return successResponse(res, {data: user});
  } else {
    return notFoundError(res, {message: 'User not found' });
  }
};

/**
* updateUser method for updating a user
* @param {*} req 
* @param {*} res 
*/
const updateUser = async (req, res) => {
  //Default search parameter to id
  let searchParam = req.params.id;
  if (!searchParam) {
    return badRequest(res, {message: 'Specify user id' });
  }

  let user;
  // Search for user bu uid if the id is not an integer
  if(!parseInt(searchParam, 10)) {
    user = await searchUser(searchParam, 'uid');
  } else {
    user = await searchUser(searchParam);
  }

  const userUpdateData = formatUserUpdateObject(req.body);

  if (!user) {
    return notFoundError(res, {message: 'User not found' });
  }

  const hasSomeRequiredKeys = DataValidationService.validData('user', 'update-user', req.body);
  if (!hasSomeRequiredKeys) {
    return badRequest(res, {message: 'Some required fields are missing' });
  } else {
    user.update(userUpdateData).then(updatedUser => {
      return successResponse(res, {data: updatedUser});
    });
  }
}

/**
 * archiveUser: Archive a user
 * @param {object} req
 * @param {function} res // Object
 * @returns {promise} http response.
 */
const archiveUser = async (req, res) => {
  // Default search parameter to id
  let archiveParam = req.params.id;
  if (!archiveParam || !parseInt(archiveParam, 10)) {
    return badRequest(res, {message: 'Specify user id'});
  }

  let query = {
      id: archiveParam
  }

  const user = await User.findOne({
    where: query
  });

  if (!user) {
    return notFoundError(res, {message: 'User not found'});
  }

  user.update({isActive: false}).then(archivedUser => {
    return successResponse(res, { message: 'User deleted!' });
  });
};

export default {
  getUser,
  updateUser,
  archiveUser,
};
