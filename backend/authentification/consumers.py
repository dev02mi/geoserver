import json
import redis
import uuid
import aioredis
from django.conf import settings
from django.contrib.sessions.models import Session 
# from django.contrib.sessions.backends.db import Session as DBSession
from django.contrib.sessions.backends.db import SessionStore
# from channels.generic.websocket import AsyncWebsocketConsumer
import urllib.parse
# Extract Redis configuration from CHANNEL_LAYERS
redis_host, redis_port = settings.CHANNEL_LAYERS["default"]["CONFIG"]["hosts"][0]
redis_client = redis.StrictRedis(host=redis_host, port=redis_port, decode_responses=True)
from channels.generic.websocket import AsyncWebsocketConsumer
from django.db import DatabaseError
# import asyncpg
from asgiref.sync import sync_to_async
class GISConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # self.session_id = "isvl8t76x271v5hnibv4yysrpi6uitum"
        # session_id = self.session_id
        # cookies = self.scope.get('cookies', {})
        print(f"Full scope: {self.scope}")
        self.session_id = self.scope.get('cookies', {}).get('sessionid', None)
        self.room_group_name = f"{self.session_id}" 
        print(f"Session ID from cookies: {self.session_id}")
        if self.session_id:
            try:
                session = await sync_to_async(Session.objects.get)(session_key=self.session_id)
                print(f"Session found in database: {session.session_key}")
                # Load the session for use during the WebSocket connection
                self.scope["session"] = SessionStore(session_key=self.session_id)
                # self.session_id = session_id
                await self.channel_layer.group_add(self.room_group_name, self.channel_name) #self.channel_name     dont assign any value for this
                #Data save in redis
                # redis = await aioredis.from_url(
                #     'redis://127.0.0.1:6379'
                # )
                # session_exists = await redis.hexists(session_id, "session_data")
                # if session_exists:
                #     print(f"Session data for {session_id} already exists in Redis. Ignoring.")
                # # Allow the WebSocket connection
                # else:
                #     # If session data does not exist, store it as None
                #     session_data = None
                #     # await redis.hmset_dict(session_id, {"session_data": session_data})
                #     await redis.hset(session_id, mapping={"session_data": "session_data"})
                #     print(f"Session data for {session_id} set to None in Redis.")
                # redis.close()
                # await redis.close()
                await self.accept()
            except Session.DoesNotExist:
                print("Invalid session ID. Rejecting connection.")
                await self.close()
        # else:
        #     new_session = await self.async_create_new_session()
        #     session_id = new_session.session_key
        #     print(f"New session created: {session_id}")
            
        #     # Save the new session in the scope for further use
        #     self.scope["session"] = new_session
        #     self.session_id = session_id
            
        #     # Allow the WebSocket connection
        #     await self.accept()
        await self.send(text_data=json.dumps({"type": "SESSION_ID", "sessionid": self.session_id}))

    @sync_to_async
    def async_create_new_session(self):
        # Create a new SessionStore, which will generate a session_key
        new_session = SessionStore()
        new_session.create()  # This saves the session into the django_session table
        return new_session
    
    async def disconnect(self, close_code):
        try:
            # Initialize Redis connection
            redis_client = await aioredis.from_url("redis://localhost")  # Update with your Redis URL
            if self.session_id:
                pass
                # Construct the Redis key and delete it
                redis_key = f"session:{self.session_id}"
                await redis_client.delete(redis_key)
                print(f"Deleted Redis key: {redis_key}")
                try:
                    await sync_to_async(Session.objects.filter(session_key=self.session_id).delete)()
                    print(f"Deleted session from django_session table: {self.session_id}")
                except DatabaseError as db_err:
                    print(f"Database error while deleting session: {db_err}")
                await self.channel_layer.group_discard("bhushan", self.channel_name)
                print(f"Removed WebSocket from the group for session: {self.session_id}")
            else:
                print("No session_id found, nothing to delete in Redis.")
        except Exception as e:
            print(f"Error during Redis cleanup: {e}")
        finally:
            # Clean up Redis connection if needed
            await redis_client.close()

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)  # Convert JSON string to dictionary
            print("Received Data:", data)

            action_type = data.get("type")
            message_text = data.get("message")
            # task_id = data.get("task_key", "No_task_ID")
            # print("Extracted task ID:", task_id)

            print("Extracted action type:", action_type)
            print("Received Message:", message_text)

            # ✅ Ensure correct event type
        #     await self.channel_layer.group_send(
        #     self.room_group_name, {"type": "chat.message", "message": message_text}
        # )
        #     print("✅ group_send executed successfully!") 

        except json.JSONDecodeError as e:
            print("❌ JSON Decode Error:", e)
        except Exception as e:
            print("❌ Unexpected Error:", e)

    async def chat_message(self, event):
        """Handles messages sent to the group"""
        text = event['message']
        task_id = event['task_key']
        print("🔄 Broadcasting message:", text)
        print("🔄 Broadcasting task ID:", task_id)
        await self.send(text_data=json.dumps({
            "type": "chat.message",
            "text": text,
            "task_id": task_id
        }))


























