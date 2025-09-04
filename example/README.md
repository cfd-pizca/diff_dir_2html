# Example Directory Comparison

This directory contains two example cases (`case1` and `case2`) that demonstrate the functionality of the directory diff tool. The examples show different types of changes including:

- Added files
- Modified files
- Configuration differences
- Code structure changes
- Different feature sets

## Case 1: Basic Calculator

A simple calculator application with basic arithmetic operations:
- Basic arithmetic operations (add, subtract, multiply, divide)
- Simple configuration
- No history tracking
- Basic error handling

## Case 2: Advanced Calculator

An enhanced version of the calculator with additional features:
- All basic operations from Case 1
- Added power operation
- History tracking
- Configuration with more options
- Better error handling
- Dark mode support
- Scientific mode
- Unit conversion (placeholder)

## Key Differences

1. **File Structure**:
   - Both cases have similar directory structures but with different file contents
   - Case 2 has additional features and more robust code organization

2. **Configuration**:
   - Different app names and versions
   - Different default settings
   - Additional features enabled in Case 2

3. **Code**:
   - Different implementation approaches
   - Additional functions and methods in Case 2
   - Enhanced error handling and user feedback

## How to Generate the Diff

To generate an HTML diff between the two cases, run:

```bash
# From the project root
./diff_dir_2html.sh example/case1 example/case2 output.html
```

This will create an HTML file showing all the differences between the two directories, with collapsible sections for easy navigation.
