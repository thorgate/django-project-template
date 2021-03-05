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

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}


resource "aws_iam_access_key" "bucket_user_key" {
  user = "${aws_iam_user.bucket_user.name}"
}
