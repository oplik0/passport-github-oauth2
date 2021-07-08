# passport-github-oauth20

[Passport](http://passportjs.org/) strategy for authenticating with [GitHub](http://www.github.com/)
using the OAuth 2.0 API. This package is heavily based on [passport-google-oauth20](https://www.npmjs.com/package/passport-google-oauth20) package

This module lets you authenticate using GitHub in your Node.js applications.
By plugging into Passport, GitHub authentication can be easily and
unobtrusively integrated into any application or framework that supports
[Connect](http://www.senchalabs.org/connect/)-style middleware, including
[Express](http://expressjs.com/).

---

[![npm](https://img.shields.io/npm/v/passport-github-oauth20.svg)](https://www.npmjs.com/package/passport-github-oauth20)

## Install

```bash
$ npm install passport-github-oauth20
```

## Usage

#### Create an Application

Before using `passport-github-oauth20`, you must register an application with
GitHub. If you have not already done so, a oauth app has to be created in
[Developers settings](https://github.com/settings/developers).
Your application will be issued a client ID and client secret, which need to be
provided to the strategy. You will also need to configure a redirect URI which
matches the route in your application.

#### Configure Strategy

The GitHub authentication strategy authenticates users using a GitHub account
and OAuth 2.0 tokens. The client ID and secret obtained when creating an
application are supplied as options when creating the strategy. The strategy
also requires a `verify` callback, which receives the access token and optional
refresh token, as well as `profile` which contains the authenticated user's
GitHub profile. The `verify` callback must call `cb` providing a user to
complete authentication.

```javascript
var GitHubStrategy = require("passport-github-oauth20").Strategy;

passport.use(
  new GitHubStrategy(
    {
      clientID: GITHUB_CLIENT_ID,
      clientSecret: GITHUB_CLIENT_SECRET,
      callbackURL: "http://www.example.com/auth/github/callback",
    },
    function (accessToken, refreshToken, profile, cb) {
      User.findOrCreate({ githubId: profile.id }, function (err, user) {
        return cb(err, user);
      });
    }
  )
);
```

#### Authenticate Requests

Use `passport.authenticate()`, specifying the `'github'` strategy, to
authenticate requests.

For example, as route middleware in an [Express](http://expressjs.com/)
application:

```javascript
app.get(
  "/auth/github",
  passport.authenticate("github", { scope: ["user"] })
);

app.get(
  "/auth/github/callback",
  passport.authenticate("github", { failureRedirect: "/login" }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect("/");
  }
);
```

## License

[The MIT License](http://opensource.org/licenses/MIT)

Copyright (c) 2021 oplik0
