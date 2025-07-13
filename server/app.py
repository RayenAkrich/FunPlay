from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import MySQLdb.cursors
from flask_mysqldb import MySQL
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# Config MySQL
app.config['MYSQL_HOST'] = '127.0.0.1'
app.config['MYSQL_PORT'] = 3306
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = '123456'  
app.config['MYSQL_DB'] = 'funplay'
app.config['MYSQL_CURSORCLASS'] = 'DictCursor'
mysql = MySQL(app)

@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    if not name or not email or not password:
        return jsonify({'message': 'Champs manquants'}), 400
    cursor = mysql.connection.cursor()
    cursor.execute('SELECT id FROM users WHERE nickname=%s OR email=%s', (name, email))
    if cursor.fetchone():
        return jsonify({'message': 'Nom ou email déjà utilisé'}), 409
    hashed_pwd = generate_password_hash(password)
    cursor.execute('INSERT INTO users (nickname, email, pwd) VALUES (%s, %s, %s)', (name, email, hashed_pwd))
    mysql.connection.commit()
    user_id = cursor.lastrowid
    cursor.close()
    return jsonify({
        'message': 'Inscription réussie !',
        'user': {
            'id': user_id,
            'nickname': name,
            'loginStreak': 1,
            'is_guest': False
        }
    }), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    if not email or not password:
        return jsonify({'message': 'Champs manquants'}), 400
    cursor = mysql.connection.cursor()
    cursor.execute('SELECT id, nickname, pwd, loginStreak, last_login, is_guest FROM users WHERE email=%s', (email,))
    user = cursor.fetchone()
    if not user or not check_password_hash(user['pwd'], password):
        cursor.close()
        return jsonify({'message': 'Email ou mot de passe incorrect'}), 401
    # Login streak logic (only for registered users)
    loginStreak = user['loginStreak'] or 0
    last_login = user['last_login']
    today = datetime.now().date()
    show_streak = False
    if not user['is_guest']:
        if last_login:
            last_login_date = last_login.date() if isinstance(last_login, datetime) else datetime.strptime(str(last_login), '%Y-%m-%d %H:%M:%S').date()
            if last_login_date == today - timedelta(days=1):
                loginStreak += 1
                show_streak = True
            elif last_login_date != today:
                loginStreak = 1
                show_streak = True
            # else: already logged in today, don't increment
        else:
            loginStreak = 1
            show_streak = True
        # Update loginStreak and last_login
        cursor.execute('UPDATE users SET loginStreak=%s, last_login=NOW() WHERE id=%s', (loginStreak, user['id']))
        mysql.connection.commit()
    cursor.close()
    msg = None
    if show_streak:
        msg = f"Bienvenue {user['nickname']} ! Série de connexions {loginStreak} jours, continuez comme ça !"
    return jsonify({'message': msg or f"Bienvenue {user['nickname']} !", 'user': {'id': user['id'], 'nickname': user['nickname'], 'loginStreak': loginStreak, 'is_guest': bool(user['is_guest']), 'message': msg}}), 200

@app.route('/api/guest', methods=['POST'])
def guest_login():
    cursor = mysql.connection.cursor()
    # Find the next available GuestNUMBER
    i = 1
    while True:
        guest_nick = f"Guest{i}"
        cursor.execute('SELECT id FROM users WHERE nickname=%s', (guest_nick,))
        if not cursor.fetchone():
            break
        i += 1
    cursor.execute('INSERT INTO users (nickname, email, pwd, is_guest) VALUES (%s, %s, %s, %s)', (guest_nick, f"{guest_nick.lower()}@guest.funplay", '', 1))
    mysql.connection.commit()
    user_id = cursor.lastrowid
    cursor.close()
    return jsonify({'message': f"Bienvenue {guest_nick} (invité) !", 'user': {'id': user_id, 'nickname': guest_nick, 'is_guest': True}}), 200

@app.route('/api/edit-profile', methods=['PUT'])
def update_profile():
    data = request.get_json()
    user_id = data.get('userId')
    nickname = data.get('nickname')
    email = data.get('email')
    old_password = data.get('oldPassword')
    new_password = data.get('newPassword')
    # Check if old_password is correct
    cursor = mysql.connection.cursor()
    cursor.execute('SELECT pwd FROM users WHERE id=%s', (user_id,))
    user = cursor.fetchone()
    if not user or not check_password_hash(user['pwd'], old_password):
        cursor.close()
        return jsonify({'message': 'Ancien mot de passe incorrect'}), 401

    if not user_id or not nickname or not email:
        return jsonify({'message': 'Champs manquants'}), 400

    if new_password:
        # Validate and hash new_password
        new_password = generate_password_hash(new_password)

    cursor = mysql.connection.cursor()
    cursor.execute('UPDATE users SET nickname=%s, email=%s, pwd=%s WHERE id=%s', (nickname, email, new_password, user_id))
    mysql.connection.commit()
    # Fetch updated user info
    cursor.execute('SELECT id, nickname, email, loginStreak, is_guest FROM users WHERE id=%s', (user_id,))
    updated_user = cursor.fetchone()
    cursor.close()
    return jsonify({'message': 'Profil mis à jour !', 'user': {
        'id': updated_user['id'],
        'nickname': updated_user['nickname'],
        'email': updated_user['email'],
        'loginStreak': updated_user['loginStreak'],
        'is_guest': False
    }}), 200
    
@app.route('/api/create-room', methods=['POST'])
def create_room():
    data = request.get_json()
    owner_id = data.get('ownerId')
    roomForm= data.get('roomForm')
    if not roomForm or not owner_id:
        return jsonify({'message': 'Champs manquants'}), 400
    # Getting game's id
    cursor = mysql.connection.cursor()
    cursor.execute('SELECT id FROM games WHERE gameName=%s', (roomForm['game'],))
    game = cursor.fetchone()
    if not game:
        cursor.close()
        return jsonify({'message': 'Jeu introuvable'}), 404
    cursor.execute('INSERT INTO rooms (ownerUserID, gameID, pass, isfull) VALUES (%s, %s, %s, %s)', (owner_id, game['id'], roomForm['password'], 0))
    mysql.connection.commit()
    room_id = cursor.lastrowid
    # Add owner to room_users
    cursor.execute('INSERT INTO room_users (roomID, userID) VALUES (%s, %s)', (room_id, owner_id))
    mysql.connection.commit()
    cursor.close()
    # Notify all clients that rooms have changed
    socketio.emit('rooms_updated')
    return jsonify({'message': 'Salle créée avec succès', 'roomId': room_id}), 201

@app.route('/api/rooms', methods=['GET'])
def get_rooms():
    game = request.args.get('game')
    status = request.args.get('status')
    privacy = request.args.get('privacy')
    cursor = mysql.connection.cursor()
    query = '''SELECT r.id, r.ownerUserID, u.nickname as host, g.gameName as game, r.isfull, r.pass
               FROM rooms r
               JOIN users u ON r.ownerUserID = u.id
               JOIN games g ON r.gameID = g.id'''
    filters = []
    params = []
    if game:
        filters.append('g.gameName=%s')
        params.append(game)
    if status:
        if status == 'open':
            filters.append('r.isfull=0')
        elif status == 'full':
            filters.append('r.isfull=1')
    if privacy:
        if privacy == 'public':
            filters.append('(r.pass IS NULL OR r.pass = \'\')')
        elif privacy == 'private':
            filters.append('r.pass IS NOT NULL AND r.pass != \'\'')
    if filters:
        query += ' WHERE ' + ' AND '.join(filters)
    cursor.execute(query, tuple(params))
    rooms = cursor.fetchall()
    # Format status and privacy
    for r in rooms:
        r['status'] = 'full' if r['isfull'] else 'open'
        r['privacy'] = 'private' if r['pass'] else 'public'
        del r['isfull']
        del r['pass']
    cursor.close()
    return jsonify({'rooms': rooms}), 200

@app.route('/api/join-room', methods=['POST'])
def join_room():
    data = request.get_json()
    room_id = data.get('roomId')
    password = data.get('password', '')
    user_id = data.get('userId')
    cursor = mysql.connection.cursor()
    cursor.execute('SELECT ownerUserID, pass, isfull FROM rooms WHERE id=%s', (room_id,))
    room = cursor.fetchone()
    if not room:
        cursor.close()
        return jsonify({'message': 'Salle introuvable'}), 404
    if room['isfull']:
        cursor.close()
        return jsonify({'message': 'Salle pleine'}), 403
    if room['ownerUserID'] == user_id:
        cursor.close()
        return jsonify({'message': 'Vous êtes déjà le propriétaire de cette salle'}), 400
    if room['pass'] and room['pass'] != password:
        cursor.close()
        return jsonify({'message': 'Mot de passe incorrect'}), 401
    # Add user to room_users
    cursor.execute('INSERT INTO room_users (roomID, userID) VALUES (%s, %s)', (room_id, user_id))
    mysql.connection.commit()
    # Making the room full after joining
    cursor.execute('UPDATE rooms SET isfull=1 WHERE id=%s', (room_id,))
    mysql.connection.commit()
    cursor.close()
    # Notify all clients that rooms have changed
    socketio.emit('rooms_updated')
    return jsonify({'message': 'Accès autorisé'}), 200

@app.route('/api/remove-user-from-room', methods=['POST'])
def remove_user_from_room():
    data = request.get_json()
    room_id = data.get('roomId')
    user_id = data.get('userId')
    cursor = mysql.connection.cursor()
    # Remove user from room_users
    cursor.execute('DELETE FROM room_users WHERE roomID=%s AND userID=%s', (room_id, user_id))
    mysql.connection.commit()
    # Check if only owner remains
    cursor.execute('SELECT COUNT(*) as cnt FROM room_users WHERE roomID=%s', (room_id,))
    count = cursor.fetchone()['cnt']
    cursor.execute('SELECT ownerUserID FROM rooms WHERE id=%s', (room_id,))
    owner = cursor.fetchone()['ownerUserID']
    if count == 1:
        # Only owner remains, set isfull to false
        cursor.execute('UPDATE rooms SET isfull=0 WHERE id=%s', (room_id,))
        mysql.connection.commit()
    cursor.close()
    return jsonify({'message': 'Utilisateur retiré de la salle'}), 200

@app.route('/api/delete-room', methods=['POST'])
def delete_room():
    data = request.get_json()
    room_id = data.get('roomId')
    cursor = mysql.connection.cursor()
    # Delete all users from room_users
    cursor.execute('DELETE FROM room_users WHERE roomID=%s', (room_id,))
    # Delete the room
    cursor.execute('DELETE FROM rooms WHERE id=%s', (room_id,))
    mysql.connection.commit()
    cursor.close()
    # Notify all clients that rooms have changed
    socketio.emit('rooms_updated')
    return jsonify({'message': 'Salle supprimée'}), 200

@app.route('/api/leaderboard', methods=['GET'])
def get_leaderboard():
    game_name = request.args.get('game')
    cursor = mysql.connection.cursor()
    # Get game id from name
    cursor.execute('SELECT id FROM games WHERE gameName=%s', (game_name,))
    game = cursor.fetchone()
    if not game:
        cursor.close()
        return jsonify({'leaderboard': []})
    game_id = game['id']
    # Get top 3 players for this game
    cursor.execute('''SELECT l.score, u.nickname FROM leaderboard l
                      JOIN users u ON l.idPlayer = u.id
                      WHERE l.game_id=%s
                      ORDER BY l.score DESC LIMIT 3''', (game_id,))
    top_players = cursor.fetchall()
    cursor.close()
    return jsonify({'leaderboard': top_players})

@app.errorhandler(Exception)
def handle_exception(e):
    print('Exception:', e)
    return jsonify({'message': 'Erreur serveur', 'error': str(e)}), 500

if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=5000, debug=True, allow_unsafe_werkzeug=True)
