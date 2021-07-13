// Load modules.
const OAuth2Strategy = require("passport-oauth2");
const util = require("util");
const Profile = require("./profile");
const InternalOAuthError = require("passport-oauth2").InternalOAuthError;
const UserInfoError = require("./errors/userinfoerror");
const { Octokit } = require("@octokit/core");
let _scope = [];
/**
 * `Strategy` constructor.
 *
 * The GitHub authentication strategy authenticates requests by delegating to
 * GitHub using the OAuth 2.0 protocol.
 *
 * Applications must supply a `verify` callback which accepts an `accessToken`,
 * `refreshToken` and service-specific `profile`, and then calls the `cb`
 * callback supplying a `user`, which should be set to `false` if the
 * credentials are not valid.  If an exception occured, `err` should be set.
 *
 * Options:
 *   - `clientID`      your GitHub oauth application's client id
 *   - `clientSecret`  your GitHub application's client secret
 *   - `callbackURL`   URL to which GitHub will redirect the user after granting authorization
 *
 * Examples:
 *
 *     passport.use(new GitHubStrategy({
 *         clientID: '123-456-789',
 *         clientSecret: 'shhh-its-a-secret'
 *         callbackURL: 'https://www.example.net/auth/github/callback'
 *       },
 *       function(accessToken, refreshToken, profile, cb) {
 *         User.findOrCreate(..., function (err, user) {
 *           cb(err, user);
 *         });
 *       }
 *     ));
 *
 * @constructor
 * @param {object} options
 * @param {function} verify
 * @access public
 */
function Strategy(options, verify) {
    options = options || {};
    options.authorizationURL =
        options.authorizationURL ?? "https://github.com/login/oauth/authorize";
    options.tokenURL =
        options.tokenURL ?? "https://github.com/login/oauth/access_token";
    OAuth2Strategy.call(this, options, verify);
    this.name = "github";
    this._userProfileURL =
        options.userProfileURL ?? "https://api.github.com/user";
    this.baseURL = options.baseURL;
}

// Inherit from `OAuth2Strategy`.
util.inherits(Strategy, OAuth2Strategy);

/**
 * Retrieve user profile from GitHub.
 *
 * This function constructs a normalized profile, with the following properties:
 *
 *   - `provider`         always set to `github`
 *   - `id`
 *   - `username`
 *   - `displayName`
 *
 * @param {string} accessToken
 * @access protected
 */
Strategy.prototype.userProfile = function (accessToken, done) {
    (async (accessToken) => {
        const octokit = new Octokit({
            auth: accessToken,
            baseUrl: this.baseURL,
        });
        let body;
        try {
            body = await octokit.request("GET /user");
        } catch (err) {
            if (err.data) {
                try {
                    body = JSON.parse(err.data);
                } catch (_) {
                    return {
                        error: new Error(_.message + "parse"),
                        profile: {},
                    };
                }
            }

            if (json && json.error && json.error.message) {
                return { error: new Error(json.error.message) };
            } else if (json && json.error && json.error_description) {
                return {
                    error: new UserInfoError(
                        json.error_description,
                        json.error
                    ),
                };
            }
            return {
                error: new InternalOAuthError(
                    "Failed to fetch user profile",
                    err
                ),
            };
        }

        let json = body.data;
        if (
            _scope.some((scope) => scope === "user" || scope === "user:email")
        ) {
            const getEmails = await octokit.request("GET /user/emails");
            json.emails = getEmails.data.sort(
                (a, b) => -1 * a.primary + 1 * b.primary
            );
        }
        if (
            _scope.some(
                (scope) => scope === "read:org" || scope === "admin:org"
            )
        ) {
            const getOrgs = await octokit.request("GET /user/orgs");
            json.orgs = getOrgs.data;
        }
        const profile = Profile.parse(json);

        profile.provider = "github";
        profile._raw = body;
        profile._json = json;
        profile._octokit = octokit;

        return { profile };
    })(accessToken)
        .then(({ profile, error }) => {
            done(error, profile);
        })
        .catch((error) => done(error, undefined));
};

/**
 * Return extra GitHub-specific parameters to be included in the authorization
 * request.
 *
 * @param {object} options
 * @return {object}
 * @access protected
 */
Strategy.prototype.authorizationParams = function (options) {
    var params = {};
    if (options.state) {
        params["state"] = options.state;
    }
    if (options.allow_signup === false || options.allow_signup === "false") {
        params["allow_signup"] = "false";
    }
    if (options.login) {
        params["login"] = options.login;
    }
    if (options.scope) {
        _scope = options.scope ?? [];
    }

    return params;
};

/**
 * Expose `Strategy`.
 */
module.exports = Strategy;
