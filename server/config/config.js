// All the app configuration values should be added here.

module.exports = {
  // OAuth credentails common for mailer functionality
  credentials: {
    web: {
      client_id:
        "654842763273-nnafghpgq5dh4qk6q5m5pmj8re1s18l3.apps.googleusercontent.com",
      project_id: "yaass-286018",
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      client_secret: "5bCNF9yE4-CxONwDIEaPw6oX",
      redirect_uris: ["http://localhost:3005"],
      javascript_origins: ["http://localhost:3005"],
    },
  },

  // OAuth token common for mailer functionality
  token: {
    access_token:
      "ya29.a0AfH6SMCDuIGafpxvzGH1SoK-StX_6cO8U7cBv1znvdmL_rLgb3qb6Uwj1pN4xRMrjtdwPbhJYAfsQZIGQ9gaw_T5ULu1nJPQhhl0f0aMOnZkh0zIisk3atv4IJBbI_pAtbuYsAoC-6yljeW88sXcOEwWYkOZQJPfoL0",
    refresh_token:
      "1//0gn7xz9dP7UVICgYIARAAGBASNwF-L9IrH699W1FMIqDB1RmhIMK0AXG7I3y9eqECzsia_uUctJBOSFHZK2IujGP5mwqSPLJHt5M",
    scope: "https://mail.google.com/",
    token_type: "Bearer",
    expiry_date: 1597339801516,
  },

  dbURL: `mongodb+srv://robinsingh:Robin%401998@cluster0.q7iqp.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`,

  TOKEN_SECRET: `Letsdosomefunwithtoken1998`,
  excludedRoutes: [`/loginRoutes`],
};
