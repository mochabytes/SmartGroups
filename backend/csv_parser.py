import io
import csv
import pandas as pd
from constraint_parser import SchedulingConstraints

def get_csv(request):
    if 'file' not in request.files:
        return {'error': 'No file part', 'status': 400}

    file = request.files['file'] # get the file user uploads

    if file.filename == '':
        return {'error': 'No selected file', 'status': 400}
    
    stream = io.StringIO(file.stream.read().decode("UTF8"), newline=None)
    csv_input = list(csv.reader(stream)) # csv_input is a list of lists, each inner list is a row
    
    return {'data': csv_input, 'status': 200}

def find_name_indices(headers_lower):
    name_columns = []
    if 'name' in headers_lower:
        name_columns = [headers_lower.index('name')]
    elif 'firstname' in headers_lower and 'lastname' in headers_lower:
        name_columns = [headers_lower.index('firstname'), headers_lower.index('lastname')]
    elif 'first name' in headers_lower and 'last name' in headers_lower:
        name_columns = [headers_lower.index('first name'), headers_lower.index('last name')]
    elif 'first' in headers_lower and 'last' in headers_lower:
        name_columns = [headers_lower.index('first'), headers_lower.index('last')]
    else:
        return {'error': 'CSV must have either "Name" column or "FirstName" and "LastName" columns', 'status': 400}
    return name_columns

def find_data_attributes(headers_lower, name_indices, student_attributes):
    attributes_indices = [i for i, header in enumerate(headers_lower) if header in student_attributes] # get the indices of the attributes columns
    availabilities_indices = [i for i, header in enumerate(headers_lower) if i not in name_indices and i not in attributes_indices]
    return attributes_indices, availabilities_indices

def parse_student_data(data, given_attributes):
    headers_lower = [str(header).lower() for header in data[0]] # first row of data is headers, make lower case

    # check that the name column(s) exist, and figure out which ones they are
    name_indices = find_name_indices(headers_lower)
    if isinstance(name_indices, dict):
        return {'error': name_indices['error'], 'status': name_indices['status']}

    # check if there are any student attributes not in headers_lower
    for attr in given_attributes:
        if attr not in headers_lower:
            return {'error': f'student attribute {attr} not found in the csv file. please check the format and try again.', 'status': 400}

    # get attributes and availabilities indices
    attribute_indices, availability_indices = find_data_attributes(headers_lower, name_indices, given_attributes)

    # now make the csv into a df
    df = pd.DataFrame(data[1:], columns=headers_lower)  # type: ignore

    # merge multiple name columns into one if needed
    if len(name_indices) > 1:
        # merge multiple name columns into one
        name_values = df.iloc[:, name_indices].apply(lambda row: ' '.join(row.astype(str)), axis=1)
        df['name'] = name_values
        # drop the original name columns
        df = df.drop(columns=[headers_lower[i] for i in name_indices])
        name_column = 'name'
    else:
        # single name column
        name_column = headers_lower[name_indices[0]]

    # reorder columns: Name, Attributes, Availabilities
    attribute_columns = [headers_lower[i] for i in attribute_indices]
    availability_columns = [headers_lower[i] for i in availability_indices]
    
    # create the new column order
    new_column_order = [name_column] + attribute_columns + availability_columns
    df = df[new_column_order]

    # get the student data, attributes, availabilities
    student_names = df[name_column].tolist()  # Simple list of strings
    student_attributes = df[attribute_columns].to_dict(orient='records') if attribute_columns else []  # type: ignore
    student_availabilities = df[availability_columns].to_dict(orient='records') if availability_columns else []  # type: ignore

    return {
        'df': df,
        'student_names': student_names,
        'student_attributes': student_attributes,
        'student_availabilities': student_availabilities,
    }

def parse_attribute_constraints(request, given_attributes):
    # get the constraints for each of the student attributes
    attribute_constraints = {}
    for attr in given_attributes:
        attr_constraints = {}
        
        # check for min constraint for this attribute
        min_key = f'{attr}_min_per_group'
        if min_key in request.form:
            attr_constraints['min_per_group'] = int(request.form[min_key])
        
        # check for max constraint for this attribute  
        max_key = f'{attr}_max_per_group'
        if max_key in request.form:
            attr_constraints['max_per_group'] = int(request.form[max_key])
        
        # only add if constraints were specified
        if attr_constraints:
            attribute_constraints[attr] = attr_constraints
    
    return attribute_constraints

def parse_all_constraints(request, num_students, num_availabilities, given_attributes):
    # get max + min students per group if entered
    if 'group_size_max' in request.form:
        group_size_max = int(request.form['group_size_max'])
    else:
        group_size_max = num_students # default max students per group to total number of students
    
    if 'group_size_min' in request.form:
        group_size_min = int(request.form['group_size_min'])
    else:
        group_size_min = 1 # default min students per group to 1

    # get number of groups wanted 
    if 'group_count_min' in request.form:
        group_count_min = int(request.form['group_count_min'])
    else:
        group_count_min = 1 # default min number of groups to 1

    if 'group_count_max' in request.form:
        group_count_max = int(request.form['group_count_max'])
    else:
        group_count_max = num_availabilities # default maximum is number of time slots
    
    # get the constraints for EACH of the student attributes
    attribute_constraints = parse_attribute_constraints(request, given_attributes)

    constraints = SchedulingConstraints(attribute_constraints, group_size_min, group_size_max, group_count_min, group_count_max)
    return constraints
