import asyncio
import websockets
import uuid
from queue import Queue


request_queue = Queue()

connections = {}


async def handler(websocket, path):
  client_id = str(uuid.uuid4())
  connections[client_id] = websocket
  message = await websocket.recv()
  print(f"Received message: {message}")
  
  # request_queue.put((client_id, message))
  
  await websocket.send("Echo: " + message)

# async def response_handler():
#   while True:
#     client_id, script = request_queue.get()
    
#     websocket = connections[client_id]
    
#     print("responding")
    
#     if websocket:
#       await websocket.send(script)
#       await websocket.close()


start_server = websockets.serve(handler, "localhost", 6789)

asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()
