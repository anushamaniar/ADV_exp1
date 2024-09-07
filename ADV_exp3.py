import streamlit as st
import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt
import plotly.express as px
import plotly.graph_objects as go
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, confusion_matrix, classification_report
import numpy as np

# Load dataset
df = pd.read_csv("C:/Users/Anusha/Desktop/ADV_3/filtered_diabetes_dataset.csv")

st.title("Interactive Diabetes Data Dashboard")

# Sidebar filters
st.sidebar.header("Filter Options")
location_filter = st.sidebar.multiselect("Select Location", options=df['location'].unique(), default=df['location'].unique())
gender_filter = st.sidebar.multiselect("Select Gender", options=df['gender'].unique(), default=df['gender'].unique())
age_filter = st.sidebar.slider("Select Age Range", int(df['age'].min()), int(df['age'].max()), (int(df['age'].min()), int(df['age'].max())))

# Apply filters
filtered_df = df[(df['location'].isin(location_filter)) & 
                 (df['gender'].isin(gender_filter)) & 
                 (df['age'] >= age_filter[0]) & 
                 (df['age'] <= age_filter[1])]

st.write(f"Filtered Dataset: {len(filtered_df)} rows")

# Display filtered dataset
st.dataframe(filtered_df)

### BASIC CHARTS

# Bar chart
st.subheader("Bar Chart: Hypertension Count by Location")
bar_chart_data = filtered_df.groupby('location')['hypertension'].sum().reset_index()
fig_bar = px.bar(bar_chart_data, x='location', y='hypertension', title='Hypertension Count by Location')
st.plotly_chart(fig_bar)

# Pie Chart for Race Distribution
st.markdown("### Pie Chart: Race Distribution")
race_data = df.iloc[:, 4:9].sum().reset_index(name='Count')
race_data.columns = ['Race', 'Count']
fig = px.pie(race_data, values='Count', names='Race', title='Race Distribution')
st.plotly_chart(fig)


# Pie chart
st.subheader("Pie Chart: Distribution of Diabetes")
pie_chart_data = filtered_df['diabetes'].value_counts()
fig_pie = px.pie(values=pie_chart_data, names=pie_chart_data.index, title="Distribution of Diabetes")
st.plotly_chart(fig_pie)


# Histogram
st.subheader("Histogram: BMI Distribution")
fig_hist = px.histogram(filtered_df, x='bmi', title="BMI Distribution")
st.plotly_chart(fig_hist)

# Scatter plot
st.subheader("Scatter Plot: Blood Glucose Level vs Age")
fig_scatter = px.scatter(filtered_df, x='age', y='blood_glucose_level', color='gender', title="Blood Glucose Level vs Age")
st.plotly_chart(fig_scatter)

# Bubble plot
st.subheader("Bubble Plot: Age vs BMI")
fig_bubble = px.scatter(filtered_df, x='age', y='bmi', size='blood_glucose_level', color='location', title="Age vs BMI")
st.plotly_chart(fig_bubble)

### ADVANCED CHARTS

# Box and whisker plot
st.subheader("Box and Whisker Plot: BMI by Gender")
fig_box = px.box(filtered_df, x='gender', y='bmi', title="BMI Distribution by Gender")
st.plotly_chart(fig_box)

# Violin plot
st.subheader("Violin Plot: BMI by Race")
fig_violin = px.violin(filtered_df, x='race:Caucasian', y='bmi', title="BMI Distribution by Caucasian Race")
st.plotly_chart(fig_violin)

# Regression plot (linear)
st.subheader("Regression Plot: Blood Glucose Level vs BMI")
sns.regplot(x='bmi', y='blood_glucose_level', data=filtered_df)
st.pyplot(plt.gcf())
plt.clf()

# 3D Scatter plot
st.subheader("3D Chart: Age, BMI, and Blood Glucose Level")
fig_3d = px.scatter_3d(filtered_df, x='age', y='bmi', z='blood_glucose_level', color='gender', title="3D Scatter: Age, BMI, Blood Glucose Level")
st.plotly_chart(fig_3d)

# Line chart
st.subheader("Line Chart: Average BMI Over the Years")
line_chart_data = filtered_df.groupby('year')['bmi'].mean().reset_index()
fig_line = px.line(line_chart_data, x='year', y='bmi', title="Average BMI Over the Years")
st.plotly_chart(fig_line)

# Area chart
st.subheader("Area Chart: Heart Disease Count Over the Years")
area_chart_data = filtered_df.groupby('year')['heart_disease'].sum().reset_index()
fig_area = px.area(area_chart_data, x='year', y='heart_disease', title="Heart Disease Count Over the Years")
st.plotly_chart(fig_area)

# Waterfall chart
st.subheader("Waterfall Chart: BMI Breakdown by Gender")
waterfall_chart_data = filtered_df.groupby('gender')['bmi'].mean().reset_index()
fig_waterfall = go.Figure(go.Waterfall(
    name="BMI", orientation="v",
    measure=["relative"] * len(waterfall_chart_data),
    x=waterfall_chart_data['gender'], y=waterfall_chart_data['bmi']
))
fig_waterfall.update_layout(title="Waterfall: BMI Breakdown by Gender")
st.plotly_chart(fig_waterfall)

# Donut chart
st.subheader("Donut Chart: Smoking History Distribution")
smoking_data = filtered_df['smoking_history'].value_counts()
fig_donut = px.pie(values=smoking_data, names=smoking_data.index, hole=0.4, title="Smoking History Distribution")
st.plotly_chart(fig_donut)

# Treemap
st.subheader("Treemap: BMI by Location and Gender")
fig_treemap = px.treemap(filtered_df, path=['location', 'gender'], values='bmi', title="Treemap: BMI by Location and Gender")
st.plotly_chart(fig_treemap)

# Funnel chart
st.subheader("Funnel Chart: Diabetes Count by Location")
funnel_data = filtered_df.groupby('location')['diabetes'].sum().reset_index()
fig_funnel = px.funnel(funnel_data, x='location', y='diabetes', title="Diabetes Count by Location")
st.plotly_chart(fig_funnel)

### Predictive Modeling Section ###
st.subheader("Predictive Modeling: Diabetes Prediction")

# Prepare the data for modeling
X = filtered_df[['age', 'bmi', 'blood_glucose_level', 'hypertension', 'heart_disease']]
y = filtered_df['diabetes']

# Split the data into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Build and train the model
model = LogisticRegression(max_iter=1000)
model.fit(X_train, y_train)

# Make predictions
y_pred = model.predict(X_test)

# Display the results
st.write(f"Accuracy: {accuracy_score(y_test, y_pred):.2f}")
st.write("Confusion Matrix:")
st.write(confusion_matrix(y_test, y_pred))
st.write("Classification Report:")
st.write(classification_report(y_test, y_pred))

### Health Analytics Section ###
st.subheader("Health Analytics: Correlation Analysis")

# Correlation heatmap
corr_matrix = filtered_df[['age', 'bmi', 'blood_glucose_level', 'hypertension', 'heart_disease']].corr()
sns.heatmap(corr_matrix, annot=True, cmap='coolwarm')
st.pyplot(plt.gcf())
plt.clf()

### Observations ###
st.subheader("Observations")
st.markdown("""
- **Bar Chart**: Hypertension is concentrated in certain locations like Texas, Nevada, Connecticut.
- **Pie Chart**: The majority of the sample (almost 21%) are of the race AfricanAmericans.
- **Pie Chart**: The majority of the population (almost 92%) does not have diabetes.
- **Histogram**: The mode of BMI lies between 27-27.5 with about 1696 entries of that range of BMI. 
- **Scatter Plot**: A large number of individuals have blood glucose levels between 100 and 150, regardless of their age. 
Blood glucose levels above 250 are observed in a few individuals, with a slight increase as age progresses. 
There seems to be a higher concentration of males with blood glucose levels between 100 and 150, while females are more spread across higher levels of glucose.
Blood glucose levels mostly fall in the range of 100-150 for both genders, with some individuals across all age groups showing higher glucose levels, but without a strong correlation between age and blood glucose level.
- **Bubble Plot**: The plot shows a wide distribution of BMI values across all age groups, ranging from approximately 15 to 60. There's a slight upward trend in BMI as age increases, particularly noticeable from ages 20 to 60. The highest concentration of data points appears to be in the 20-60 age range and 20-40 BMI range. Outliers exist, with some individuals having very high BMIs (above 60) across different age groups. The plot suggests that while there's a general tendency for BMI to increase with age, there's considerable variation within each age group.
- **Box and Whisker Plot**: The median BMI for both males and females is around 30, with the interquartile range (IQR) similar for both genders. Females exhibit more outliers, with several individuals having a BMI exceeding 50, while males have fewer outliers in the upper range.The BMI range for both genders is similar, but females have a wider distribution of higher BMI values compared to males.The distribution for both genders shows symmetry around the median, indicating a balanced spread of BMI values.
- **Violin Plot**: The chart shows a violin plot depicting the distribution of Body Mass Index (BMI) based on whether individuals are classified as Caucasian (1) or not (0). The two violin plots demonstrate a similar shape for both groups, with a concentration of BMI values around 25-30, suggesting that most individuals in both categories fall within this range. There are outliers in both groups, with some values extending up to around 70. Overall, the distribution is relatively symmetrical in both cases, with slight tails for higher BMI values in both Caucasian and non-Caucasian groups.
- **Regression Plot**: There is a weak positive trend, as indicated by the faintly upward-sloping regression line, suggesting a slight increase in blood glucose level as BMI increases. However, the data points are scattered with a high concentration of values around blood glucose levels of 100, 150, and 200, showing a more prominent distribution in these ranges. The wide range of blood glucose levels, especially those exceeding 250, shows that high blood glucose can occur at various BMI levels, but there is no strong linear correlation between the two variables.
- **3D Chart**: Interesting clusters can be seen based on gender, age, BMI and blood glucose level.
- **Line Chart**: Avg BMI was almost constant from 2015 to 2019 (around 27) but decreased sharply from 2019(27) to 2020(17.4).
- **Area Chart**: The plot shows a relatively stable and low count from 2015 to 2018, with a slight downward trend. However, there's a dramatic spike in 2019, where the count rises sharply to around 175 cases. This peak is followed by an equally dramatic decline in 2020, returning to levels similar to or lower than the pre-2019 period. The stark contrast between 2019 and the other years suggests an anomaly or significant event affecting heart disease counts during that year.
- **Waterfall**: The female bar extends from 0 to approximately 28 on the y-axis, while the male bar starts at the top of the female bar and extends further to about 54. This visualization suggests that males have a higher total or average BMI compared to females. The chart effectively illustrates the difference in BMI distribution between genders, with males showing a notably larger BMI value or range. 
- **Donut Chart**: The largest segment, comprising 36.5%, represents individuals who have never smoked. The second-largest category, at 34.8%, is for those with "No Info" on their smoking history. Former smokers make up for about 9.34%, while current smokers account for 9.31%. A small portion (6.09%) is labeled as "not current" smokers.
- **Treemap**: The layout shows diversity in BMI across different states, with noticeable variations in the sizes of male and female rectangles, hinting at gender-based differences in BMI across the regions. Some states, like Puerto Rico and Montana, have distinctively large segments for one gender, possibly indicating a skewed BMI distribution.
- **Funnel**: Most locations have counts between 5 and 10, with a few outliers reaching higher counts. Some locations, such as Michigan and West Virginia, appear to have higher diabetes counts, while others like Wyoming show lower numbers. The chart provides a quick visual comparison of diabetes prevalence across different geographical areas, highlighting regional variations in the disease's occurrence.
- **Predictive Modeling**: The Logistic Regression model predicts diabetes with reasonable accuracy of 94%. Important features include age, BMI, hypertension, heart disease, and blood glucose level.
- **Health Analytics**: Correlation analysis shows strong relationships between BMI and age. Also between hypertension and heart diesease along with age.
""")
