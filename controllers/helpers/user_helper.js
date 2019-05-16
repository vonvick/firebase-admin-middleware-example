/**
 * array of user details to be displayed
 */
export const userAttributes = [
  'id',
  'email',
  'firstname',
  'lastname',
  'username',
  'address',
  'town',
  'city',
  'state',
  'country',
  'phone',
  'imageUrl',
  'roleId',
  'jobTitle',
  'isActive',
  'accountStatus',
  'createdAt',
  'updatedAt'
];

/* generate a password string */
export const password = Math.random().toString(36).slice(-8);

/**
 * updateAuthIds updates the authentication ids for auth0
 *
 * @param {String} userId the user id
 * @param {String} AuthId the auth id
 * @param {String} provider the authentication provider name
 * @param {String} email the user's email
 *
 * @returns {Object} new value update
 */
const storeAuthId = (authPayload) => {
  return authPayload.database.create({
    userId: authPayload.userId,
    uid: authPayload.uid,
    provider: authPayload.provider,
    email: authPayload.email
  });
};

/**
 * showUserDetails filters and shows user details
 *
 * @param {Object} user the user object
 *
 * @returns {Object} filtered user details
 */
export const showUserDetails = (user) => {
  const {
    id,
    firstname,
    lastname,
    username,
    email,
    address,
    town,
    city,
    state,
    phone,
    imageUrl,
    roleId,
    Role,
    AccountTypes
  } = user;
  return {
    id,
    firstname,
    lastname,
    username,
    email,
    address,
    town,
    city,
    state,
    phone,
    imageUrl,
    roleId,
    Role,
    AccountTypes
  };
};

/**
 * find User by user id and return payload
 */

export const findUser = async (userPayload) => {
  return await userPayload.database.findOne({
    where: { id: userPayload.userId },
    include: [{ model: userPayload.accountType }, { model: userPayload.role }]
  });
}

/**
 * 
 * @param {*} userPayload 
 * @param {*} provider 
 * @param {*} authId 
 */
export const createNewRecordFromFirebase = async (record) => {
  let names, userPassword;
  if (record.userPayload.displayName) {
    names = record.userPayload.displayName.split(' ');
  }

  userPassword = record.userPayload.password ? record.userPayload.password : password;

  const {
    email,
    photoURL,
  } = record.userPayload;

  const provider = record.provider;
  const uid = record.userPayload.uid;
  const lastName = names[1] || null;
  const firstName =  names[0] || null;
  const phone =  record.userPayload.phoneNumber || null;

  const role = await record.roleModel.findOne({ where: { title: 'USER' }})

  const defaults = {
    email,
    roleId: role.id,
    password_digest: userPassword,
    password_confirmation: userPassword,
    phone,
    businessName: record.userPayload.businessName ? record.userPayload.businessName : null,
    businessPhone: record.userPayload.businessPhone ? record.userPayload.businessPhone : null,
    businessEmail: record.userPayload.businessEmail ? record.userPayload.businessEmail : null,
    jobTitle: record.userPayload.jobTitle ? record.userPayload.jobTitle : null
  };
  
  // we trust the social logins to have valid names
  if (firstName) { defaults.firstname = firstName; }
  if (lastName) { defaults.lastname = lastName; }
  if (photoURL) { defaults.imageUrl = photoURL; }

  const accountType = await record.accountTypeModel.findOne({
    where: {
      id: record.accountTypeId
    }
  });

  const newUser = await record.userModel.findOrCreate({ where: { email }, defaults });
  
  if (accountType) {
    const userAccountType = {
      userId: newUser[0].id,
      accountTypeId: accountType.id
    }
    await record.userAccountTypes.findOrCreate({ where: userAccountType, userAccountType });
    await storeAuthId({
      database: record.authIdModel,
      userId: newUser[0].id,
      uid,
      provider,
      email
    });
  
    const userResult = await record.userModel.findOne({
      where: { id: newUser[0].id },
      include: [{ model: record.accountTypeModel }, { model: record.roleModel }]
    });
  
    return userResult;
  }

  return null;
}
