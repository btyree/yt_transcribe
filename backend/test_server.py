#!/usr/bin/env python3
"""
Simple test script to verify backend server functionality.
"""
import asyncio
import subprocess
import sys

import httpx


async def test_backend_server():
    """Test that the backend server starts and responds to health checks."""
    print("🧪 Testing backend server...")

    # Start the server process
    print("🚀 Starting FastAPI server...")
    process = subprocess.Popen(
        ["uv", "run", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
    )

    # Give the server time to start
    await asyncio.sleep(3)

    try:
        # Test health endpoint
        async with httpx.AsyncClient() as client:
            print("🏥 Testing health endpoint...")
            response = await client.get(
                "http://localhost:8001/api/v1/health",
                timeout=10.0,
            )

            if response.status_code == 200:
                health_data = response.json()
                print("✅ Health check passed!")
                print(f"   Status: {health_data.get('status')}")
                print(f"   Service: {health_data.get('service')}")
                print(f"   Version: {health_data.get('version')}")
                return True
            else:
                print(f"❌ Health check failed with status {response.status_code}")
                return False

    except Exception as e:
        print(f"❌ Error testing server: {e}")
        return False
    finally:
        # Stop the server
        print("🛑 Stopping server...")
        process.terminate()
        try:
            process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            process.kill()


async def main():
    """Main test function."""
    success = await test_backend_server()
    if success:
        print("🎉 Backend server test passed!")
        sys.exit(0)
    else:
        print("💥 Backend server test failed!")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
