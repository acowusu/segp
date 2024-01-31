import asyncio
import websockets
import uuid
from asyncio import Queue
import openllm


async def start_server():
    request_queue = Queue()
    connections = {}
    queue_lock = asyncio.Lock()

    print("ghaskdhasjdg")

    llm = openllm.LLM("mistralai/Mixtral-8x7B-Instruct-v0.1")

    print("askjdhakjsdh")

    async def handler(websocket, path):
        client_id = str(uuid.uuid4())
        connections[client_id] = websocket
        try:
            while True:
                message = await websocket.recv()
                print(f"Received message: {message}")
                await request_queue.put((client_id, message))
                await websocket.send("Echo: " + message)
        except websockets.ConnectionClosed:
            print(f"Client {client_id} disconnected")
            del connections[client_id]

    async def response_handler():
        while True:
            async with queue_lock:
                client_id, script = await request_queue.get()

                response = await llm.generate(script)


                print(response.outputs[0].text)

                websocket = connections.get(client_id)
                if websocket and websocket.open:
                    print("Responding to client", client_id)
                    await websocket.send(response.outputs[0].text)

    server = await websockets.serve(handler, "0.0.0.0", 80)
    await asyncio.gather(server.wait_closed(), response_handler())

# Run the server
asyncio.run(start_server())
