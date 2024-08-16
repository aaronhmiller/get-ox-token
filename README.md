# get-ox-token

Some OX GraphQL APIs require a bearer token. This automates retrieving one.

## Usage

This automates the login process and retrieves the bearer token used in calls to
OX's APIs. To facililtate this, you'll need to add your username and password to
a `.env` file specifying the username and password(s) needed during the normal
login flow.

`deno run -A get-token.ts` will launch the process, run the automation, and copy
the token into your clipboard, where you can then paste it into Postman, or
whichever API client you need it for.

Often, authenticating to Google will require a 2FA step, so keep your device
nearby.

## Notes

Using Puppeteer to automate running a browser is VERY BRITTLE. The settings in
the script are very specific. Your mileage will vary.
