// Create an S3 bucket
export const bucket = new sst.aws.Bucket("Documents");

export const vpc = new sst.aws.Vpc("MySQLVpc", {
  nat: "ec2",
  bastion: true,
});

export const mysql = new sst.aws.Aurora("KPERSPOCMySQL", {
  engine: "mysql",
  dataApi: true,
  vpc,
});
