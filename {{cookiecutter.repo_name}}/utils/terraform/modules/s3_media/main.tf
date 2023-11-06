// Resources for s3 media files, bucket and user

resource "aws_iam_user" "bucket_user" {
  name = var.name
  tags = var.tags
}

resource "aws_s3_bucket" "media_bucket" {
  bucket = var.name
  tags   = var.tags

  versioning {
    enabled = true
  }

  server_side_encryption_configuration {
    rule {
      apply_server_side_encryption_by_default {
        sse_algorithm = "AES256"
      }
    }
  }

  policy = <<POLICY
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Action": [
              "s3:*"
            ],
            "Effect": "Allow",
            "Resource": [
                "arn:aws:s3:::${var.name}/*",
                "arn:aws:s3:::${var.name}"
            ],
            "Principal": {
                "AWS": [
                    "${aws_iam_user.bucket_user.arn}"
                ]
            }
        }
    ]
}
POLICY
}

resource "aws_s3_bucket_public_access_block" "access_storage" {
  bucket = aws_s3_bucket.media_bucket.id

  rule {
    # if is public allow for adding objects with the public ACL
    object_ownership      = var.is_public ? "BucketOwnerPreferred" : "BucketOwnerEnforced"
  }
  # Block public access to buckets and objects granted through new access control lists (ACLs)
  block_public_acls       = !var.is_public
  # Block public access to buckets and objects granted through any access control lists (ACLs)
  ignore_public_acls      = !var.is_public
  # Block public access to buckets and objects granted through new public bucket or access point policies
  block_public_policy     = true
  # Block public and cross-account access to buckets and objects through any public bucket or access point policies
  restrict_public_buckets = true
}


resource "aws_iam_access_key" "bucket_user_key" {
  user = aws_iam_user.bucket_user.name
}
