import subprocess
from fastapi import FastAPI, Request
import re

app = FastAPI(root_path="/v8")

allowed_services = [
    "fastapi-img",
    "fastapi-tts",
    "fastapi-llm",
    "fastapi-music",
    "fastapi-audiofx"
]
mapping = {
        "Image API": "fastapi-img",
        "Text to speech API": "fastapi-tts",
        "LLM API": "fastapi-llm",
        "Music API": "fastapi-music",
        "Sound Effects API": "fastapi-audiofx"
    }

@app.post("/control")
async def control_service(request: Request):
    body = await request.json()
    service_name = body.get("serviceName")
    command = body.get("command")
    
    service_name = mapping.get(service_name, service_name)
    if not service_name or not command:
        return {"error": "Missing serviceName or command"}

    if command == "shutdown":
        try:
            subprocess.run(["/usr/bin/sudo", "systemctl", "stop", service_name])
            return {"message": f"{service_name} service stopped"}
        except Exception as e:
            return {"error": f"Failed to stop service: {str(e)}"}

    elif command == "launch":
        try:
            subprocess.run(["/usr/bin/sudo", "systemctl", "start", service_name])
            return {"message": f"{service_name} service launched"}
        except Exception as e:
            return {"error": f"Failed to launch service: {str(e)}"}

    else:
        return {"error": "Invalid command"}


@app.get("/status/{service_name}")
async def get_service_status(service_name: str):
    if service_name not in allowed_services:
        service_name = mapping.get(service_name, service_name)
    try:
        output = subprocess.run(
            ["/usr/bin/sudo","systemctl", "status", service_name], capture_output=True, text=True
        )
        isInactive = "inactive" in output.stdout
        isRunning = "running" in output.stdout

        # Extract memory usage
        memory_match = re.search(r"Memory: ([\d.]+[A-Z])", output.stdout)
        memory_usage = memory_match.group(1) if memory_match else None
        last_line = output.stdout.split("\n")[-2]

        # Extract time and status code
        time_match = re.search(r"(\w+\s+\d+\s+\d+:\d+:\d+)", last_line)
        time = time_match.group(1) if time_match else None

        status_code_match = re.search(r" (\d{3}) ", last_line)
        status_code = status_code_match.group(1) if status_code_match else None

        # Extract uptime
        uptime_match = re.search(r"Active: active \(running\) since (.+?);", output.stdout)
        uptime = uptime_match.group(1) if uptime_match else None

        return {"status": output.stdout, "isInactive": isInactive, "isRunning": isRunning, "memoryUsage": memory_usage, "uptime": uptime, "lastCalled": time, "LastStatusCode": status_code, "last_line": last_line}

    except subprocess.CalledProcessError as e:
        return {"error": f"Service not found or error checking status: {str(e)}"}
# Start the server (for development)
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8898) 
