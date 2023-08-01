import numpy as np
import pandas as pd
from sklearn.linear_model import Ridge
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error
from sklearn.preprocessing import StandardScaler
from sklearn.preprocessing import PolynomialFeatures
import joblib

# Load data from the CSV file and skip the first row (header=None)
df = pd.read_csv('finald.csv', header=None, skiprows=1)

# Drop rows with missing values
df = df.dropna()

# Separate features (X) and target variable (y)
X = df.iloc[:, :-1].values
y = df.iloc[:, -1].values

# Feature Scaling
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# Polynomial Features
poly_features = PolynomialFeatures(degree=2)
X_poly = poly_features.fit_transform(X_scaled)

# Split the data into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(X_poly, y, test_size=0.2, random_state=42)

# Create a Ridge Regression model with regularization strength alpha=0.1
model = Ridge(alpha=0.1)

# Fit the model to the training data
model.fit(X_train, y_train)

# Save the trained model to a file using joblib
model_filename = 'ridge_regression_model.joblib'
joblib.dump(model, model_filename)

# Make predictions on the test data
y_pred = model.predict(X_test)

# Calculate metrics to evaluate the model
mse = mean_squared_error(y_test, y_pred)

print("Mean Squared Error:", mse)

# Example prediction using a new set of marks
new_marks = np.array([
    [65, 78, 70, 82],  # Marks in subsequent exam 1
    [70, 85, 68, 78],  # Marks in subsequent exam 2
    [58, 72, 65, 80],  # Marks in subsequent exam 3
    [75, 88, 77, 83]   # Marks in subsequent exam 4
])
new_marks_scaled = scaler.transform(new_marks)
new_marks_poly = poly_features.transform(new_marks_scaled)
predicted_mark = model.predict(new_marks_poly)
print("Predicted Mark:", predicted_mark)