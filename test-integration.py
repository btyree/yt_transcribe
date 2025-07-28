#!/usr/bin/env python3
"""
Integration test to verify both backend and frontend servers work together.
"""
import asyncio
import sys
import subprocess
import httpx
from pathlib import Path


class ServerManager:
    """Manages starting and stopping development servers."""

    def __init__(self):
        self.backend_process = None
        self.frontend_process = None
        self.project_root = Path(__file__).parent

    async def start_backend(self):
        """Start the FastAPI backend server."""
        backend_dir = self.project_root / "backend"
        print("🐍 Starting backend server...")

        self.backend_process = subprocess.Popen(
            ["uv", "run", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001"],
            cwd=backend_dir,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
        )

        # Wait for backend to start
        await asyncio.sleep(3)
        return self.backend_process.poll() is None

    async def start_frontend(self):
        """Start the Vite frontend development server."""
        frontend_dir = self.project_root / "frontend"
        print("⚡ Starting frontend server...")

        self.frontend_process = subprocess.Popen(
            ["npm", "run", "dev"],
            cwd=frontend_dir,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
        )

        # Wait for frontend to start
        await asyncio.sleep(5)
        return self.frontend_process.poll() is None

    def stop_servers(self):
        """Stop both servers."""
        print("🛑 Stopping servers...")

        for process in [self.backend_process, self.frontend_process]:
            if process and process.poll() is None:
                process.terminate()
                try:
                    process.wait(timeout=5)
                except subprocess.TimeoutExpired:
                    process.kill()


async def test_backend_health():
    """Test backend health endpoint."""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                "http://localhost:8001/api/v1/health", timeout=10.0
            )
            if response.status_code == 200:
                health_data = response.json()
                print(f"✅ Backend health check passed: {health_data['status']}")
                return True
            else:
                print(f"❌ Backend health check failed: {response.status_code}")
                return False
    except Exception as e:
        print(f"❌ Backend health check error: {e}")
        return False


async def test_frontend_response():
    """Test frontend server response."""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get("http://localhost:3000/", timeout=10.0)
            if response.status_code == 200:
                print("✅ Frontend server responding successfully")
                return True
            else:
                print(f"❌ Frontend server returned status: {response.status_code}")
                return False
    except Exception as e:
        print(f"❌ Frontend server error: {e}")
        return False


async def test_cors_configuration():
    """Test that CORS is properly configured for frontend-backend communication."""
    try:
        async with httpx.AsyncClient() as client:
            # Simulate a preflight request from frontend to backend
            headers = {
                "Origin": "http://localhost:3000",
                "Access-Control-Request-Method": "GET",
                "Access-Control-Request-Headers": "Content-Type",
            }
            response = await client.options(
                "http://localhost:8001/api/v1/health", headers=headers, timeout=10.0
            )

            # Check CORS headers
            cors_origin = response.headers.get("Access-Control-Allow-Origin")
            if cors_origin and ("*" in cors_origin or "localhost:3000" in cors_origin):
                print("✅ CORS configuration allows frontend communication")
                return True
            else:
                print(f"❌ CORS configuration issue: {cors_origin}")
                return False
    except Exception as e:
        print(f"❌ CORS test error: {e}")
        return False


async def main():
    """Main integration test function."""
    print("🧪 Starting integration test...")
    print("=" * 50)

    server_manager = ServerManager()

    try:
        # Start both servers
        backend_started = await server_manager.start_backend()
        if not backend_started:
            print("❌ Failed to start backend server")
            return False

        frontend_started = await server_manager.start_frontend()
        if not frontend_started:
            print("❌ Failed to start frontend server")
            return False

        print("🚀 Both servers started successfully!")
        print("=" * 50)

        # Run tests
        tests = [
            ("Backend Health Check", test_backend_health()),
            ("Frontend Response Check", test_frontend_response()),
            ("CORS Configuration Check", test_cors_configuration()),
        ]

        results = []
        for test_name, test_coro in tests:
            print(f"Running {test_name}...")
            result = await test_coro
            results.append(result)
            print()

        # Summary
        print("=" * 50)
        passed = sum(results)
        total = len(results)

        if passed == total:
            print(f"🎉 All integration tests passed ({passed}/{total})!")
            print("✅ Frontend and backend are properly configured and communicating")
            return True
        else:
            print(f"💥 Integration tests failed ({passed}/{total} passed)")
            return False

    finally:
        server_manager.stop_servers()


if __name__ == "__main__":
    try:
        success = asyncio.run(main())
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n🛑 Test interrupted by user")
        sys.exit(1)
