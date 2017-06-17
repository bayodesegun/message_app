export var throwError = function(error, reason, details) {
  error = new Meteor.Error(error, reason, details);
  if (Meteor.isClient) {
    return error;
  } else if (Meteor.isServer) {
    throw error;
  }
};