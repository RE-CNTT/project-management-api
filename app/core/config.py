from pydantic_settings import BaseSettings, SettingsConfigDict

class Setting(BaseSettings):
    DB_URL: str
    SERECT_KEY: str

    model_config = SettingsConfigDict(
        env_file=".env",
        enable_decoding="utf-8",
        case_sensitive=True
    )

settings = Setting()