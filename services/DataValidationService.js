// Add user methods
import db from '../models';
import _ from 'lodash';

const Role = db.Role;
const User = db.User;

// Required inputs for different models
const ApplicationDataRequirement = Object({
  "user": {
    "signup": [
      'firstname',
      'lastname',
      'username',
      'email',
      'password',
      'address',
      'town',
      'state',
      'phone'
    ],
    "signin": ['email', 'password'],
    "update-user": [
      'firstname',
      'lastname',
      'username',
      'email',
      'password',
      'address',
      'town',
      'state',
      'phone',
      'imageUrl',
      'businessName',
      'businessPhone',
      'businessEmail',
      'jobTitle',
      'accountStatus'
    ]
  },
});

/**
 * Ensure object has all required keys
 * @param {*} model model to be verified (i.e: role, user)
 * @param {*} type type of data to be verified (i.e: create-role)
 * @param {*} input data entered that need to be verified
 */
const validateData = (model, type, input) => {
  let valid = true;
  const inputDataKeys = Object.keys(input);
  _.forEach(ApplicationDataRequirement[model][type], (key) => {
    if (!inputDataKeys.includes(key)) {
      valid = false;
    }
  });
  return valid;
}

/**
 * Ensure object has minumim required input for actions
 * @param {*} model model to be verified (i.e: role, user)
 * @param {*} type type of data to be verified (i.e: create-role)
 * @param {*} input data entered that need to be verified
 */
const validData = (model, type, input) => {
  let valid = false;
  const inputDataKeys = Object.keys(input);
  _.forEach(ApplicationDataRequirement[model][type], (key) => {
    if (inputDataKeys.includes(key)) {
      valid = true;
    }
  });
  return valid;
}

export default {
  validateData,
  validData
};
