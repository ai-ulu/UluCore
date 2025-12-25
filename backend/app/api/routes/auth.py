from fastapi import APIRouter, HTTPException, status
import bcrypt

from app.models.schemas import UserCreate, UserLogin, UserResponse, TokenResponse
from app.adapters import db
from app.auth.jwt import create_access_token

router = APIRouter(prefix="/auth", tags=["Authentication"])


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(password: str, password_hash: str) -> bool:
    return bcrypt.checkpw(password.encode(), password_hash.encode())


@router.post("/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def signup(request: UserCreate):
    """
    Create a new user account.
    
    Returns JWT token on successful registration.
    """
    existing = await db.get_user_by_email(request.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    
    password_hash = hash_password(request.password)
    user = await db.create_user(
        email=request.email,
        password_hash=password_hash,
        name=request.name,
    )
    
    token = create_access_token(user["id"], user["email"])
    
    return TokenResponse(
        access_token=token,
        user=UserResponse(
            id=user["id"],
            email=user["email"],
            name=user["name"],
            created_at=user["created_at"],
        ),
    )


@router.post("/login", response_model=TokenResponse)
async def login(request: UserLogin):
    """
    Login with email and password.
    
    Returns JWT token on successful authentication.
    """
    user = await db.get_user_by_email(request.email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    
    if not verify_password(request.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    
    token = create_access_token(user["id"], user["email"])
    
    return TokenResponse(
        access_token=token,
        user=UserResponse(
            id=user["id"],
            email=user["email"],
            name=user["name"],
            created_at=user["created_at"],
        ),
    )
