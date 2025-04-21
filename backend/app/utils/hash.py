from passlib.hash import bcrypt

def hash_password(password: str) -> str:
    """
    Hash a password using bcrypt.

    :param password: The password to hash.
    :return: The hashed password.
    """
    return bcrypt.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a password against a hashed password.

    :param plain_password: The plain password to verify.
    :param hashed_password: The hashed password to check against.
    :return: True if the password matches, False otherwise.
    """
    return bcrypt.verify(plain_password, hashed_password)