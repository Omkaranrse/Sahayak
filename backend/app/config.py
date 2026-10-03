from typing import List, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str = "postgresql://sahayak:sahayak@localhost:5432/sahayak"
    groq_api_key: str = ""
    groq_model: str = "llama-3.1-8b-instant"
    cors_origins: Union[List[str], str] = ["http://localhost:3000"]

    @field_validator("cors_origins", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v):
        if isinstance(v, str) and not v.strip().startswith("["):
            return [i.strip() for i in v.split(",") if i.strip()]
        return v

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
