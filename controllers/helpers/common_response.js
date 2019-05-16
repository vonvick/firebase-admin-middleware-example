const customResponse = (res, status, message) => {
  return res.status(status).json(message)
};

export const successResponse = (res, message) => {
  return customResponse(res, 200, message);
}

export const createdResponse = (res, message) => {
  return customResponse(res, 201, message);
}

export const forbiddenResponse = (res, message) => {
  return customResponse(res, 403, message);
}

export const badRequest = (res, message) => {
  return customResponse(res, 400, message);
}

export const unprocessedRequest = (res, message) => {
  return customResponse(res, 422, message);
}

export const unAuthorizedRequest = (res, message) => {
  return customResponse(res, 401, message);
}

export const serverErrorResponse = (res, message) => {
  return customResponse(res, 500, message);
}

export const notFoundError = (res, message) => {
  return customResponse(res, 404, message);
}
