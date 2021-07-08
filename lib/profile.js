/**
 * Parse profile.
 *
 * @param {Object|String} json
 * @return {Object}
 * @api private
 */
exports.parse = function (json) {
  if ("string" == typeof json) {
    json = JSON.parse(json);
  }

  var profile = {};
  profile.id = String(json.id);
  profile.nodeId = json.node_id;
  profile.displayName = json.name;
  profile.username = json.login;
  profile.profileUrl = json.html_url;
  if (json.emails) {
    profile.emails = json.emails.map((email) => {
      email.value = email.email;
      delete email.email;
      return email;
    });
  } else if (json.email) {
    profile.emails = [{ value: json.email, verified: true }];
  } else {
    profile.emails = [];
  }
  profile.photos = json.avatar_url ? [{ value: json.avatar_url }] : [];
  profile.orgs = json.orgs ?? [];
  return profile;
};
