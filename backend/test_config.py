#!/usr/bin/env python3

try:
    from app.core.config import Settings
    settings = Settings()
    print("✅ Settings loaded successfully!")
    print(f"ALLOWED_ORIGINS: {settings.allowed_origins}")
    print(f"DATABASE_URL: {settings.database_url}")
    print(f"DEBUG: {settings.debug}")
except Exception as e:
    print(f"❌ Error loading settings: {e}")
    print(f"Error type: {type(e)}")
    
    # Try to create settings without .env file
    try:
        print("\n🔄 Trying to create Settings without .env file...")
        import os
        import tempfile
        
        # Temporarily disable env_file
        from app.core.config import Settings
        from pydantic_settings import SettingsConfigDict
        
        class TestSettings(Settings):
            model_config = SettingsConfigDict(
                env_file=None,
                case_sensitive=False,
                extra="ignore"
            )
        
        test_settings = TestSettings()
        print("✅ Settings loaded without .env file!")
        print(f"ALLOWED_ORIGINS: {test_settings.allowed_origins}")
        
    except Exception as e2:
        print(f"❌ Still failed: {e2}")