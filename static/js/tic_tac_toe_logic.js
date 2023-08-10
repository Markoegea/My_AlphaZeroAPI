const board = document.getElementById('board')
const arcade = document.getElementById('arcade')
const numSquares = 9
const widthSquares = 7
const heightSquares = 6

let player = 'X';
let color = 'red';
const url = window.location.origin;

class TicTacToe{
  constructor(numSquares, board, player, color, url){
    this.numSquares = numSquares
    this.board = board
    this.player = player
    this.color = color
    this.url = url
    this.handleClick = this.handleClick.bind(this)
  }

  create_board(){
    const width = ((this.numSquares/3) * 100) + 100
    const height = (this.numSquares/3) * 100
    this.board.style.width = width+'px'
    this.board.style.height = height+'px'
    for (let i = 0; i < numSquares; i++) {
      let square = document.createElement('div');
      square.classList.add('square');
      square.setAttribute('id', i)
      square.addEventListener('click', this.handleClick);
      this.board.appendChild(square)
    }
  }

  handleClick(event){
    if (this.player == 'X'){
      const square = event.target;
      this.selectSquare(square);
      const move = {'number' : square.id};
      this.sendMoveToServer(move);
    }
  }

  selectSquare(element){
    const h1 = document.createElement('h1');
    h1.innerText = this.player;
    h1.style.color = this.color;
    element.appendChild(h1);
    this.player = this.player === 'X' ? 'O' : 'X';
    this.color = this.color === 'red' ? 'black' : 'red'
  }

  sendMoveToServer(move){
    fetch(this.url + '/move_to', {
      method: 'POST',
      headers:{
        'Content-Type' : 'application/json'
      },
      body: JSON.stringify(move)
    })
    .then(response => response.json())
    .then(data => {
      this.handleDict(data)
    })
    .catch(error => {
      console.log(error)
    });
  }

  handleDict(data){
    if ('error' in data){
      console.log(data['error'])
      return
    }
    if ('action' in data){
      const square = document.getElementById(data['action'])
      this.selectSquare(square)
    }
    if ('result' in data) {
      let result = data['result']
      if(window.confirm(result)){
        window.location.reload()
      }
    }
  }
}

let ticTacToe = new TicTacToe(numSquares, board, player, color, url)
ticTacToe.create_board()


