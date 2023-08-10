from flask import Flask, render_template, url_for, jsonify, request, session, redirect
from flask_session import Session
from PMAZ import agent as Agent
from PMAZ import game as Game
from PMAZ import model as Model
import torch
import numpy as np
#Runtime variables
device = 'cuda' if torch.cuda.is_available() else 'cpu'
args = {
    'C': 2,
    'num_searches': 600,
    'num_iterations':8,
    'num_selfPlay_iterations':500,
    'num_parallel_games':100,
    'num_epochs':4,
    'batch_size':32,
    'num_resBlocks': 4,
    'num_hidden' : 64,
    'temperature':1.25,
    'dirichlet_epsilon': 0.25,
    'dirichlet_alpha': 0.3,
}
tic_tac_toe_location = 'models/model_4_64_TicTacToe/model_7_TicTacToe.pth'
connect_four_location = 'models/model_4_64_ConnectFour/model_1_ConnectFour.pth'
player = 1

app = Flask(__name__)
app.config['SESSION_PERMANENT'] = True
app.config['SESSION_TYPE'] = 'filesystem'
Session(app)
 
@app.route('/')
def index():
  return render_template('welcome.html')

@app.route('/tic_tac_toe')
def tic_tac_toe():
  session['location'] = tic_tac_toe_location
  session['game'] = Game.TicTacToe()
  session['state'] = session.get('game').get_initial_state()
  return render_template('tic_tac_toe.html')

@app.route('/connect_four')
def connect_four():
  session['location'] = connect_four_location
  session['game'] = Game.ConnectFour()
  session['state'] = session.get('game').get_initial_state()
  return render_template('connect_four.html')

@app.route('/move_to', methods=['POST'])
def player_move():
  if request.method == 'POST':
    data = request.get_json()
    try:
      number:int = int(data['number'])
    except:
      return jsonify({'error': 'We cannot convert the action to integer'}), 502
    if isinstance(session.get('state'),np.ndarray) == False:
      return jsonify({'error': 'We cannot get the game state, sorry :('}), 502
    return jsonify(play_with_machine(session.get('game'), \
                                     player, \
                                      session.get('state'), \
                                          args, number, \
                                            session.get('location'), device)), 201
  return 'Nothing', 201

@app.route('/restart', methods=['GET'])
def restart_game():
  if request.method == 'GET':
    return redirect('/')
  

def play_with_machine(game, player, state, args, action, location, device):
    model = Model.ResNet(game, args['num_resBlocks'], args['num_hidden']).to(device)
    model.load_state_dict(torch.load(location, map_location=device))
    mcts = Agent.MCTS(game, args, model)
    model.eval()
    with torch.inference_mode():
      valid_moves = game.get_valid_moves(state)
      if valid_moves[action] == 0:
        return {'error':"action not valid"}
      session['state'] = game.get_next_state(state, action, player)
      is_terminal, message = checkWin(game, state, action, player)
      if is_terminal:
        return {'result' : message}
    
      player = game.get_opponent(player)
      neutral_state = game.change_perspective(state,player)
      mcts_probs = mcts.search(neutral_state)
      action = np.argmax(mcts_probs)
      session['state'] = game.get_next_state(state, action, player)
      is_terminal, message = checkWin(game, state, action, player)
      if is_terminal:
        return {'result' : message, 'action' : action.item()}
      
      player = game.get_opponent(player)
      return {'action' : action.item()}

def checkWin(game, state, action, player):
  value, is_terminal = game.get_value_and_terminated(state, action)
  message = ''
  if is_terminal:
    if value == 1:
      message = str(player) + ' won'
    else:
      message = 'draw'
  return is_terminal, message

if __name__ == '__main__':
  app.run(host='0.0.0.0', port=81)
