- Cloned https://github.com/sst/demo-notes-app
- NPM install
- NPX audit fix --force 

### https://github.com/sst/sst/issues/6056
cd .sst/platform
npm dedupe

### add usernames

aws cognito-idp sign-up \
  --region us-east-1 \
  --client-id 3g5nihjigitali734dj0mp4s7i \
  --username justin@patternsatscale.com \
  --password Passw0rd!

aws cognito-idp admin-confirm-sign-up \
  --region us-east-1 \
  --user-pool-id us-east-1_UOHRisGkU \
  --username justin@patternsatscale.com
