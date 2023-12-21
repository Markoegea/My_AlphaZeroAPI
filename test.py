import numpy as np
import onnxruntime as ort
from pmaz import game as Game

game = Game.ConnectFour()
initial_state = game.get_initial_state()

ort_session = ort.InferenceSession("models/model_4_64_ConnectFour/model_1_1_ConnectFour.onnx")

outputs = ort_session.run(
    None,
    {"input_state": np.expand_dims(game.get_encoded_state(initial_state).astype(np.float32), axis=0)}
)
print(outputs)