output "user" {
  value       = aws_iam_user.bucket_user
  description = "The IAM user who has access to the bucket"
}

output "bucket" {
  value       = aws_s3_bucket.media_bucket
  description = "The media bucket"
}

output "key" {
  value       = aws_iam_access_key.bucket_user_key
  description = "Access key for the user"
}
