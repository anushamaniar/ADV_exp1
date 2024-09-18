# Load necessary libraries
library(ggplot2)
library(dplyr)

# Load the dataset
crime_data <- read.csv("Crime_Data_Reduced.csv")

# Convert dates to date format
crime_data$Date_Rptd <- as.Date(crime_data$Date.Rptd, format = "%m/%d/%Y")
crime_data$DATE_OCC <- as.Date(crime_data$DATE.OCC, format = "%m/%d/%Y")

# Filter the data to remove rows with missing values in important columns
crime_data_clean <- crime_data %>%
  filter(!is.na(AREA.NAME), !is.na(Crm.Cd.Desc), !is.na(Vict.Age))

# Bar chart of crime frequency by area
library(ggplot2)
ggplot(crime_data, aes(x = AREA.NAME)) +
  geom_bar(fill = "blue") +
  theme(axis.text.x = element_text(angle = 90, hjust = 1)) +
  labs(title = "Crime Frequency by Area", x = "Area", y = "Count")

# Top 10 most frequent crime code descriptions
top_crime_codes <- sort(table(crime_data$Crm.Cd.Desc), decreasing = TRUE)[1:10]
# Pie chart for the top 10 crime code descriptions
pie(top_crime_codes, 
    main = "Top 10 Crimes by Crime Code Description", 
    col = rainbow(length(top_crime_codes)), 
    cex = 0.8)  # Adjust text size for readability

# Histogram of victim ages
ggplot(crime_data, aes(x = Vict.Age)) +
  geom_histogram(binwidth = 5, fill = "purple", color = "black") +
  labs(title = "Distribution of Victim Ages", x = "Age", y = "Frequency")

#Timeline
crime_summary <- crime_data %>%
  group_by(Date_Rptd) %>%
  summarise(count = n(), .groups = 'drop')
# Plot the number of crimes over time
ggplot(crime_summary, aes(x = Date_Rptd, y = count)) +
  geom_line(color = "red") +
  labs(title = "Crime Reports Over Time", x = "Date Reported", y = "Number of Crimes")



# Scatter plot of victim age vs crime code
ggplot(crime_data, aes(x = Vict.Age, y = Crm.Cd)) +
  geom_point(color = "green") +
  labs(title = "Victim Age vs Crime Code", x = "Victim Age", y = "Crime Code")

# Bubble plot of crimes by area and victim age

ggplot(crime_data, aes(x = AREA.NAME, y = Vict.Age)) +
  geom_count(alpha = 0.5, color = "blue") +
  theme(axis.text.x = element_text(angle = 90, hjust = 1)) +
  labs(title = "Bubble Plot: Crimes by Area and Victim Age", x = "Area", y = "Victim Age")


# Create day of week and hour columns
crime_data$day_of_week <- weekdays(crime_data$DATE_OCC)
crime_data$hour <- as.numeric(format(as.POSIXct(crime_data$TIME.OCC, format="%H%M"), "%H"))

# Create a summary table
crime_summary <- crime_data %>%
  group_by(day_of_week, hour) %>%
  summarise(count = n(), .groups = 'drop')

# Create the heatmap
ggplot(crime_summary, aes(x = hour, y = day_of_week, fill = count)) +
  geom_tile() +
  scale_fill_gradient(low = "white", high = "red") +
  labs(title = "Heatmap of Crimes by Day of Week and Hour",
       x = "Hour of Day", y = "Day of Week", fill = "Number of Crimes") +
  theme_minimal() +
  scale_x_continuous(breaks = 0:23)

# Get top 5 crime types
top_crimes <- crime_data %>%
  count(Crm.Cd.Desc) %>%
  top_n(5, n) %>%
  pull(Crm.Cd.Desc)

# Filter data for top 5 crimes
crime_data_top5 <- crime_data %>%
  filter(Crm.Cd.Desc %in% top_crimes)

# Create the stacked bar chart
ggplot(crime_data_top5, aes(x = AREA.NAME, fill = Crm.Cd.Desc)) +
  geom_bar(position = "fill") +
  theme(axis.text.x = element_text(angle = 90, hjust = 1)) +
  labs(title = "Distribution of Top 5 Crime Types by Area",
       x = "Area", y = "Proportion", fill = "Crime Type") +
  scale_y_continuous(labels = scales::percent)

# Get top 10 crime types
top_10_crimes <- crime_data %>%
  count(Crm.Cd.Desc) %>%
  top_n(10, n) %>%
  pull(Crm.Cd.Desc)

# Filter data for top 10 crimes
crime_data_top10 <- crime_data %>%
  filter(Crm.Cd.Desc %in% top_10_crimes)

# Create the box plot
ggplot(crime_data_top10, aes(x = Crm.Cd.Desc, y = Vict.Age)) +
  geom_boxplot() +
  theme(axis.text.x = element_text(angle = 90, hjust = 1)) +
  labs(title = "Distribution of Victim Ages by Top 10 Crime Types",
       x = "Crime Type", y = "Victim Age")


