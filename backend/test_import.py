#!/usr/bin/env python3

print("🔄 Testing imports step by step...")

try:
    print("1. Importing config...")
    from app.core.config import settings
    print("   ✅ Config imported successfully")
    print(f"   ALLOWED_ORIGINS: {settings.allowed_origins}")
except Exception as e:
    print(f"   ❌ Config import failed: {e}")
    exit(1)

try:
    print("2. Importing routes...")
    from app.api.routes import health
    print("   ✅ Health route imported")
except Exception as e:
    print(f"   ❌ Health route import failed: {e}")

try:
    from app.api.routes import channels
    print("   ✅ Channels route imported")
except Exception as e:
    print(f"   ❌ Channels route import failed: {e}")

try:
    from app.api.routes import videos
    print("   ✅ Videos route imported")
except Exception as e:
    print(f"   ❌ Videos route import failed: {e}")

try:
    from app.api.routes import transcription_jobs
    print("   ✅ Transcription jobs route imported")
except Exception as e:
    print(f"   ❌ Transcription jobs route import failed: {e}")

try:
    print("3. Importing main app...")
    from app.api.main import app
    print("   ✅ App imported successfully")
except Exception as e:
    print(f"   ❌ App import failed: {e}")

print("🎉 All imports successful!")