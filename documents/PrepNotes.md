- Cloned https://github.com/sst/demo-notes-app
- NPM install
- NPX audit fix --force 

### https://github.com/sst/sst/issues/6056
cd .sst/platform
npm dedupe

### add usernames

aws cognito-idp sign-up \
  --region us-east-1 \
  --client-id 7t2ums0i7rfabvdlsj2fpep8m7 \
  --username justin@patternsatscale.com \
  --password Passw0rd!

aws cognito-idp admin-confirm-sign-up \
  --region us-east-1 \
  --user-pool-id us-east-1_M1giOjn5M \
  --username justin@patternsatscale.com
