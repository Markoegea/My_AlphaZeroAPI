const buttonTTT= document.getElementById('buttonTTT');
const buttonCF = document.getElementById('buttonCF');
const home = window.location.origin;

buttonTTT.addEventListener('click', () => {
  window.location.replace(home + '/tic_tac_toe')
});

buttonCF.addEventListener('click', () => {
  window.location.replace(home + '/connect_four')
});