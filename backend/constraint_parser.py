# parse the csv file into list of constraints

class SchedulingConstraints:
    def __init__(self, attribute_constraints = None, group_size_min = None, group_size_max = None, group_count_min = None, group_count_max = None):
        # create lists of tuples (a, b) where a and b are student names
        self.attribute_constraints = attribute_constraints or {}
        self.group_size_min = group_size_min or 1
        self.group_size_max = group_size_max or None
        self.group_count_min = group_count_min or 1
        self.group_count_max = group_count_max or None
        
    def set_attribute_constraints(self, attribute_constraints):
        """
        Set per-attribute constraints for groups
        attribute_constraints: dict of {attribute_name: {min_per_group: int, max_per_group: int}}
        """
        self.attribute_constraints = attribute_constraints
        
    def set_group_size_constraints(self, min_size, max_size):
        """Set minimum and maximum number of students per group"""
        self.group_size_min = min_size
        self.group_size_max = max_size
        
    def set_group_count_constraints(self, min_count, max_count):
        """Set minimum and maximum number of groups"""
        self.group_count_min = min_count
        self.group_count_max = max_count
        
    def get_attribute_constraints(self):
        """Get attribute constraints"""
        return self.attribute_constraints
        
    def get_group_size_constraints(self):
        """Get group size constraints"""
        return self.group_size_min, self.group_size_max
        
    def get_group_count_constraints(self):
        """Get group count constraints"""
        return self.group_count_min, self.group_count_max
        
    
    

