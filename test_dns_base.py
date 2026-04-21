import socket
try:
    host = "ilqbukgxythqlalqmogh.supabase.co"
    print(f"Resolving {host}...")
    ip = socket.gethostbyname(host)
    print(f"IP: {ip}")
except Exception as e:
    print(f"DNS Resolution FAILED for {host}: {e}")
