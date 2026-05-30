import pandas as pd
import numpy as np

from sklearn.preprocessing import MinMaxScaler
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense


dataset = pd.read_csv("../dataset/weather.csv")

values = dataset[["temperature"]].values

scaler = MinMaxScaler()
scaled_data = scaler.fit_transform(values)

x_train = []
y_train = []

for i in range(10, len(scaled_data)):

    x_train.append(scaled_data[i-10:i])
    y_train.append(scaled_data[i])

x_train = np.array(x_train)
y_train = np.array(y_train)

model = Sequential()

model.add(LSTM(50, return_sequences=True, input_shape=(x_train.shape[1], 1)))
model.add(LSTM(50))
model.add(Dense(1))

model.compile(optimizer='adam', loss='mean_squared_error')

model.fit(x_train, y_train, epochs=10, batch_size=32)

model.save("../models/lstm_model.h5")

print("Model Trained Successfully")