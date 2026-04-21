import os
import subprocess

backend_dir = r"c:\Users\medha\Downloads\shnoor\2nd project video call\21 aprilmonring\Meeting-Frontend-main (1)\Meeting-Frontend-main\meetings-hosting\shnoor-meetings-backend"
print(f"Executing git in: {backend_dir}")
os.chdir(backend_dir)

try:
    # Initialize if not already
    if not os.path.exists(".git"):
        print("Initializing git...")
        subprocess.run(["git", "init"], check=True)
    
    # Create branch and commit
    current_branch = "stable-pre-deployment"
    subprocess.run(["git", "checkout", "-b", current_branch], check=False) # might exist
    subprocess.run(["git", "add", "."], check=True)
    subprocess.run(["git", "commit", "-m", "SAVE: Stable pre-deployment backup"], check=False)
    print(f"SUCCESS: Backend saved to branch '{current_branch}'")
except Exception as e:
    print(f"FAILED: {e}")
