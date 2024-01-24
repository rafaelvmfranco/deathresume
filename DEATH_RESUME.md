Original tasks list:
- Integration with Stripe
- Replacing SQL database with Firebase database
- UI Changes
- Deployment on Hetzner

Extra (unexpected) tasks:
- Adding "Usage" information about user: CV view/dowloads etc (with Nest.js, Firebase)
- Replacing AWS S3 bucket with Firebase Storage
- Integrating real SMTP server with Nest.js
- Integrating with Google OAuth
- Move Open AI key for backend, remove UI

Detailed list of done work:
- Solving conflict Lingui with Vite (moved from Vite 5.0.6 to 5.0.11)
- Added text to localize/en-US
- Added icons with Bootstrap (Bootstrap 5.3.2 added to pnpm-lock.yaml)
- Removed "Copyright" component from 3 parts of application. Component is not deleted, may be altered in the future.
- Usage, Plan pages are created (UI only)
- Replacing "{t`Reactive Resume`}" in Helm for "{t`Death Resume`}" 
- Removing GithubActions (original author track and activity)
- Connecting to Google OAuth (dev, prod)
- All icons/buttons are set to seen and work correctily in light/dark modes and suit design
- UI is checked to responsivity
- Created UI for Usage, Billing, landing page