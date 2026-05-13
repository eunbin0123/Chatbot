from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import Optional
import uuid

from database import get_db, User, create_tables
from auth import (
    verify_password, hash_password,
    create_access_token, get_current_user
)
from mcp import router as mcp_router

app = FastAPI(title="Chatbot Backend API")

app.include_router(mcp_router)

# CORS 설정 - 프론트엔드 주소에 맞게 수정
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",   # Vite 기본 포트
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 서버 시작 시 DB 테이블 생성
@app.on_event("startup")
def startup():
    create_tables()


# =========================================================
# Pydantic 스키마
# =========================================================

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    name: Optional[str] = None

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict

class VectorStoreRequest(BaseModel):
    vector_store_id: str
    assistant_id: Optional[str] = None

class VectorStoreResponse(BaseModel):
    vector_store_id: Optional[str]
    assistant_id: Optional[str]

class UserResponse(BaseModel):
    id: str
    email: str
    name: Optional[str]
    vector_store_id: Optional[str]
    assistant_id: Optional[str]


# =========================================================
# 인증 라우터
# =========================================================

@app.post("/auth/register", response_model=TokenResponse)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    # 이메일 중복 확인
    existing = db.query(User).filter(User.email == req.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="이미 사용 중인 이메일입니다."
        )

    user = User(
        id=str(uuid.uuid4()),
        email=req.email,
        hashed_password=hash_password(req.password),
        name=req.name or req.email.split("@")[0]
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": user.id})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "vector_store_id": user.openai_vector_store_id,
            "assistant_id": user.openai_assistant_id,
        }
    }


@app.post("/auth/login", response_model=TokenResponse)
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form.username).first()
    if not user or not verify_password(form.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="이메일 또는 비밀번호가 올바르지 않습니다."
        )

    token = create_access_token({"sub": user.id})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "vector_store_id": user.openai_vector_store_id,
            "assistant_id": user.openai_assistant_id,
        }
    }


@app.get("/auth/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "name": current_user.name,
        "vector_store_id": current_user.openai_vector_store_id,
        "assistant_id": current_user.openai_assistant_id,
    }


# =========================================================
# Vector Store 라우터
# =========================================================

@app.get("/user/vector-store", response_model=VectorStoreResponse)
def get_vector_store(current_user: User = Depends(get_current_user)):
    """현재 유저의 Vector Store ID + Assistant ID 조회"""
    return {
        "vector_store_id": current_user.openai_vector_store_id,
        "assistant_id": current_user.openai_assistant_id,
    }


@app.post("/user/vector-store", response_model=VectorStoreResponse)
def save_vector_store(
    req: VectorStoreRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Vector Store ID + Assistant ID 저장 (파일 업로드 완료 후 호출)"""
    current_user.openai_vector_store_id = req.vector_store_id
    if req.assistant_id:
        current_user.openai_assistant_id = req.assistant_id
    db.commit()
    db.refresh(current_user)

    return {
        "vector_store_id": current_user.openai_vector_store_id,
        "assistant_id": current_user.openai_assistant_id,
    }


@app.delete("/user/vector-store")
def delete_vector_store(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Vector Store 초기화 (파일 전체 삭제 시)"""
    current_user.openai_vector_store_id = None
    current_user.openai_assistant_id = None
    db.commit()
    return {"message": "Vector Store 정보가 초기화되었습니다."}


@app.get("/health")
def health():
    return {"status": "ok"}
