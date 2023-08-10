const board = document.getElementById('board')
const arcade = document.getElementById('arcade')
const numSquares = 9
const widthSquares = 7
const heightSquares = 6

let player = 'X';
let color = 'red';
const url = window.location.origin;

class ConnectFour{
  constructor(widthSquares, heightSquares, arcade, board, player, color, url){
    this.widthSquares = widthSquares
    this.heightSquares = heightSquares
    this.totalSquares = widthSquares * heightSquares
    this.board = board
    this.player = player
    this.color = color
    this.url = url
    this.handleClick = this.handleClick.bind(this)
    this.arcade = arcade
    let title = document.createElement('h1');
    title.innerText = 'ConnectFour'
    this.arcade.prepend(title);
  }

  create_board(){
    const width = (this.widthSquares * 100) + 100
    const height = this.heightSquares * 100 + 50
    this.board.style.width = width+'px'
    this.board.style.height = height+'px'
    for (let i = 0; i < this.totalSquares; i++) {
      let square = document.createElement('div');
      square.classList.add('square');
      square.classList.add(i%7);
      square.setAttribute('id', i);
      square.addEventListener('click', this.handleClick);
      this.board.appendChild(square);
    }
    
  }

  handleClick(event){
    if (this.player == 'X'){
      const square = event.target;
      const action = square.classList[1];
      this.selectSquare(action);
      const move = {'number' : action};
      this.sendMoveToServer(move);
    }
  }

  selectSquare(action){
    const elements = document.getElementsByClassName(action);
    for (let i = elements.length-1; i >= 0; i--){
      let element = elements[i];
      if (element.getElementsByTagName('h1').length == 0){
        const h1 = document.createElement('h1');
        h1.innerText = this.player;
        h1.style.color = this.color;
        element.appendChild(h1);
        this.player = this.player === 'X' ? 'O' : 'X';
        this.color = this.color === 'red' ? 'black' : 'red';
        break;
      }
      continue;
    }
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
      this.selectSquare(data['action'])
    }
    if ('result' in data) {
      let result = data['result']
      if(window.confirm(result)){
        window.location.reload()
      }
    }
  }
}

let connectFour = new ConnectFour(widthSquares, heightSquares, arcade, board, player, color, url)
connectFour.create_board()


