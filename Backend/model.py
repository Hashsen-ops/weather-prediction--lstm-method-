from tensorflow.keras.models import load_model

model = load_model("../models/lstm_model.h5")


def predict_weather(data):

    prediction = model.predict(data)

    return prediction