# parse the csv file into list of constraints

class SchedulingConstraints:
    def __init__(self, attribute_constraints = None, group_size_min = None, group_size_max = None, group_count_min = None, group_count_max = None, combined_constraints = None):
        self.attribute_constraints = attribute_constraints or {}
        self.group_size_min = group_size_min or 1
        self.group_size_max = group_size_max or None
        self.group_count_min = group_count_min or 1
        self.group_count_max = group_count_max or None
        self.combined_constraints = combined_constraints or []

    def set_attribute_constraints(self, attribute_constraints):
        self.attribute_constraints = attribute_constraints

    def set_group_size_constraints(self, min_size, max_size):
        self.group_size_min = min_size
        self.group_size_max = max_size

    def set_group_count_constraints(self, min_count, max_count):
        self.group_count_min = min_count
        self.group_count_max = max_count

    def set_combined_constraints(self, combined_constraints):
        self.combined_constraints = combined_constraints

    def get_attribute_constraints(self):
        return self.attribute_constraints

    def get_group_size_constraints(self):
        return self.group_size_min, self.group_size_max

    def get_group_count_constraints(self):
        return self.group_count_min, self.group_count_max
        
    def get_combined_constraints(self):
        return self.combined_constraints
        
    
    

