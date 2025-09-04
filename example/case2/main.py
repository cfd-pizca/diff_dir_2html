#!/usr/bin/env python3
"""
Enhanced Calculator Application
A simple command-line calculator with basic arithmetic operations.
"""

import json
import sys
from math_operations.calculator import add, subtract, multiply, divide, power

def load_config():
    """Load application configuration with error handling."""
    try:
        with open('config/settings.json', 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        print("Error: Could not find configuration file")
        sys.exit(1)

def get_number(prompt):
    """Get a number from user input with validation."""
    while True:
        try:
            return float(input(prompt))
        except ValueError:
            print("Error: Please enter a valid number")

def show_menu():
    """Display the main menu."""
    print("\nAvailable operations:")
    print("1. Add")
    print("2. Subtract")
    print("3. Multiply")
    print("4. Divide")
    print("5. Power (a^b)")
    print("6. Exit")

def perform_operation(operation, a, b, precision):
    """Perform the requested operation and return the result."""
    if operation == '1':
        return add(a, b)
    elif operation == '2':
        return subtract(a, b)
    elif operation == '3':
        return multiply(a, b)
    elif operation == '4':
        return divide(a, b)
    elif operation == '5':
        return power(a, b)
    return None

def main():
    """Main application entry point."""
    config = load_config()
    print(f"=== {config['app_name']} v{config['version']} ===")
    
    if config.get('features', {}).get('dark_mode', False):
        print("Dark mode: Enabled")
    
    while True:
        show_menu()
        choice = input("\nSelect an operation (1-6): ").strip()
        
        if choice == '6':
            print("\nThank you for using the enhanced calculator. Goodbye!")
            break
            
        if choice not in ['1', '2', '3', '4', '5']:
            print("Error: Invalid choice. Please try again.")
            continue
            
        try:
            a = get_number("\nEnter first number: ")
            b = get_number("Enter second number: ") if choice != '5' else get_number("Enter exponent: ")
            
            result = perform_operation(choice, a, b, config['precision'])
            if result is not None:
                print(f"\nResult: {result:.{config['precision']}f}")
                
        except (ValueError, ZeroDivisionError) as e:
            print(f"\nError: {e}")
        except Exception as e:
            print(f"\nAn unexpected error occurred: {e}")
            
        input("\nPress Enter to continue...")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\nOperation cancelled by user.")
    except Exception as e:
        print(f"\nFatal error: {e}")
        sys.exit(1)
