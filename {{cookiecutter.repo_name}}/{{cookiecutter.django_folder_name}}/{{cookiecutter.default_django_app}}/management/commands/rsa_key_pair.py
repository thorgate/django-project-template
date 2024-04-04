from typing import Any

from django.core.management.base import BaseCommand

from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import rsa


class Command(BaseCommand):
    help = """Generate RSA key-pair for JWT authentication.

    This management command generates a new RSA key-pair and prints the key-pair.
    """

    def handle(self, *args: Any, **options: Any) -> None:
        private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)

        private_key_pem = private_key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.PKCS8,
            encryption_algorithm=serialization.NoEncryption(),
        )
        public_key_pem = private_key.public_key().public_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PublicFormat.SubjectPublicKeyInfo,
        )

        self.stdout.write("Generated RSA key-pair for JWT authentication")
        self.stdout.write("")
        self.stdout.write("# JWT Private key:")
        self.stdout.write(f'DJANGO_JWT_PRIVATE_KEY="{private_key_pem.decode()}"\n')
        self.stdout.write("")
        self.stdout.write("# JWT Public key:")
        self.stdout.write(f'DJANGO_JWT_PUBLIC_KEY="{public_key_pem.decode()}"\n')
