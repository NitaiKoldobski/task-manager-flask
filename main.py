from datetime import datetime, date
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy


app = Flask(__name__)
CORS(app)

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///app.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db = SQLAlchemy(app)


class UserORM(db.Model):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True, index=True)
    username = db.Column(db.String, unique=True, index=True, nullable=False)
    password = db.Column(db.String, nullable=False)
    tasks = db.relationship("TaskORM", back_populates="owner", cascade="all, delete-orphan")

class TaskORM(db.Model):
    __tablename__ = "tasks"
    id = db.Column(db.Integer, primary_key=True, index=True)
    title = db.Column(db.String, nullable=False)
    description = db.Column(db.String, default="")
    due_date = db.Column(db.Date, nullable=True)
    completed = db.Column(db.Boolean, default=False)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    owner = db.relationship("UserORM", back_populates="tasks")


with app.app_context():
    db.create_all()


@app.route("/")
def root():
    return {"msg": "Flask-Task-API is running "}


@app.post("/register")
def register():
    data = request.get_json()
    if UserORM.query.filter_by(username=data["username"]).first():
        return jsonify({"error": "User already exists"}), 400
    user = UserORM(username=data["username"], password=data["password"])
    db.session.add(user)
    db.session.commit()
    return {"msg": "User created successfully"}

@app.post("/login")
def login():
    data = request.get_json()
    user = UserORM.query.filter_by(username=data["username"]).first()
    if not user:
        return jsonify({"error": "User not found"}), 404
    if user.password != data["password"]:
        return jsonify({"error": "Incorrect username or password"}), 400
    return {"msg": "Login successful!"}

@app.get("/users")
def get_users():
    rows = UserORM.query.all()
    return {"users": [{"username": u.username} for u in rows]}


def _get_user_or_404(username: str) -> UserORM:
    user = UserORM.query.filter_by(username=username).first()
    if not user:
        raise ValueError("User not found")
    return user


@app.get("/tasks")
def list_tasks():
    username = request.args.get("username")
    user = _get_user_or_404(username)
    return jsonify([
        {
            "id": t.id,
            "title": t.title,
            "description": t.description,
            "due_date": str(t.due_date) if t.due_date else None,
            "completed": t.completed
        }
        for t in user.tasks
    ])

@app.post("/tasks")
def create_task():
    username = request.args.get("username")
    data = request.get_json()
    user = _get_user_or_404(username)


    due_date = None
    if data.get("due_date"):
        try:
            due_date = datetime.strptime(data["due_date"], "%Y-%m-%d").date()
        except ValueError:
            return jsonify({"error": "Invalid date format, must be YYYY-MM-DD"}), 400

    task = TaskORM(
        title=data["title"],
        description=data.get("description", ""),
        due_date=due_date,
        completed=False,
        owner=user,
    )
    db.session.add(task)
    db.session.commit()
    return {
        "id": task.id,
        "title": task.title,
        "description": task.description,
        "due_date": str(task.due_date) if task.due_date else None,
        "completed": task.completed,
    }

@app.patch("/tasks/<int:task_id>/toggle")
def toggle_complete(task_id):
    username = request.args.get("username")
    user = _get_user_or_404(username)
    task = TaskORM.query.filter_by(id=task_id, user_id=user.id).first()
    if not task:
        return jsonify({"error": "Task not found"}), 404
    task.completed = not task.completed
    db.session.commit()
    return {
        "id": task.id,
        "title": task.title,
        "description": task.description,
        "due_date": str(task.due_date) if task.due_date else None,
        "completed": task.completed,
    }

@app.delete("/tasks/<int:task_id>")
def delete_task(task_id):
    username = request.args.get("username")
    user = _get_user_or_404(username)
    task = TaskORM.query.filter_by(id=task_id, user_id=user.id).first()
    if not task:
        return jsonify({"error": "Task not found"}), 404
    db.session.delete(task)
    db.session.commit()
    return {"msg": "Task deleted"}


if __name__ == "__main__":
    app.run(debug=True, port=5001)