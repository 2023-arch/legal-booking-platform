import sys
import traceback

print("Importing bcrypt...")
try:
    import bcrypt
    print(f"Bcrypt imported: {bcrypt}")
    print(f"File: {bcrypt.__file__}")
    print(f"Dir: {dir(bcrypt)}")
    
    password = b"test"
    hashed = bcrypt.hashpw(password, bcrypt.gensalt())
    print(f"Direct bcrypt hash success: {hashed}")

    from passlib.context import CryptContext
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    print(pwd_context.hash("test"))

except Exception as e:
    print("CAUGHT EXCEPTION:")
    print(str(e))
    # traceback.print_exc()
