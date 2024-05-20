// Define a custom error class named 'apiError' that extends the built-in Error class.
class apiError extends Error {
    // The constructor is called when a new instance of 'apiError' is created.
    constructor(
        statusCode,           // The HTTP status code associated with the error.
        message = "something went wrong",  // A default error message if none is provided.
        errors = [],          // An array to hold any additional error details.
        stack = ""            // Optional stack trace information.
    ) {
        // Call the constructor of the parent 'Error' class with the provided message.
        super(message);

        // Set the statusCode property to the provided status code.
        this.statusCode = statusCode;
        // Initialize the data property to null. This can be used to store any additional data.
        this.data = null;
        // Set the message property to the provided message.
        this.message = message;
        // Set the success property to false, indicating that an error has occurred.
        this.success = false;
        // Set the errors property to the provided array of errors.
        this.errors = errors;

        // Check if a stack trace was provided.
        if (stack) {
            // If a stack trace was provided, set the stack property to the provided stack trace.
            this.stack = stack;
        } else {
            // If no stack trace was provided, capture the current stack trace.
            // 'Error.captureStackTrace' is a V8 engine feature that captures the current stack trace.
            // 'this.constructor' refers to the constructor of this class, i.e., 'apiError'.
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

// Export the 'apiError' class so it can be used in other modules/files.
export { apiError };
