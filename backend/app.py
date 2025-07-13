from flask import Flask, request, jsonify
from flask_cors import CORS
import csv
import socket
from scheduler import GroupScheduler
from csv_parser import get_csv, parse_student_data, parse_all_constraints

app = Flask(__name__)
CORS(app)

@app.route('/api/upload', methods=['POST'])
def upload_csv():
    """
    upload csv file, parse into list of constraints, 
    run through scheduler, and return the student schedule
    expected format of the csv is FirstName, LastName, some number of binary attributes, availabilities (each column is a available time, 1 if available 0 if not)
    """

    try:
        # request.files is a dictionary of the files the user uploaded
        # request.form is a dictionary of the form data the user submitted

        csv_input = get_csv(request)
        if 'error' in csv_input:
            return jsonify({'error': csv_input['error']}), csv_input['status'] # this is an error message
            
        # check for student attributes (if they exist)
        given_attributes = []
        if request.form.get('given_attributes'):
            given_attributes = [attr.strip().lower() for attr in request.form['given_attributes'].split(',')]
        
        # get the data as df
        data = csv_input['data'] # get the data
        results = parse_student_data(data, given_attributes)
        if 'error' in results:
            return jsonify({'error': results['error']}), results['status']
        
        df = results['df']
        student_names = results['student_names']
        student_attributes = results['student_attributes']
        student_availabilities = results['student_availabilities']

        constraints = parse_all_constraints(request, len(df), len(student_availabilities[0]), given_attributes)

        # run the scheduler
        student_data = {
            'names': student_names,  
            'attributes': student_attributes,
            'availabilities': student_availabilities
        }
        
        scheduler = GroupScheduler(student_data, constraints)
        schedule = scheduler.schedule()

        return jsonify(schedule)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'smart groups is running / works'})

# def find_available_port(start_port=5000):
#     """find the first available port starting from start_port"""
#     port = start_port
#     while port < 65535:  # max port number lol
#         try:
#             with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
#                 s.bind(('localhost', port))
#                 return port
#         except OSError:
#             port += 1
#     raise RuntimeError("No available ports found")

if __name__ == '__main__':
    port = 5013 #find_available_port() # find first available port
    
    import os
    os.makedirs('../frontend/src/', exist_ok=True)
    
    with open('../frontend/src/backend-port.txt', 'w') as f:
        f.write(str(port))

    print(f"Starting Flask backend on http://localhost:{port} — for your information, but you don't have to do anything with this.") # tell them which port the backend is running on
    app.run(debug=True, host='localhost', port=port) # start the backend