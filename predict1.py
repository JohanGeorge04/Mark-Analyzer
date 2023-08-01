import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.preprocessing import PolynomialFeatures
import joblib

# Load data from the CSV file and skip the first row (header=None)
df = pd.read_csv('marks.csv', header=None, skiprows=1)

# Drop rows with missing values
df = df.dropna()

# Separate features (X) and target variable (y)
X = df.iloc[:, :].values


# Feature Scaling
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# Polynomial Features
poly_features = PolynomialFeatures(degree=2)
X_poly = poly_features.fit_transform(X_scaled)

# Load the trained model from the saved file
model_filename = 'ridge_regression_model.joblib'
loaded_model = joblib.load(model_filename)

new_data =  pd.read_csv('marks.csv', header=None, skiprows=1)
# Drop rows with missing values
new_data = new_data.dropna()

# Convert the new data to a numpy array
new_marks = new_data.values

# Use the same scaler and polynomial features on new data
new_marks_scaled = scaler.transform(new_marks)
new_marks_poly = poly_features.transform(new_marks_scaled)

# Make predictions on the new data using the loaded model
predicted_marks = loaded_model.predict(new_marks_poly)

formatted_marks = [f"{mark:.2f}" for mark in predicted_marks]
print(",".join(formatted_marks))