
# Install required packages if not already installed
if (!require(ggplot2)) install.packages("ggplot2", dependencies=TRUE)
if (!require(dplyr)) install.packages("dplyr", dependencies=TRUE)
if (!require(tidyr)) install.packages("tidyr", dependencies=TRUE)
if (!require(plotly)) install.packages("plotly", dependencies=TRUE)

library(ggplot2)
library(dplyr)
library(tidyr)
library(plotly)

# Load the dataset
housing_data <- read.csv("Housing.csv.xls")

### 1. Word Cloud (using word frequency)

housing_data$furnishingstatus <- as.character(housing_data$furnishingstatus)

# Create a frequency table for the 'furnishingstatus' column
word_freq <- table(housing_data$furnishingstatus)

housing_data$furnishingstatus <- gsub("semi-furnished", "semi-furn", housing_data$furnishingstatus)
word_freq <- table(housing_data$furnishingstatus)
wordcloud(words = names(word_freq), freq = as.vector(word_freq), min.freq = 1,
          max.words = Inf, random.order = FALSE, rot.per = 0.35, 
          colors = brewer.pal(8, "Dark2"), scale = c(3, 0.5))


### 2. Box and Whisker Plot
# Boxplot of price by number of bedrooms
ggplot(housing_data, aes(x = factor(bedrooms), y = price)) +
  geom_boxplot() +
  labs(title = "Boxplot of House Prices by Number of Bedrooms",
       x = "Number of Bedrooms",
       y = "Price") +
  theme_minimal()

### 3. Violin Plot
# Violin plot of price by number of bathrooms
ggplot(housing_data, aes(x = factor(bathrooms), y = price)) +
  geom_violin(trim = FALSE) +
  labs(title = "Violin Plot of House Prices by Number of Bathrooms",
       x = "Number of Bathrooms",
       y = "Price") +
  theme_minimal()

### 4. Regression Plot (Linear and Nonlinear)
# Linear regression plot
ggplot(housing_data, aes(x = area, y = price)) +
  geom_point() +
  geom_smooth(method = "lm", col = "blue") +
  labs(title = "Linear Regression of Price vs Area",
       x = "Area (sq ft)",
       y = "Price") +
  theme_minimal()

# Nonlinear regression plot using a polynomial
ggplot(housing_data, aes(x = area, y = price)) +
  geom_point() +
  geom_smooth(method = "lm", formula = y ~ poly(x, 2), col = "red") +
  labs(title = "Nonlinear Regression of Price vs Area",
       x = "Area (sq ft)",
       y = "Price") +
  theme_minimal()


### 5. 3D Scatter Plot
# Create a 3D scatter plot using plotly
plot_ly(data = housing_data, x = ~area, y = ~price, z = ~bedrooms, 
        type = 'scatter3d', mode = 'markers') %>%
  layout(title = "3D Scatter Plot of Price, Area, and Bedrooms",
         scene = list(xaxis = list(title = 'Area'),
                      yaxis = list(title = 'Price'),
                      zaxis = list(title = 'Bedrooms')))

### 6. Jitter Plot
# Jitter plot to show price distribution by furnishing status
ggplot(housing_data, aes(x = furnishingstatus, y = price)) +
  geom_jitter(width = 0.2, height = 0, alpha = 0.6) +
  labs(title = "Jitter Plot of House Prices by Furnishing Status",
       x = "Furnishing Status",
       y = "Price") +
  theme_minimal()
