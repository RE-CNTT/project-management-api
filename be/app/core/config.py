from pydantic_settings import BaseSettings, SettingsConfigDict

class Setting(BaseSettings):
    DB_URL: str
    SECRECT_KEY: str
    JWT_ALGORITHM: str

    model_config = SettingsConfigDict(
        env_file=".env",
        enable_decoding="utf-8",
        case_sensitive=True
    )

settings = Setting()