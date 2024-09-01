import os
import pandas as pd

# Define paths
input_folder_path = 'question-set'
output_csv_path = 'data.csv'

# Initialize data structures
questions_set = set()
questions_info = {}
companies_set = set()

# Iterate over files in the folder
for file_name in os.listdir(input_folder_path):
    file_path = os.path.join(input_folder_path, file_name)
    
    # Check if the file is a CSV file
    if file_name.endswith('.csv'):
        # Extract company name from file name
        company_name = file_name.split('_')[0]
        companies_set.add(company_name)
        
        # Read the CSV file
        df = pd.read_csv(file_path)
        
        # Iterate over each question in the CSV
        for _, row in df.iterrows():
            question_id = row.get('ID', 'Unknown')
            question_title = row.get('Title', 'Unknown')
            difficulty_level = row.get('Difficulty', 'Unknown')
            
            if question_title not in questions_set:
                questions_set.add(question_title)
                questions_info[question_title] = {
                    'ID': question_id,
                    'Difficulty Level': difficulty_level,
                    **{company: 'No' for company in companies_set}
                }
            questions_info[question_title][company_name] = 'Yes'

# Initialize DataFrame for the final output
questions_df = pd.DataFrame(questions_info).T
questions_df.reset_index(inplace=True)
questions_df.rename(columns={'index': 'Title'}, inplace=True)

# Ensure all company columns are present
for company in companies_set:
    if company not in questions_df.columns:
        questions_df[company] = 'No'

# Reorder columns to have 'Title' first, followed by 'ID', 'Difficulty Level', and company columns
columns_order = ['Title', 'ID', 'Difficulty Level'] + sorted(companies_set)
questions_df = questions_df[columns_order]

# Save to CSV
questions_df.to_csv(output_csv_path, index=False)

print(f"Data has been successfully written to {output_csv_path}")
